import prisma from '$lib/server/db';
import { performAiExtraction } from './ai-extraction';
import { SignalEngine } from './signal-engine';
import { OrchestratorEngine } from './orchestrator-engine';
import { ActionQueueEngine } from './action-queue-engine';
import { runExecution } from './section-5-execution';
import { runOutcome } from './section-6-outcome';
import { runFeedback } from './section-7-feedback';
import { env } from '$env/dynamic/private';

export async function processGbpReview(rawPayload: any, origin: string) {
    const receivedAt = new Date();
    const traceId = `trc_${Math.random().toString(36).substring(2, 9)}`;
    const pipelineSteps: string[] = [];

    const log = (msg: string, data?: any) => {
        const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
        const statusIcon = msg.includes('ERROR') ? '🔴' : msg.includes('BLOCKED') ? '🟡' : '🔵';
        
        let entry = `${statusIcon} [${timestamp}] ${msg}`;
        if (data) {
            const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            entry += `\n   ╰─ Context: ${dataStr.replace(/\n/g, '\n   ')}`;
        }
        
        console.log(entry);
        pipelineSteps.push(entry);
    };
    
    log(`--- [PIPELINE START] Trace: ${traceId} ---`);

    try {
        // STEP 1-3: Identification & Mapping
        log(`[Step 1] Raw data received: Provider hands us a review from "${rawPayload.author_name || 'Anonymous'}"`);
        const provider = origin || 'google_business_profile';
        const providerEventName = rawPayload.provider_event_name || 'review.created';
        const eventType = 'review_received';
        const networkCategory = 'Trust';
        log(`[Step 2/3] Official naming: Mapping "${providerEventName}" to "${eventType}"`);

        // STEP 4-5: Normalization
        const reviewId = rawPayload.review_id || rawPayload.reviewId || (rawPayload.name?.split('/').pop());
        const ratingRaw = rawPayload.rating_raw || rawPayload.starRating || 'UNKNOWN';
        
        let ratingNumeric = 0;
        const parsedRating = parseInt(rawPayload.rating || rawPayload.starRating);
        if (!isNaN(parsedRating)) {
            ratingNumeric = parsedRating;
        } else {
            const ratingMap: Record<string, number> = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
            ratingNumeric = ratingMap[ratingRaw.toUpperCase()] || 0;
        }

        const reviewText = rawPayload.comment || rawPayload.review_text || '';
        const occurredAt = new Date(rawPayload.created_time || rawPayload.createTime || receivedAt.toISOString());
        
        log(`[Step 4/5] Tidying up: Normalized rating to ${ratingNumeric} stars`);

        // STEP 6: Relationship Matching
        const locationId = rawPayload.location_id || (rawPayload.name?.split('/')[3]);
        let business = await prisma.business.findFirst({ where: { gbp_location_id: locationId } });

        if (!business) {
            if (locationId === 'gbp_location_1199' || locationId === '456') {
                business = await prisma.business.upsert({
                    where: { business_id: 'biz_apex_001' },
                    update: { gbp_location_id: locationId },
                    create: { business_id: 'biz_apex_001', name: 'Apex Contracting', market_id: 'market_timmins', gbp_location_id: locationId }
                });
            } else if (locationId === 'gbp_location_2200') {
                business = await prisma.business.upsert({
                    where: { business_id: 'biz_lodge_001' },
                    update: { gbp_location_id: locationId },
                    create: { business_id: 'biz_lodge_001', name: 'Lodge Roofing', market_id: 'market_sudbury', gbp_location_id: locationId }
                });
            }
        }
        log(`[Step 6] Finding business: Mapped to "${business?.name || 'Unlinked'}"`);

        // STEP 7: Duplicate Detection
        const existingEvent = await prisma.event.findUnique({ where: { provider_event_id: reviewId } });
        if (existingEvent) {
            log(`[Step 7] Copy check: BLOCKED - Duplicate review ID ${reviewId}`);
            return { success: true, is_duplicate: true, processing_status: 'duplicate_blocked', trace: pipelineSteps.join('\n') };
        }
        log(`[Step 7] Copy check: No previous record found`);

        // STEP 8: AI Extraction (BEFORE Storage)
        let aiResult = null;
        if (reviewText.length > 0) {
            log(`[Step 8] AI Extraction: Identifying sentiment, topics, and service mentions...`);
            try {
                aiResult = await performAiExtraction(`Rating: ${ratingNumeric} Stars\nComment: ${reviewText}`);
                log(`[Step 8] AI extraction completed successfully`);
            } catch (err: any) {
                log(`[Step 8] AI extraction ERROR: ${err.message || err}`);
            }
        } else {
            log(`[Step 8] AI Extraction: SKIPPED (No comment)`);
        }

        // STEP 9: Storage & Handoff Marking
        log(`[Step 9] Writing to log: Saving to database and marking as "Handoff Eligible"`);
        const eventInternalId = crypto.randomUUID();
        
        const event = await prisma.$transaction(async (tx: any) => {
            const evt = await tx.event.create({
                data: {
                    id: eventInternalId,
                    event_id: `evt_${Math.floor(Math.random() * 10000)}`,
                    trace_id: traceId,
                    provider,
                    provider_event_name: providerEventName,
                    provider_event_id: reviewId,
                    event_type: eventType,
                    network_category: networkCategory,
                    business_id: business?.id,
                    business_external_id: business?.business_id,
                    market_id: business?.market_id,
                    gbp_location_id: locationId,
                    review_id: reviewId,
                    review_rating_numeric: ratingNumeric,
                    review_text: reviewText,
                    author_name: rawPayload.author_name || null,
                    occurred_at: occurredAt,
                    received_at: receivedAt,
                    unstructured_text: `Rating: ${ratingNumeric} Stars\nComment: ${reviewText}`,
                    requires_ai_extraction: !!aiResult,
                    ai_extraction_completed: !!aiResult,
                    processing_status: 'handoff_eligible',
                    handoff_eligible: true
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
        }, {
            maxWait: 15000, // Wait up to 15s to get a connection
            timeout: 20000  // Allow up to 20s for the transaction to complete
        });

        // STEP 10-12: Signal Engine (Called immediately after storage)
        const evalResult = await SignalEngine.evaluate(event.id, pipelineSteps);
        
        // STEP 13-15: Orchestrator Decision
        log(`[Step 13] Orchestrator Decision: Selecting the best actions for this review...`);
        const signalCandidates = await prisma.signal.findMany({
            where: { event_id: event.id, status: 'candidate' }
        });
        
        const decisionResult = await OrchestratorEngine.makeDecision(event.id, signalCandidates, evalResult.trace);
        
        // STEP 16: Action Queue + Parameters (Section 4)
        const fullTrace = [...evalResult.trace];
        
        // Add Section 3 (Orchestrator) logs immediately after Sections 1-2
        if (decisionResult?.log?.steps?.length) {
            decisionResult.log.steps.forEach(s => {
                const timestamp = s.timestamp;
                const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
                fullTrace.push(`${statusIcon} [${timestamp}] Section 3 - ${s.status.toUpperCase()} : ${s.message}`);
                if (s.description) {
                    fullTrace.push(`      → ${s.description}`);
                }
            });
        }
        
        let executionResult: any = null;
        let outcomeResult: any = null;
        let feedbackResult: any = null;
        if (decisionResult.decided && decisionResult.decision_id) {
            log(`[Step 16] Action Queue: Parameterizing actions for decision ${decisionResult.decision_id}...`);
            const queueResult = await ActionQueueEngine.processToQueue(decisionResult.decision_id);
            log(`[Step 16] Action Queue: Successfully created ${queueResult.queueItems.length} queue item(s)`);
            
            // Add Section 4 (Queue) logs
            queueResult.log.steps.forEach(s => {
                const timestamp = s.timestamp;
                const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
                fullTrace.push(`${statusIcon} [${timestamp}] Section 4 - ${s.status.toUpperCase()} : ${s.message}`);
                if (s.description) {
                    fullTrace.push(`      → ${s.description}`);
                }
            });
            // STEP 17: Execution (Section 5)
            log(`[Step 17] Execution: Starting Section 5 for decision ${decisionResult.decision_id}...`);
            const mockMode = String(env.AI_MOCK_MODE || '').toLowerCase() === 'true';
            executionResult = await runExecution(
                decisionResult.decision_id,
                event.event_id,
                event.business_id,
                mockMode
            );
            log(`[Step 17] Execution: completed. executed=${executionResult.executed} handoff=${executionResult.handoff_status}`);

            if (executionResult?.log?.steps?.length) {
                executionResult.log.steps.forEach((s: any) => {
                    const timestamp = s.timestamp;
                    const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
                    fullTrace.push(`${statusIcon} [${timestamp}] Section 5 - ${s.status.toUpperCase()} : ${s.message}`);
                    if (s.description) {
                        fullTrace.push(`      → ${s.description}`);
                    }
                });
            }

            // STEP 18: Outcome (Section 6)
            if (executionResult?.executed && executionResult?.handoff_status === 'ready_for_outcome' && executionResult?.execution_output_package) {
                log(`[Step 18] Outcome: Starting Section 6 for decision ${decisionResult.decision_id}...`);
                outcomeResult = await runOutcome(
                    executionResult.execution_output_package,
                    event.event_id,
                    decisionResult.decision_id,
                    event.business_id
                );
                log(`[Step 18] Outcome: completed=${outcomeResult.completed} handoff=${outcomeResult.handoff_status}`);

                if (outcomeResult?.log?.steps?.length) {
                    outcomeResult.log.steps.forEach((s: any) => {
                        const timestamp = s.timestamp;
                        const statusIcon = s.status.includes('fail') ? '🔴' : s.status.includes('warn') ? '🟡' : '🔵';
                        fullTrace.push(`${statusIcon} [${timestamp}] Section 6 - ${s.status.toUpperCase()} : ${s.message}`);
                        if (s.description) {
                            fullTrace.push(`      → ${s.description}`);
                        }
                    });
                }

                if (!outcomeResult?.completed) {
                    log(`[Step 18] Outcome: FAILED stop_reason=${outcomeResult?.stop_reason || 'unknown'}`);
                    log(`--- [PIPELINE END] Trace: ${traceId} ---`);
                    const fullTraceOrdered = fullTrace.sort((a, b) => {
                        const extractTime = (str: string): string => {
                            const match = str.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]/);
                            return match ? match[1] : '';
                        };
                        const timeA = extractTime(a);
                        const timeB = extractTime(b);
                        return timeA.localeCompare(timeB);
                    });

                    return {
                        success: true,
                        event_id: event.event_id,
                        decision_id: decisionResult.decision_id,
                        pipeline_status: 'outcome_failed',
                        execution: executionResult,
                        outcome: outcomeResult,
                        trace: fullTraceOrdered.join('\n')
                    };
                }

                // STEP 19: Feedback (Section 7)
                if (outcomeResult.completed && outcomeResult.handoff_status === 'ready_for_feedback' && outcomeResult.out_pkg) {
                    log(`[Step 19] Feedback: Starting Section 7 for decision ${decisionResult.decision_id}...`);
                    feedbackResult = await runFeedback(
                        outcomeResult.out_pkg,
                        event.event_id,
                        decisionResult.decision_id,
                        event.business_id
                    );
                    log(`[Step 19] Feedback: completed=${feedbackResult.completed} handoff=${feedbackResult.handoff_status}`);

                    if (feedbackResult?.log?.steps?.length) {
                        feedbackResult.log.steps.forEach((s: any) => {
                            const timestamp = s.timestamp;
                            const statusIcon = s.status.includes('fail') ? '🔴' : s.status.includes('warn') ? '🟡' : '🔵';
                            fullTrace.push(`${statusIcon} [${timestamp}] Section 7 - ${s.status.toUpperCase()} : ${s.message}`);
                            if (s.description) {
                                fullTrace.push(`      → ${s.description}`);
                            }
                        });
                    }
                }
            } else {
                log('[Step 18] Outcome: SKIPPED (Section 5 did not hand off ready_for_outcome)');
            }
        } else {
            log(`[Step 16] Action Queue: SKIPPED (No decision made)`);
        }

        log(`--- [PIPELINE END] Trace: ${traceId} ---`);

        // Sort fullTrace by timestamp to ensure chronological order
        const fullTraceOrdered = fullTrace.sort((a, b) => {
            const extractTime = (str: string): string => {
                const match = str.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]/);
                return match ? match[1] : '';
            };
            const timeA = extractTime(a);
            const timeB = extractTime(b);
            return timeA.localeCompare(timeB);
        });

        const finalTrace = fullTraceOrdered.join('\n');

        // Persist logs to Event for historical replay
        try {
            await prisma.event.update({
                where: { id: eventInternalId },
                data: {
                    unstructured_text: `Rating: ${ratingNumeric} Stars\nComment: ${reviewText}\n\n--- PIPELINE LOGS ---\n` + finalTrace
                }
            });
        } catch (e) {
            console.error('Failed to save pipeline logs to Event', e);
        }

        return { 
            success: true, 
            event_id: event.event_id,
            decision_id: decisionResult.decision_id,
            ai_protocol: aiResult?._protocol || null,
            execution: executionResult,
            outcome: outcomeResult,
            feedback: feedbackResult,
            decision: decisionResult,
            evaluation: evalResult,
            trace: finalTrace
        };

    } catch (err) {
        log(`[GBP Pipeline Error] ${err}`);
        return { success: false, error: 'Internal processing error', trace: pipelineSteps.join('\n') };
    }
}
