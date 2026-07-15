import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';
import { handleTelnyxVoiceWebhook } from '$lib/server/voice-handler';

/**
 * PHASE 1 — Telnyx Foundation & Call Event Logging
 */
export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const body = await request.json();
        const eventType = body.data?.event_type || body.event_type || 'unknown';
        const payload = body.data?.payload || body.payload || body;
        const callId = payload.call_control_id || payload.call_id;

        console.log(`[Telnyx A2P Webhook] ${eventType} | Call ID: ${callId}`);

        // Task 1.2 — Raw Webhook Logging
        await prisma.rawWebhookLog.create({
            data: {
                provider: 'telnyx',
                event_type: eventType,
                external_id: callId,
                raw_payload: body
            }
        });

        // Task 1.6 — Idempotency Guard
        const existingLogCount = await prisma.rawWebhookLog.count({
            where: {
                external_id: callId,
                event_type: eventType,
                received_at: { lt: new Date() }
            }
        });

        if (existingLogCount > 1) {
            console.log(`[Telnyx A2P] Duplicate skipped: ${callId} | ${eventType}`);
            return json({ success: true, status: 'duplicate_skipped' });
        }

        // --- WEBHOOK ROUTING ---

        // Task 1.4 — Call Event Record Creation
        if (eventType === 'call.initiated') {
            const callerId = payload.from;
            const calledNumber = payload.to;

            // Task 1.5 — Caller Profile Lookup
            let profileId: string | null = null;
            if (callerId) {
                const profile = await prisma.customerProfile.findFirst({
                    where: { phone_number: callerId }
                });
                profileId = profile?.id || null;
                if (profile) {
                    console.log(`[Telnyx A2P] Profile linked: ${profile.display_name} for ${callerId}`);
                } else {
                    console.log(`[Telnyx A2P] Anonymous entry: ${callerId}`);
                }
            }

            await prisma.callEvent.create({
                data: {
                    call_event_id: `ce_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    call_id: callId,
                    caller_id: callerId,
                    called_number: calledNumber,
                    profile_id: profileId,
                    call_outcome: 'initiated'
                }
            });
            
            // NOTE: Task 2.1 (IVR) would normally happen here by returning TeXML.
            // For this phase, we just acknowledge.
            return json({ success: true, status: 'call_logged' });
        }

        // Task 3.1 — Auto-Start Recording on Call Connection
        if (eventType === 'call.answered') {
            await prisma.callEvent.update({
                where: { call_id: callId },
                data: { call_outcome: 'answered' }
            });
            // TODO: In production, call Telnyx API to start recording
            console.log(`[Telnyx A2P] Call answered, starting recording logic for ${callId}`);
        }

        // Task 4.2 — Voicemail Capture
        if (eventType === 'call.recording.saved' && payload.voicemail === true) {
            const recordingUrl = payload.recording_url;
            const callEvent = await prisma.callEvent.findUnique({ where: { call_id: callId } });

            if (callEvent) {
                const voicemailId = `vm_${Date.now()}`;
                await prisma.voicemail.create({
                    data: {
                        voicemail_id: voicemailId,
                        call_event_id: callEvent.id,
                        profile_id: callEvent.profile_id,
                        recording_url: recordingUrl,
                        transcript_status: 'pending'
                    }
                });

                // PHASE 4/5 Integration -> Trigger Transcription & AI Analysis
                // In Phase 4.3, we'd call Deepgram.
                // For now, if we have a transcript (mocked for Phase 4-5 test), we feed Unified Pipeline.
            }
        }

        // --- PIPELINE HANDOFF ---

        // Task: Connect call transcriptions to the Unified Pipeline
        if (eventType === 'call.transcription') {
            console.log(`[Telnyx A2P] Handoff to Voice Handler for transcription: ${callId}`);
            const result = await handleTelnyxVoiceWebhook(body, url.toString());
            return json({ success: true, handoff: 'voice_handler', event_id: result.event_id });
        }

        return json({ success: true });

    } catch (err: any) {
        console.error('[Telnyx A2P Webhook Error]', err);
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
