import prisma from './db';
import { performAiExtraction } from './ai-extraction';
import { SignalEngine } from './signal-engine';
import { OrchestratorEngine } from './orchestrator-engine';
import { ActionQueueEngine } from './action-queue-engine';
import { runExecution } from './section-5-execution';
import { runOutcome } from './section-6-outcome';
import { runFeedback } from './section-7-feedback';

import { env } from '$env/dynamic/private';

export interface PipelinePayload {
    provider: string;
    event_type: string;
    external_id: string; // unique ID from provider (review_id, call_id, etc)
    business_id?: string;
    business_external_id?: string;
    customer_phone?: string;
    customer_email?: string;
    customer_name?: string;
    session_id?: string;  // pixel session — used for progressive profile resolution
    text_content: string;
    rating?: number;
    occurred_at?: Date;
    metadata?: any;
}

export class UnifiedPipelineEngine {
    static async process(payload: PipelinePayload) {
        const receivedAt = new Date();
        const traceId = `trc_${Math.random().toString(36).substring(2, 9)}`;
        const pipelineSteps: string[] = [];

        const log = (msg: string, data?: any) => {
            const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
            const statusIcon = msg.includes('ERROR') ? '🔴' : (msg.includes('BLOCKED') || msg.includes('SUPPRESSED')) ? '🟡' : '🔵';
            
            let entry = `${statusIcon} [${timestamp}] ${msg}`;
            if (data) {
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                entry += `\n   ╰─ Context: ${dataStr.replace(/\n/g, '\n   ')}`;
            }
            
            console.log(entry);
            pipelineSteps.push(entry);
        };

        log(`--- [UNIFIED PIPELINE START] Provider: ${payload.provider} | Trace: ${traceId} ---`);

        try {
            // STEP 1: Identification & Mapping
            log(`[Step 1] Data received from ${payload.provider} for "${payload.customer_name || 'Anonymous'}"`);
            
            // STEP 2: Business Resolution
            let business = null;
            if (payload.business_id) {
                // Only try to find by ID if it's a valid UUID to avoid Prisma errors
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.business_id);
                if (isUuid) {
                    business = await prisma.business.findUnique({ where: { id: payload.business_id } });
                }
            } 
            
            if (!business && payload.business_external_id) {
                business = await prisma.business.findUnique({ where: { business_id: payload.business_external_id } });
            }

            // FALLBACK: Default to first business if still null (ensures orchestrator doesn't fail)
            if (!business) {
                business = await prisma.business.findFirst();
                if (business) {
                    log(`[Step 3] Identification: Using fallback business: ${business.name} (${business.business_id})`);
                } else {
                    log(`[Step 3] Identification: WARNING - No businesses found in database!`);
                }
            }
            
            if (!business) {
                log(`[Step 2] Business resolution ERROR: Could not find business for ${payload.business_external_id || payload.business_id}`);
                return { success: false, error: 'business_not_found', trace: pipelineSteps.join('\n') };
            }
            log(`[Step 2] Business resolved: ${business.name} (${business.business_id})`);

            // STEP 3: Identity Resolution (Progressive Profile Binding)
            // Resolution order:
            //   1. Session anchor  — find a profile already linked to this pixel session
            //   2. Contact match   — find by phone OR email
            //   3. Create new      — first time we've seen this person
            // Merge rule: fill-in-blanks first, then allow explicit updates.
            //   • Empty field → always fill it in
            //   • Name       → only upgrade to a longer (more complete) value
            //   • Phone/email → update if the value changes (progressive enrichment)
            let customerProfile = null;
            const hasIdentity = !!(payload.customer_phone || payload.customer_email || payload.customer_name);

            if (hasIdentity) {
                log(`[Step 3] Identity Resolution: Attempting progressive profile binding...`);

                // 3a. Session-first lookup — anchor to whatever profile this session has seen before
                if (payload.session_id) {
                    const sessionEvent = await prisma.event.findFirst({
                        where: {
                            customer_profile_id: { not: null },
                            OR: [
                                { unstructured_text: { contains: `"session_id":"${payload.session_id}"` } },
                                { unstructured_text: { contains: `"sessionId":"${payload.session_id}"` } }
                            ]
                        },
                        include: { customer_profile: true },
                        orderBy: { created_at: 'desc' }
                    });
                    if (sessionEvent?.customer_profile) {
                        customerProfile = sessionEvent.customer_profile;
                        log(`[Step 3] Session anchor found: linked to "${customerProfile.display_name || 'Customer'}" via session_id`);
                    }
                }

                // 3b. Contact match — find by phone OR email if session had no linked profile yet
                if (!customerProfile && (payload.customer_phone || payload.customer_email)) {
                    customerProfile = await prisma.customerProfile.findFirst({
                        where: {
                            business_id: business.id,
                            OR: [
                                payload.customer_phone ? { phone_number: payload.customer_phone } : null,
                                payload.customer_email ? { email: payload.customer_email } : null
                            ].filter(Boolean) as any
                        }
                    });
                    if (customerProfile) {
                        log(`[Step 3] Contact match: found existing profile for "${customerProfile.display_name || 'Customer'}"`);
                    }
                }

                if (customerProfile) {
                    // Progressive merge: only add/improve, never blank out
                    const updateData: any = {};

                    // Phone: fill if empty, or update if explicitly changed
                    if (payload.customer_phone) {
                        if (!customerProfile.phone_number) {
                            updateData.phone_number = payload.customer_phone;  // fill blank
                        } else if (payload.customer_phone !== customerProfile.phone_number) {
                            updateData.phone_number = payload.customer_phone;  // explicit change
                        }
                    }

                    // Email: fill if empty, or update if explicitly changed
                    if (payload.customer_email) {
                        if (!customerProfile.email) {
                            updateData.email = payload.customer_email;  // fill blank
                        } else if (payload.customer_email !== customerProfile.email) {
                            updateData.email = payload.customer_email;  // explicit change
                        }
                    }

                    // Name: fill if empty, or upgrade to longer (more complete) value
                    if (payload.customer_name) {
                        const existingName = customerProfile.display_name || '';
                        const newName = payload.customer_name.trim();
                        if (!existingName || newName.length > existingName.length) {
                            updateData.display_name = newName;
                            updateData.first_name = newName.split(' ')[0];
                        }
                    }

                    if (Object.keys(updateData).length > 0) {
                        customerProfile = await prisma.customerProfile.update({
                            where: { id: customerProfile.id },
                            data: updateData
                        });
                        log(`[Step 3] Profile enriched: ${Object.keys(updateData).join(', ')} updated.`);
                    } else {
                        log(`[Step 3] Profile unchanged: no new information to add.`);
                    }
                } else {
                    // 3c. First time — create a new profile
                    customerProfile = await prisma.customerProfile.create({
                        data: {
                            business_id: business.id,
                            phone_number: payload.customer_phone || null,
                            email: payload.customer_email || null,
                            display_name: payload.customer_name || null,
                            first_name: payload.customer_name?.split(' ')[0] || null
                        }
                    });
                    log(`[Step 3] New profile created for "${payload.customer_name || payload.customer_email || payload.customer_phone || 'Anonymous'}"`);
                }
            } else {
                log(`[Step 3] Identity Resolution: SKIPPED (no phone, email, or name provided)`);
            }

            // STEP 4: Duplicate / Suppression Logic (Identity-Based & Content-Based)
            let isDuplicate = false;
            let isSuppressed = false;
            let suppressionReason = '';
            let similarityScore = 0;

            const isSimulation = payload.metadata?.is_simulation === true;
            const providerEventId = payload.external_id;
            const existingEvent = !isSimulation ? await prisma.event.findUnique({ where: { provider_event_id: providerEventId } }) : null;
            
            if (existingEvent) {
                log(`[Step 4] Suppression: BLOCKED - Duplicate Provider Event ID ${providerEventId}`);
                isDuplicate = true;
                suppressionReason = 'duplicate_provider_id';
            }

            if (!isDuplicate && customerProfile) {
                // Identity-based Suppression (window: 24 hours for rapid-fire duplicates)
                const identityWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const recentEventsFromIdentity = await prisma.event.findFirst({
                    where: {
                        customer_profile_id: customerProfile.id,
                        created_at: { gte: identityWindow }
                    }
                });

                if (recentEventsFromIdentity) {
                    log(`[Step 4] Suppression: BLOCKED - Identity-based suppression (rapid duplicate within 24 hours)`);
                    isSuppressed = true;
                    suppressionReason = 'identity_suppressed';
                }

                // Content-based Duplicacy Check (window: e.g. 24 hours for similar content)
                if (payload.text_content && payload.text_content.length > 3) {
                    const contentWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    const recentEventsFromProfile = await prisma.event.findMany({
                        where: {
                            customer_profile_id: customerProfile.id,
                            created_at: { gte: contentWindow },
                            unstructured_text: { not: null }
                        },
                        orderBy: { created_at: 'desc' },
                        take: 10
                    });

                    const cleanNewContent = UnifiedPipelineEngine.extractCoreContent(payload.text_content);

                    for (const pastEvent of recentEventsFromProfile) {
                        const pastText = pastEvent.unstructured_text || '';
                        const cleanPastContent = UnifiedPipelineEngine.extractCoreContent(pastText);
                        
                        const similarity = UnifiedPipelineEngine.calculateSimilarity(cleanNewContent, cleanPastContent);
                        
                        if (similarity > 0.85) {
                            log(`[Step 4] Suppression: BLOCKED - Duplicate content detected (${Math.round(similarity * 100)}% similarity) with event ${pastEvent.event_id}`);
                            isDuplicate = true;
                            similarityScore = similarity;
                            suppressionReason = 'duplicate_content';
                            break;
                        }
                    }
                }
            }

            if (!isDuplicate && !isSuppressed) {
                log(`[Step 4] Suppression: CLEAN - No previous record, identity block, or similar content found`);
            }

            // STEP 5: AI Extraction (SKIP if duplicate)
            let aiResult = null;
            if (!isDuplicate && !isSuppressed) {
                if (payload.text_content.length > 0) {
                    log(`[Step 5] AI Extraction: Identifying sentiment, topics, and intent...`);
                    try {
                        const extractionInput = payload.rating 
                            ? `Rating: ${payload.rating} Stars\nContent: ${payload.text_content}`
                            : payload.text_content;
                        
                        log(`[Step 5] AI Extraction: Sending text to AI for analysis...`, extractionInput);
                        aiResult = await performAiExtraction(extractionInput);
                        log(`[Step 5] AI Extraction Success:`, {
                            problem: aiResult.contains_problem,
                            quote: aiResult.contains_quote_request,
                            callback: aiResult.contains_callback_request,
                            emergency: aiResult.contains_emergency_keywords,
                            contact: aiResult.requested_contact_method,
                            sentiment: aiResult.sentiment,
                            summary: aiResult.summary,
                            service: aiResult.service_requested,
                            confidence: aiResult.confidence_score,
                            topics: [...aiResult.praise_topics, ...aiResult.complaint_topics]
                        });
                    } catch (err: any) {
                        log(`[Step 5] AI extraction ERROR: ${err.message || err}`);
                    }
                } else {
                    log(`[Step 5] AI Extraction: SKIPPED (No content)`);
                }
            } else {
                log(`[Step 5] AI Extraction: SKIPPED (Event is duplicate/suppressed)`);
            }

            // STEP 6: Persistence
            log(`[Step 6] Storage: Saving event and marking as "Handoff Eligible"`);
            const eventInternalId = crypto.randomUUID();
            
            const event = await prisma.$transaction(async (tx: any) => {
                const evt = await tx.event.create({
                    data: {
                        id: eventInternalId,
                        event_id: `evt_${Math.floor(Math.random() * 100000)}`,
                        trace_id: traceId,
                        provider: payload.provider,
                        provider_event_name: payload.event_type,
                        provider_event_id: payload.external_id,
                        event_type: payload.event_type,
                        network_category: payload.provider.includes('telnyx') ? 'Communication' : 'Trust',
                        business_id: business?.id,
                        business_external_id: business?.business_id,
                        market_id: business?.market_id,
                        customer_profile_id: customerProfile?.id,
                        author_name: payload.customer_name || customerProfile?.display_name || null,
                        review_rating_numeric: payload.rating || null,
                        review_text: payload.text_content,
                        occurred_at: payload.occurred_at || receivedAt,
                        received_at: receivedAt,
                        unstructured_text: payload.metadata ? JSON.stringify(payload.metadata) : payload.text_content,
                        requires_ai_extraction: !!aiResult,
                        ai_extraction_completed: !!aiResult,
                        is_duplicate: isDuplicate,
                        processing_status: isDuplicate ? 'duplicate_blocked' : (isSuppressed ? 'identity_suppressed' : 'handoff_eligible'),
                        handoff_eligible: !isDuplicate && !isSuppressed
                    }
                });

                if (aiResult) {
                    await tx.enrichment.create({
                        data: {
                            id: crypto.randomUUID(),
                            event_id: eventInternalId,
                            ai_sentiment: aiResult.sentiment,
                            ai_sentiment_score: aiResult.confidence_score,
                            ai_praise_detected: aiResult.praise_topics.length > 0,
                            ai_complaint_detected: aiResult.complaint_topics.length > 0,
                            ai_praise_topics: aiResult.praise_topics,
                            ai_complaint_topics: aiResult.complaint_topics,
                            ai_primary_praise_topic: aiResult.praise_topics[0] || null,
                            ai_primary_complaint_topic: aiResult.complaint_topics[0] || null,
                            ai_service_mentioned: aiResult.service_requested,
                            ai_customer_experience_issue: aiResult.contains_problem ? 'problem_detected' : null,
                            ai_urgency_level: aiResult.urgency_level,
                            ai_summary: aiResult.summary,
                            ai_confidence_score: aiResult.confidence_score,

                            // New Deterministic Facts
                            ai_contains_problem: aiResult.contains_problem,
                            ai_contains_quote_request: aiResult.contains_quote_request,
                            ai_contains_callback_request: aiResult.contains_callback_request,
                            ai_contains_emergency_keywords: aiResult.contains_emergency_keywords,
                            ai_requested_contact_method: aiResult.requested_contact_method,
                            ai_requested_action: aiResult.requested_action,
                            ai_detected_keywords: aiResult.detected_keywords,

                            sentiment: aiResult.sentiment,
                            summary: aiResult.summary,
                            urgency_level: aiResult.urgency_level,
                            service_requested: aiResult.service_requested,
                            confidence_score: aiResult.confidence_score
                        }
                    });
                }
                return evt;
            });

            // STEP 7-16: Downstream Processing (SKIP if duplicate/suppressed)
            let finalTrace = pipelineSteps.join('\n');
            let evalResult: any = null;
            let decisionResult: any = null;
            let executionResult: any = null;
            let outcomeResult: any = null;
            let feedbackResult: any = null;

            if (!isDuplicate && !isSuppressed) {
                // STEP 7-9: Signal Engine
                evalResult = await SignalEngine.evaluate(event.id, pipelineSteps);
                const fullTrace = [...evalResult.trace];

                // STEP 10-12: Orchestrator Decision
                const signalCandidates = await prisma.signal.findMany({
                    where: { event_id: event.id, status: 'candidate' }
                });
                
                decisionResult = await OrchestratorEngine.makeDecision(event.id, signalCandidates, evalResult.trace);
                
                if (decisionResult?.log?.steps?.length) {
                    decisionResult.log.steps.forEach(s => {
                        const timestamp = s.timestamp;
                        const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
                        fullTrace.push(`${statusIcon} [${timestamp}] Section 3 - ${s.status.toUpperCase()} : ${s.message}`);
                    });
                }

                // STEP 13-16: Execution & Outcome (The "A2P" Layer Integration)
                if (decisionResult.decided && decisionResult.decision_id) {
                    log(`[Step 13] Action Queue: Parameterizing for A2P layer...`);
                    const queueResult = await ActionQueueEngine.processToQueue(decisionResult.decision_id);
                    
                    queueResult.log.steps.forEach(s => {
                        const timestamp = s.timestamp;
                        const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
                        fullTrace.push(`${statusIcon} [${timestamp}] Section 4 - ${s.status.toUpperCase()} : ${s.message}`);
                    });

                    log(`[Step 14] Execution (A2P): Running execution module...`);
                    const mockMode = String(env.AI_MOCK_MODE || '').toLowerCase() === 'true';
                    executionResult = await runExecution(
                        decisionResult.decision_id,
                        event.event_id,
                        event.business_id as string,
                        mockMode
                    );

                    if (executionResult?.log?.steps?.length) {
                        executionResult.log.steps.forEach((s: any) => {
                            const timestamp = s.timestamp;
                            const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
                            fullTrace.push(`${statusIcon} [${timestamp}] Section 5 - ${s.status.toUpperCase()} : ${s.message}`);
                        });
                    }

                    // Handoff to Outcome (A2P logging)
                    if (executionResult?.executed && executionResult?.handoff_status === 'ready_for_outcome') {
                        outcomeResult = await runOutcome(
                            executionResult.execution_output_package,
                            event.event_id,
                            decisionResult.decision_id,
                            event.business_id as string
                        );

                        if (outcomeResult?.log?.steps?.length) {
                            outcomeResult.log.steps.forEach((s: any) => {
                                const timestamp = s.timestamp;
                                const statusIcon = s.status.includes('fail') ? '🔴' : s.status.includes('warn') ? '🟡' : '🔵';
                                fullTrace.push(`${statusIcon} [${timestamp}] Section 6 - ${s.status.toUpperCase()} : ${s.message}`);
                            });
                        }

                        if (outcomeResult.completed) {
                            feedbackResult = await runFeedback(
                                outcomeResult.out_pkg,
                                event.event_id,
                                decisionResult.decision_id,
                                event.business_id as string
                            );

                            if (feedbackResult?.log?.steps?.length) {
                                feedbackResult.log.steps.forEach((s: any) => {
                                    const timestamp = s.timestamp;
                                    const statusIcon = s.status.includes('fail') ? '🔴' : s.status.includes('warn') ? '🟡' : '🔵';
                                    fullTrace.push(`${statusIcon} [${timestamp}] Section 7 - ${s.status.toUpperCase()} : ${s.message}`);
                                });
                            }
                        }
                    }
                }

                log(`--- [UNIFIED PIPELINE END] Trace: ${traceId} ---`);
                finalTrace = fullTrace.join('\n');
            } else {
                log(`[Step 7-16] Downstream Engine: SKIPPED (Event marked as duplicate or suppressed)`);
                log(`--- [UNIFIED PIPELINE END] Trace: ${traceId} ---`);
                finalTrace = pipelineSteps.join('\n');
            }

            // Persist logs to Event for historical replay
            try {
                await prisma.event.update({
                    where: { id: eventInternalId },
                    data: {
                        unstructured_text: (payload.metadata ? JSON.stringify(payload.metadata) : payload.text_content) + '\n\n--- PIPELINE LOGS ---\n' + finalTrace
                    }
                });
            } catch (e) {
                console.error('Failed to save pipeline logs to Event', e);
            }

            if (isDuplicate || isSuppressed) {
                return { 
                    success: true, 
                    event_id: event.event_id, 
                    is_duplicate: isDuplicate,
                    is_suppressed: isSuppressed,
                    processing_status: isDuplicate ? 'duplicate_blocked' : 'identity_suppressed',
                    trace: finalTrace 
                };
            }

            return { 
                success: true, 
                event_id: event.event_id, 
                decision_id: decisionResult?.decision_id || null,
                ai_protocol: aiResult?._protocol || null,
                execution: executionResult,
                outcome: outcomeResult,
                feedback: feedbackResult,
                decision: decisionResult,
                evaluation: evalResult,
                trace: finalTrace 
            };
        } catch (err: any) {
            log(`[Unified Pipeline Error] ${err.message || err}`);
            return { success: false, error: 'Internal processing error', trace: pipelineSteps.join('\n') };
        }
    }

    private static extractCoreContent(text: string): string {
        if (!text) return '';
        
        // 1. Strip pipeline logs if present (logs contain unique timestamps/IDs that break similarity)
        let cleanText = text;
        if (text.includes('--- PIPELINE LOGS ---')) {
            cleanText = text.split('--- PIPELINE LOGS ---')[0].trim();
        }

        // 2. If it's a voice call with header metadata, extract the transcription part
        if (cleanText.includes('Transcription:')) {
            const parts = cleanText.split('Transcription:');
            cleanText = parts[parts.length - 1];
        }
        
        return cleanText.trim();
    }

    private static calculateSimilarity(s1: string, s2: string): number {
        if (!s1 || !s2) return 0;
        // Strip punctuation, lowercase, and split into words. 
        // We allow words length 2+ for better short message matching.
        const prepare = (s: string) => s.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(v => v.length >= 2);
        
        const w1 = prepare(s1);
        const w2 = prepare(s2);
        
        if (w1.length === 0 || w2.length === 0) {
            // If we have no words (e.g. very short symbols), do a direct literal comparison
            return s1.trim().toLowerCase() === s2.trim().toLowerCase() ? 1.0 : 0;
        }

        const set1 = new Set(w1);
        const set2 = new Set(w2);
        
        const intersect = w1.filter(w => set2.has(w));
        
        // Dice coefficient: (2 * |X ∩ Y|) / (|X| + |Y|)
        return (intersect.length * 2) / (w1.length + w2.length);
    }
}
