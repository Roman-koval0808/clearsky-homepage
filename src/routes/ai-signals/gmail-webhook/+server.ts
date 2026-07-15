import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import { G_CLIENT_ID, G_CLIENT_SECRET, G_REFRESH_TOKEN } from '$env/static/private';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

// Instantiate the Google Auth Client
const oauth2Client = new google.auth.OAuth2(G_CLIENT_ID, G_CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: G_REFRESH_TOKEN });
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

/** Keyword filter — only process emails that mention "clearsky" (case-insensitive) */
const CLEARSKY_PATTERN = /clearsky/i;

/**
 * In-process deduplication guard.
 *
 * Google Pub/Sub fires one notification per history-entry, so a single
 * incoming email can produce 2–4 simultaneous POST requests all pointing
 * at the same Gmail message. We record each Gmail message ID the moment
 * we decide to process it (before awaiting the pipeline) so every
 * concurrent racing request sees the entry and bails out immediately —
 * no wasted AI calls, no DB unique-constraint crashes.
 *
 * TTL: entries expire after 10 minutes. A new email to the same thread
 * that arrives more than 10 minutes later will be processed normally.
 */
const DEDUP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const processedMessages = new Map<string, number>(); // messageId → timestamp

function isDuplicate(gmailId: string): boolean {
    const seen = processedMessages.get(gmailId);
    if (!seen) return false;
    // Expired — treat as fresh
    if (Date.now() - seen > DEDUP_TTL_MS) {
        processedMessages.delete(gmailId);
        return false;
    }
    return true;
}

function markProcessed(gmailId: string): void {
    processedMessages.set(gmailId, Date.now());
    // Prune stale entries to keep memory bounded (runs O(n) only when the
    // map grows large, which is rare given low email volume)
    if (processedMessages.size > 500) {
        const cutoff = Date.now() - DEDUP_TTL_MS;
        for (const [id, ts] of processedMessages) {
            if (ts < cutoff) processedMessages.delete(id);
        }
    }
}

/**
 * Walk the Gmail MIME payload tree and return the plain-text body.
 * Gmail encodes bodies as base64url. Simple emails have a single
 * `payload.body.data`; multipart emails nest parts recursively.
 */
function extractPlainTextBody(payload: any): string {
    if (!payload) return '';

    // Simple (non-multipart) message — body is directly on the payload
    if (payload.mimeType?.startsWith('text/plain') && payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64url').toString('utf-8').trim();
    }

    // Multipart — recurse into parts, preferring text/plain over text/html
    if (payload.parts && Array.isArray(payload.parts)) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                return Buffer.from(part.body.data, 'base64url').toString('utf-8').trim();
            }
        }
        // No direct text/plain — go one level deeper (e.g. multipart/alternative inside multipart/mixed)
        for (const part of payload.parts) {
            const nested = extractPlainTextBody(part);
            if (nested) return nested;
        }
    }

    return '';
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const body = await request.json();

        // 1. Validate that the incoming post has the correct Google Pub/Sub framework wrapper
        if (!body || !body.message || !body.message.data) {
            return json({ error: 'Missing Pub/Sub wrapper structure' }, { status: 400 });
        }

        // 2. Extract and decode the base64 Google notification payload
        const encodedData = body.message.data;
        const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
        const { emailAddress, historyId } = JSON.parse(decodedString);

        console.log(`[Gmail Webhook] Notification received for: ${emailAddress} (History: ${historyId})`);

        // 3. Pull the single latest unread email message
        const listRes = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 1,
            q: 'is:unread'
        });

        const messages = listRes.data.messages || [];

        if (messages.length > 0) {
            const gmailMessageId = messages[0].id!;

            // 4. ── DEDUPLICATION GUARD ────────────────────────────────────────────────
            //    Mark this Gmail message ID as processing BEFORE any async work so
            //    concurrent burst notifications from the same Pub/Sub push see it
            //    and exit without touching the AI pipeline or the database.
            if (isDuplicate(gmailMessageId)) {
                console.log(`[Gmail Webhook] Dedup hit — message ${gmailMessageId} already processing. Skipping.`);
                return json({ status: 'skipped', reason: 'duplicate_notification' }, { status: 200 });
            }
            markProcessed(gmailMessageId); // ← registered before any await

            // 5. Fetch full payload of the matched message
            const emailContent = await gmail.users.messages.get({
                userId: 'me',
                id: gmailMessageId
            });

            const snippet = emailContent.data.snippet ?? '';
            const headers = emailContent.data.payload?.headers ?? [];

            // Decode the real email body — snippet is only ~200 chars and cuts off content
            const bodyText = extractPlainTextBody(emailContent.data.payload) || snippet;

            const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value ?? 'No Subject';
            const from    = headers.find(h => h.name?.toLowerCase() === 'from')?.value    ?? 'Unknown Sender';
            const msgId   = headers.find(h => h.name?.toLowerCase() === 'message-id')?.value ?? `gmail_${gmailMessageId}`;

            console.log(`[Gmail Webhook] Parsed email — From: ${from} | Subject: ${subject}`);
            console.log(`[Gmail Webhook] Body preview: ${bodyText.slice(0, 120)}...`);

            // 6. ── KEYWORD FILTER ──────────────────────────────────────────────────────
            //    Only forward emails that contain the word "clearsky" in the subject OR
            //    full body. Everything else is acknowledged but ignored.
            const combinedText = `${subject} ${bodyText}`;
            if (!CLEARSKY_PATTERN.test(combinedText)) {
                console.log(`[Gmail Webhook] Skipped — "clearsky" not found in subject/body. Subject: "${subject}"`);
                return json({ status: 'skipped', reason: 'keyword_filter_not_matched' }, { status: 200 });
            }

            console.log(`[Gmail Webhook] ✅ "clearsky" detected — routing into AI pipeline.`);

            // 7. ── AI PIPELINE ─────────────────────────────────────────────────────────
            //    Hand off to the three-stage pipeline:
            //    Event Intake → Signal Detection → Orchestrator Decision
            const unstructuredText = `From: ${from}\nSubject: ${subject}\n\n${bodyText}`;

            const result = await UnifiedPipelineEngine.process({
                provider:       'email_provider',
                event_type:     'email_received',
                external_id:    msgId,
                customer_phone: null,
                customer_name:  null,
                text_content:   bodyText,  // full decoded body, not the truncated snippet
                metadata: {
                    source:     'gmail_webhook',
                    from_email: from,
                    subject,
                    full_text:  unstructuredText
                }
            });

            if (result.is_duplicate) {
                console.log(`[Gmail Webhook] Duplicate event blocked: ${result.event_id}`);
            } else if (result.is_suppressed) {
                console.log(`[Gmail Webhook] Suppressed identity: ${result.event_id}`);
            } else {
                console.log(`[Gmail Webhook] Pipeline complete — event_id: ${result.event_id}`);
            }
        }

        // 8. CRITICAL: Always return 200 so Google Pub/Sub confirms receipt
        return json({ status: 'success' }, { status: 200 });

    } catch (error) {
        console.error('[Gmail Webhook Error]:', error);
        return json({ error: 'Internal server route execution error' }, { status: 500 });
    }
}