import prisma from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';
import { generateReviewReplyDraft } from '$lib/server/ai-review-reply';

export interface ExecutionRecord {
    execution_id: string;
    execution_row_id: string;
    action_queue_id: string;
    action_id: string;
    action_name?: string;
    execution_mode: string;
    execution_status: string;
    requires_human_approval: boolean;
    approval_owner: string | null;
    approval_status: string | null;
    approval_package_id?: string | null;
    posted_externally: boolean;
    generated_output?: any;
    failure_reason?: string | null;
    retry_count?: number;
}

export interface ExecutionResult {
    executed: boolean;
    execution_records: ExecutionRecord[];
    blocked_audit_only: any[];
    approval_package_id: string | null;
    handoff_status: string;
    pipeline_status: string;
    stop_reason: string | null;
    execution_output_package?: any;
    log?: ExecutionLog;
}

export class ExecutionLog {
    decision_id: string;
    steps: { status: string; message: string; timestamp: string; description?: string }[] = [];

    constructor(decision_id: string) {
        this.decision_id = decision_id;
    }

    step(status: string, message: string, description?: string) {
        const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
        const statusIcon = status.includes('error') ? '🔴' : (status.includes('blocked') || status.includes('warning')) ? '🟡' : '🔵';
        console.log(`${statusIcon} [${timestamp}] Section 5 - ${status.toUpperCase()} : ${message}`);
        if (description) {
            console.log(`      → ${description}`);
        }
        this.steps.push({ status, message, timestamp, description });
    }
}

const KNOWN_MODES = ['approval_required', 'automatic', 'manual', 'observe_only'];
const VALID_QUEUE_STATUSES = ['pending_approval', 'ready_for_execution'];

function isEmptyParams(params: any) {
    if (params === null || params === undefined) return true;
    if (typeof params !== 'object') return true;
    return Object.keys(params).length === 0;
}

function shortId(prefix: string) {
    return `${prefix}_${uuidv4().replace(/-/g, '').substring(0, 10)}`;
}

async function receiveQueueOutput(decisionId: string, eventId: string, log: ExecutionLog) {
    const decision = await prisma.orchestratorDecision.findUnique({
        where: { decision_id: decisionId },
        include: {
            event: { include: { enrichments: true, business: true } },
            action_queue: true
        }
    });

    if (!decision) {
        log.step('error', `Decision not found: ${decisionId}`, 'Section 5 cannot start without a valid orchestrator decision.');
        return { error: 'decision_not_found' };
    }

    const queueRecords = (decision.action_queue as any[])
        .filter((r: any) => r.execution_lane !== 'blocked')
        .sort((a: any, b: any) => (a.created_at?.getTime() || 0) - (b.created_at?.getTime() || 0));

    if (queueRecords.length === 0) {
        log.step('warning', 'No queue records found for decision', 'Section 4 produced no actionable queue records for this decision.');
        return { error: 'no_queue_records' };
    }

    for (const record of queueRecords) {
        const existing = await prisma.actionExecution.findFirst({
            where: { action_queue_id: record.id }
        });
        if (existing) {
            log.step('error', `DUPLICATE GUARD: execution already exists for ${record.id}`, 'Duplicate execution prevention triggered.');
            return { error: 'duplicate_execution_prevented' };
        }
    }

    const blockedAuditOnly = (decision.blocked_action_ids as any[]) || [];
    log.step('exec_intake_opened', `${queueRecords.length} records received. No duplicates found.`, 'Execution intake opened and validated.');

    return { queueRecords, blockedAuditOnly, decision, event: decision.event };
}

async function confirmEligibility(queueRecords: any[], log: ExecutionLog) {
    const eligible: any[] = [];
    const ineligible: any[] = [];

    for (const record of queueRecords) {
        const reasons: string[] = [];
        if (!record.action_id) reasons.push('missing_action_id');
        if (record.action_id === 'ACT-REV-002') reasons.push('blocked_action_in_queue');

        const libMatch = await prisma.actionLibrary.findUnique({
            where: { action_id: record.action_id }
        });
        if (!libMatch) reasons.push('action_id_not_in_library');

        const mode = record.execution_lane;
        if (!KNOWN_MODES.includes(mode)) reasons.push('unknown_execution_mode');

        if (!VALID_QUEUE_STATUSES.includes(record.status)) reasons.push('invalid_queue_status_for_execution');

        if (isEmptyParams(record.parameters)) reasons.push('parameters_missing_or_empty');

        const existing = await prisma.actionExecution.findFirst({
            where: { action_queue_id: record.id }
        });
        if (existing) reasons.push('duplicate_execution_record');

        if (reasons.length > 0) {
            ineligible.push({ action_queue_id: record.id, reasons });
        } else {
            eligible.push(record);
            log.step('eligible', `${record.id} confirmed eligible`, 'Passed all eligibility checks for execution entry.');
        }
    }

    if (eligible.length === 0) {
        return { error: 'no_eligible_records', eligible, ineligible };
    }

    return { eligible, ineligible };
}

async function loadExecutionRules(businessId: string | null, actionIds: string[], log: ExecutionLog) {
    const actionLibraryRows = await prisma.actionLibrary.findMany({
        where: { action_id: { in: actionIds } }
    });

    let businessConfig = null;
    if (businessId) {
        businessConfig = await prisma.businessConfiguration.findUnique({
            where: { business_id: businessId }
        });
    }

    if (!businessConfig) {
        log.step('warning', `No business config for ${businessId}. Applying safe defaults.`, 'Fail-safe defaults ensure approval-first behavior.');
        businessConfig = {
            public_response_requires_approval: true,
            auto_posting_allowed: false,
            brand_tone: 'professional_friendly',
            max_retries: 3,
            max_reply_length: 150
        } as any;
    }

    const safetyRules = await prisma.safetyComplianceRule.findMany({
        where: { active: true },
        orderBy: { severity: 'desc' }
    });

    const actionLibrary: Record<string, any> = {};
    for (const row of actionLibraryRows) {
        actionLibrary[row.action_id] = row;
    }

    const snapshot = {
        snapshot_id: `exec_rules_snap_${uuidv4().replace(/-/g, '').substring(0, 10)}`,
        business_id: businessId,
        action_library: actionLibrary,
        business_config: businessConfig,
        safety_rules: safetyRules,
        retry_policy: {
            max_retries: (businessConfig as any).max_retries || 3,
            retry_delay_seconds: 30
        },
        failure_policy: 'fail_safe'
    };

    log.step('rules_snapshot_created', `Execution rules snapshot created: ${snapshot.snapshot_id}`, 'Frozen rules snapshot will be used for the rest of Section 5.');
    return snapshot;
}

async function createExecutionRecords(eligibleRecords: any[], decision: any, log: ExecutionLog) {
    const created: ExecutionRecord[] = [];

    await prisma.$transaction(async (tx: any) => {
        for (const record of eligibleRecords) {
            const execId = shortId('exec');
            const lane = record.execution_lane;
            const requiresApproval = lane === 'approval_required';
            const approvalOwner = decision.owner || 'business_owner';
            const createdRow = await tx.actionExecution.create({
                data: {
                    action_execution_id: execId,
                    action_queue_id: record.id,
                    action_id: record.action_id,
                    execution_mode: lane,
                    execution_status: 'created_pending_route',
                    approval_owner: approvalOwner,
                    approval_status: requiresApproval ? 'pending_approval' : null,
                    requires_human_approval: requiresApproval,
                    posted_externally: false,
                    retry_count: 0
                }
            });

            created.push({
                execution_id: execId,
                execution_row_id: createdRow.id,
                action_queue_id: record.id,
                action_id: record.action_id,
                execution_mode: lane,
                execution_status: 'created_pending_route',
                requires_human_approval: requiresApproval,
                approval_owner: approvalOwner,
                approval_status: requiresApproval ? 'pending_approval' : null,
                posted_externally: false,
                retry_count: 0
            });

            log.step('execution_created', `${execId} created for ${record.id}`, 'Execution record created and staged for routing.');
        }
    }, { timeout: 15000 });

    return created;
}

function routeByExecutionMode(executionRecords: ExecutionRecord[], log: ExecutionLog) {
    const routingSummaryId = shortId('exec_route');
    const lanes: Record<string, ExecutionRecord[]> = {
        approval_required: [],
        automatic: [],
        manual: [],
        observe_only: []
    };

    for (const rec of executionRecords) {
        const mode = rec.execution_mode;
        if (lanes[mode]) {
            lanes[mode].push(rec);
            log.step('routed', `${rec.execution_id} routed to ${mode} lane`, 'Lane assignment complete. No execution performed yet.');
        } else {
            log.step('warning', `${rec.execution_id} has unknown mode: ${mode}`, 'Unknown execution mode logged and skipped.');
        }
    }

    log.step('routing_complete', `Routing complete. approval_required=${lanes.approval_required.length} automatic=${lanes.automatic.length} manual=${lanes.manual.length}`, 'All records assigned to their execution lanes.');
    return { routingSummaryId, lanes };
}

async function executeAutomaticActions(
    automaticRecords: ExecutionRecord[],
    queueMap: Map<string, any>,
    rulesSnapshot: any,
    event: any,
    decision: any,
    log: ExecutionLog
) {
    const results: ExecutionRecord[] = [];

    for (const rec of automaticRecords) {
        const queueRow = queueMap.get(rec.action_queue_id);
        const params = queueRow?.parameters || {};
        const libRow = rulesSnapshot.action_library[rec.action_id] || {};
        const isPublic = !!libRow.is_public_facing;
        const callsA2p = !!(libRow.calls_a2p);

        if (isPublic || callsA2p) {
            log.step('error', `${rec.execution_id} failed safety gate. is_public_facing or calls_a2p is TRUE.`, 'Automatic execution blocked by safety gate.');
            await prisma.actionExecution.update({
                where: { id: rec.execution_row_id },
                data: { execution_status: 'escalated_to_manual', updated_at: new Date() }
            });
            await prisma.actionQueue.update({
                where: { id: rec.action_queue_id },
                data: { status: 'pending_manual', updated_at: new Date() }
            });
            results.push({ ...rec, execution_status: 'escalated_to_manual' });
            continue;
        }

        try {
            if (rec.action_id === 'ACT-REV-004') {
                const logEntry = {
                    action: 'log_review_complaint_theme',
                    complaint_topics: params.complaint_topics || [],
                    review_id: params.review_id || event?.review_id || null,
                    event_id: event?.event_id || null,
                    signal_name: params.signal_name || null,
                    rating: params.rating || null,
                    logged_internally: true,
                    posted_externally: false
                };

                await prisma.actionExecution.update({
                    where: { id: rec.execution_row_id },
                    data: {
                        execution_status: 'automatic_internal_action_completed',
                        generated_output: JSON.stringify(logEntry),
                        updated_at: new Date()
                    }
                });

                if (event?.id) {
                    // event.id is the UUID primary key (not the human-readable event_id)
                    const themes = (params.complaint_topics || []) as string[];
                    for (const theme of themes) {
                        await prisma.complaintThemeLog.create({
                            data: {
                                event_id: event.id,
                                exec_id: rec.execution_row_id,
                                theme: theme
                            }
                        });
                    }
                }

                await prisma.actionQueue.update({
                    where: { id: rec.action_queue_id },
                    data: { status: 'execution_completed', updated_at: new Date() }
                });

                log.step('automatic_completed', `${rec.execution_id} ACT-REV-004 completed. Complaint theme logged. No external action.`, 'Automatic internal action completed safely.');
                results.push({
                    ...rec,
                    execution_status: 'automatic_internal_action_completed',
                    generated_output: logEntry
                });
            } else if (rec.action_id.startsWith('ACT-A2P-')) {
                const customerName = params.customer_name || event?.author_name || 'Valued Customer';
                const aiSummary = params.ai_summary || event?.enrichments?.[0]?.ai_summary || 'No summary available.';
                
                const priorityLabels: Record<number, string> = { 1: 'CRITICAL', 2: 'HIGH', 3: 'MEDIUM', 4: 'LOW', 5: 'INFO' };
                const priorityLevel = decision?.priority ?? 3;
                const urgencyText = priorityLabels[priorityLevel] || `P${priorityLevel}`;
                
                const smsText = `[ClearSky ${urgencyText} ALERT] 🚨\nCustomer: ${customerName}\nIssue: ${aiSummary}\n\nPlease check the dashboard for details.`;

                const generatedOutput = {
                    action: rec.action_id,
                    target: params.target || 'business_owner',
                    message: smsText,
                    sms_text: smsText, // Explicit field for UI
                    posted_externally: false,
                    simulated: true,
                    dispatched_at: new Date().toISOString()
                };

                await prisma.actionExecution.update({
                    where: { id: rec.execution_row_id },
                    data: {
                        execution_status: 'automatic_internal_action_completed',
                        generated_output: JSON.stringify(generatedOutput),
                        updated_at: new Date()
                    }
                });

                await prisma.actionQueue.update({
                    where: { id: rec.action_queue_id },
                    data: { status: 'execution_completed', updated_at: new Date() }
                });

                log.step('automatic_completed', `${rec.execution_id} ${rec.action_id} simulated. SMS Alert Text: "${smsText}"`, 'Automatic internal action simulated with realistic dispatch content.');
                
                results.push({
                    ...rec,
                    execution_status: 'automatic_internal_action_completed',
                    generated_output: generatedOutput
                });
            } else {
                log.step('warning', `No automatic handler for action_id: ${rec.action_id}. Skipping.`, 'No internal handler registered for this action.');
                results.push(rec);
            }
        } catch (err: any) {
            const failureReason = err?.message || String(err);
            log.step('error', `${rec.execution_id} automatic execution failed: ${failureReason}`, 'Automatic execution error captured for retry/failure handling.');
            await prisma.actionExecution.update({
                where: { id: rec.execution_row_id },
                data: {
                    execution_status: 'failed',
                    failure_reason: failureReason,
                    updated_at: new Date()
                }
            });
            results.push({ ...rec, execution_status: 'failed', failure_reason: failureReason });
        }
    }

    return results;
}

async function prepareApprovalRequiredOutputs(
    approvalRecords: ExecutionRecord[],
    queueMap: Map<string, any>,
    rulesSnapshot: any,
    event: any,
    mockMode: boolean,
    log: ExecutionLog
) {
    const results: ExecutionRecord[] = [];

    for (const rec of approvalRecords) {
        const queueRow = queueMap.get(rec.action_queue_id);
        const params = queueRow?.parameters || {};
        const bizConfig = rulesSnapshot.business_config || {};
        const businessName = event?.business?.name || bizConfig.business_name;

        try {
            if (rec.action_id === 'ACT-REV-001') {
                const draftText = await generateReviewReplyDraft({
                    review_text: params.review_text || event?.review_text || '',
                    rating: params.rating || event?.review_rating_numeric || 0,
                    customer_name: params.customer_name || event?.author_name || 'Valued Customer',
                    praise_topics: params.praise_topics || event?.enrichments?.[0]?.ai_praise_topics || [],
                    complaint_topics: params.complaint_topics || event?.enrichments?.[0]?.ai_complaint_topics || [],
                    business_name: businessName,
                    tone: bizConfig.brand_tone || 'professional_friendly',
                    max_words: bizConfig.max_reply_length || 150
                }, mockMode);

                const generatedOutput = {
                    draft_reply: draftText,
                    source_review_id: params.review_id || event?.review_id || null,
                    rating: params.rating || event?.review_rating_numeric || null,
                    generated_by: mockMode ? 'mock' : 'ai_api',
                    posted_externally: false,
                    ready_for_approval: true
                };

                await prisma.actionExecution.update({
                    where: { id: rec.execution_row_id },
                    data: {
                        execution_status: 'draft_created',
                        generated_output: JSON.stringify(generatedOutput),
                        requires_human_approval: true,
                        updated_at: new Date()
                    }
                });

                const approvalPkgId = shortId('approval_pkg');
                await prisma.approvalPackage.create({
                    data: {
                        approval_package_id: approvalPkgId,
                        execution_id: rec.execution_row_id,
                        owner: rec.approval_owner || 'business_owner',
                        status: 'pending_approval'
                    }
                });

                await prisma.actionQueue.update({
                    where: { id: rec.action_queue_id },
                    data: { status: 'draft_ready_pending_approval', updated_at: new Date() }
                });

                log.step('draft_created', `${rec.execution_id} draft created. posted_externally=false. Pending approval. NOT posted to Google.`, 'Approval-required draft stored and parked for human review.');

                results.push({
                    ...rec,
                    execution_status: 'draft_created',
                    generated_output: generatedOutput,
                    approval_package_id: approvalPkgId,
                    posted_externally: false
                });
            } else if (rec.action_id === 'ACT-A2P-005') {
                // Draft Callback Script
                const customerName = params.customer_name || event?.author_name || 'Valued Customer';
                const aiSummary = params.ai_summary || event?.enrichments?.[0]?.ai_summary || 'No summary available.';
                const enrichment = event?.enrichments?.[0] || {};
                
                // Deterministic Tone Selection
                const isComplaint = enrichment.ai_contains_problem === true;
                const isPraise = enrichment.ai_praise_detected === true && !isComplaint;
                
                let scriptText = '';
                if (isComplaint) {
                    scriptText = `[CALLBACK SCRIPT - SUPPORT]\n\n"Hi ${customerName}, this is [Your Name] from ${businessName}. I'm calling regarding your recent message about: ${aiSummary.substring(0, 100)}... I'm so sorry for the frustration. How can we make this right?"`;
                } else if (isPraise) {
                    scriptText = `[CALLBACK SCRIPT - PRAISE]\n\n"Hi ${customerName}, this is [Your Name] from ${businessName}. I'm calling just to personally thank you for the wonderful review you left! We really appreciate the feedback about ${enrichment.ai_primary_praise_topic || 'our service'}. Is there anything else we can do for you?"`;
                } else {
                    scriptText = `[CALLBACK SCRIPT - REVENUE]\n\n"Hi ${customerName}, this is [Your Name] from ${businessName}. I'm calling regarding your interest in ${enrichment.ai_service_mentioned || 'our services'}. I'd love to discuss the quote and details you requested. When is a good time to talk?"`;
                }

                const generatedOutput = {
                    draft_reply: scriptText,
                    script_text: scriptText,
                    action: 'draft_callback_script',
                    is_complaint: isComplaint,
                    is_praise: isPraise,
                    ready_for_approval: true
                };

                await prisma.actionExecution.update({
                    where: { id: rec.execution_row_id },
                    data: {
                        execution_status: 'draft_created',
                        generated_output: JSON.stringify(generatedOutput),
                        requires_human_approval: true,
                        updated_at: new Date()
                    }
                });

                const approvalPkgId = shortId('approval_pkg_call');
                await prisma.approvalPackage.create({
                    data: {
                        approval_package_id: approvalPkgId,
                        execution_id: rec.execution_row_id,
                        owner: rec.approval_owner || 'business_owner',
                        status: 'pending_approval'
                    }
                });

                await prisma.actionQueue.update({
                    where: { id: rec.action_queue_id },
                    data: { status: 'draft_ready_pending_approval', updated_at: new Date() }
                });

                log.step('draft_created', `${rec.execution_id} Callback script drafted (${isComplaint ? 'Support' : isPraise ? 'Praise' : 'Revenue'} tone).`, 'Approval-required script stored and parked for human review.');

                results.push({
                    ...rec,
                    execution_status: 'draft_created',
                    generated_output: generatedOutput,
                    approval_package_id: approvalPkgId
                });
            } else if (rec.action_id === 'ACT-A2P-007') {
                // SMS Followup Draft
                const customerName = params.customer_name || event?.author_name || 'Valued Customer';
                const enrichment = event?.enrichments?.[0] || {};
                
                // Deterministic Tone Selection
                const isComplaint = enrichment.ai_contains_problem === true;
                const isPraise = enrichment.ai_praise_detected === true && !isComplaint;
                const isQuote = enrichment.ai_contains_quote_request === true;

                let smsText = '';
                if (isPraise) {
                    smsText = `Hi ${customerName}, this is ${businessName}. Thank you so much for the kind words! We're thrilled you're happy with the work. Have a great day!`;
                } else if (isQuote) {
                    smsText = `Hi ${customerName}, this is ${businessName}. We received your quote request and are putting the details together now. We'll call you shortly to discuss!`;
                } else if (isComplaint) {
                    smsText = `Hi ${customerName}, this is ${businessName}. We are very sorry to hear about the issue you mentioned. Our manager is reviewing this now and will call you ASAP to resolve it.`;
                } else {
                    smsText = `Hi ${customerName}, this is ${businessName}. We received your message and are looking into it right now. We'll follow up shortly!`;
                }

                const generatedOutput = {
                    draft_reply: smsText,
                    sms_text: smsText,
                    action: 'send_sms_followup',
                    tone: isPraise ? 'praise' : isQuote ? 'quote' : isComplaint ? 'support' : 'neutral',
                    ready_for_approval: true
                };

                await prisma.actionExecution.update({
                    where: { id: rec.execution_row_id },
                    data: {
                        execution_status: 'draft_created',
                        generated_output: JSON.stringify(generatedOutput),
                        requires_human_approval: true,
                        updated_at: new Date()
                    }
                });

                const approvalPkgId = shortId('approval_pkg_sms');
                await prisma.approvalPackage.create({
                    data: {
                        approval_package_id: approvalPkgId,
                        execution_id: rec.execution_row_id,
                        owner: rec.approval_owner || 'business_owner',
                        status: 'pending_approval'
                    }
                });

                await prisma.actionQueue.update({
                    where: { id: rec.action_queue_id },
                    data: { status: 'draft_ready_pending_approval', updated_at: new Date() }
                });

                log.step('draft_created', `${rec.execution_id} SMS follow-up drafted.`, 'Approval-required SMS stored and parked for human review.');

                results.push({
                    ...rec,
                    execution_status: 'draft_created',
                    generated_output: generatedOutput,
                    approval_package_id: approvalPkgId
                });
            } else {
                results.push(rec);
            }
        } catch (err: any) {
            const failureReason = err?.message || String(err);
            log.step('error', `${rec.execution_id} draft generation failed: ${failureReason}`, 'Draft generation failed and recorded.');
            await prisma.actionExecution.update({
                where: { id: rec.execution_row_id },
                data: {
                    execution_status: 'failed',
                    failure_reason: failureReason,
                    updated_at: new Date()
                }
            });
            results.push({ ...rec, execution_status: 'failed', failure_reason: failureReason });
        }
    }

    return results;
}

async function handleManualAssignments(manualRecords: ExecutionRecord[], queueMap: Map<string, any>, log: ExecutionLog) {
    if (manualRecords.length === 0) {
        log.step('manual_none', 'No manual lane records. Step 8 complete.', 'Manual lane empty for this execution cycle.');
        return [];
    }

    const results: ExecutionRecord[] = [];
    for (const rec of manualRecords) {
        await prisma.actionExecution.update({
            where: { id: rec.execution_row_id },
            data: { execution_status: 'pending_manual_assignment', updated_at: new Date() }
        });

        await prisma.actionQueue.update({
            where: { id: rec.action_queue_id },
            data: { status: 'pending_manual', updated_at: new Date() }
        });

        results.push({ ...rec, execution_status: 'pending_manual_assignment' });
        log.step('manual_assignment', `${rec.execution_id} requires manual action.`, 'Execution parked for human assignment.');
    }

    return results;
}

function handleObserveOnly(observeRecords: ExecutionRecord[], log: ExecutionLog) {
    if (observeRecords.length === 0) return [];
    for (const rec of observeRecords) {
        log.step('observe_only', `${rec.execution_id} routed to observe_only lane. No action taken.`, 'Observe-only lane recorded for audit visibility.');
    }
    return observeRecords.map(r => ({ ...r, execution_status: 'observe_only' }));
}

async function handleStates(allResults: ExecutionRecord[], rulesSnapshot: any, log: ExecutionLog) {
    const maxRetries = rulesSnapshot.retry_policy?.max_retries || 3;
    const updated: ExecutionRecord[] = [];

    for (const rec of allResults) {
        const status = rec.execution_status;
        const execId = rec.execution_id;

        if (status === 'draft_created') {
            log.step('waiting_for_approval', `${execId} waiting for human approval. No further Section 5 action.`, 'Draft parked at approval gate.');
            updated.push({ ...rec, execution_status: 'draft_created' });
        } else if (status === 'automatic_internal_action_completed') {
            log.step('completed', `${execId} completed successfully.`, 'Automatic execution complete and recorded.');
            updated.push({ ...rec, execution_status: 'automatic_internal_action_completed' });
        } else if (status === 'failed') {
            const retryCount = rec.retry_count || 0;
            if (retryCount < maxRetries) {
                const newCount = retryCount + 1;
                log.step('retry_pending', `${execId} retry ${newCount}/${maxRetries} scheduled.`, 'Retry scheduled under policy.');
                updated.push({ ...rec, execution_status: 'retry_pending', retry_count: newCount });
            } else {
                log.step('error', `${execId} max retries reached. Failed permanently.`, 'Failure escalated after retry exhaustion.');
                updated.push({ ...rec, execution_status: 'failed_permanently' });
            }
        } else if (status === 'pending_manual_assignment') {
            log.step('pending_manual_assignment', `${execId} parked at manual assignment.`, 'Manual assignment pending.');
            updated.push(rec);
        } else {
            log.step('warning', `${execId} unknown state: ${status}`, 'Unknown state recorded without interruption.');
            updated.push(rec);
        }
    }

    for (const rec of updated) {
        if (rec.action_id === 'ACT-REV-002') {
            log.step('error', 'ACT-REV-002 found in execution results. THIS IS A BUG.', 'Blocked action must never reach executions.');
            throw new Error('blocked_action_in_execution_results');
        }
    }

    return updated;
}

async function updateStatuses(finalRecords: ExecutionRecord[], log: ExecutionLog) {
    const statusMap: Record<string, [string, string]> = {
        waiting_for_approval: ['draft_created', 'draft_ready_pending_approval'],
        draft_created: ['draft_created', 'draft_ready_pending_approval'],
        completed: ['automatic_internal_action_completed', 'execution_completed'],
        automatic_internal_action_completed: ['automatic_internal_action_completed', 'execution_completed'],
        retry_pending: ['retry_pending', 'retry_pending'],
        failed_permanently: ['failed', 'failed'],
        pending_manual_assignment: ['pending_manual_assignment', 'pending_manual'],
        observe_only: ['observe_only', 'observe_only']
    };

    for (const rec of finalRecords) {
        const state = rec.execution_status;
        const mapped = statusMap[state] || [state, state];
        const [execStatus, queueStatus] = mapped;

        await prisma.actionExecution.update({
            where: { id: rec.execution_row_id },
            data: {
                execution_status: execStatus,
                retry_count: rec.retry_count ?? undefined,
                updated_at: new Date()
            }
        });

        await prisma.actionQueue.update({
            where: { id: rec.action_queue_id },
            data: { status: queueStatus, updated_at: new Date() }
        });

        log.step('status_updated', `${rec.execution_id} -> ${execStatus} | ${rec.action_queue_id} -> ${queueStatus}`, 'Execution and queue statuses synchronized.');
    }

    log.step('status_audit', 'exec_status_audit created. All statuses written.', 'Status audit recorded for traceability.');
}

function prepareExecutionOutput(
    finalRecords: ExecutionRecord[],
    blockedAuditOnly: any[],
    approvalPackageId: string | null,
    eventId: string,
    decisionId: string,
    businessId: string | null,
    log: ExecutionLog,
    snapshotId: string | null,
    routingSummaryId: string | null
) {
    const outputPackageId = shortId('exec_out');
    const postedExternally = finalRecords.some(r => r.posted_externally);

    if (postedExternally) {
        log.step('error', 'BOUNDARY VIOLATION: posted_externally = TRUE found in execution records.', 'Section 5 boundary check failed.');
        throw new Error('posted_externally_true_in_section_5');
    }

    const output = {
        section: 'Section 5: Execution',
        section_5_status: 'completed',
        execution_output_package_id: outputPackageId,
        execution_intake_id: 'exec_intake_5000',
        execution_rules_snapshot_id: snapshotId,
        routing_summary_id: routingSummaryId,
        source_event_id: eventId,
        source_orchestrator_decision_id: decisionId,
        business_id: businessId,
        execution_records: finalRecords,
        blocked_audit_only: blockedAuditOnly,
        approval_package_id: approvalPackageId,
        boundary_flags: {
            execution_records_created: true,
            automatic_internal_action_completed: true,
            approval_required_output_prepared: true,
            public_reply_posted: false,
            outcome_recorded: false,
            feedback_recorded: false
        },
        handoff_status: 'ready_for_outcome',
        next_section: 'Section 6: Outcome',
        section_stop_reason: 'Section 5 stops before Outcome recording begins.'
    };

    log.step('exec_out_built', `exec_out package built: ${outputPackageId}. handoff_status = ready_for_outcome.`, 'Section 5 output prepared for Outcome section.');
    return output;
}

function stopBeforeOutcome(execOutPackage: any, finalRecords: ExecutionRecord[], blockedAuditOnly: any[], approvalPackageId: string | null) {
    if (execOutPackage.boundary_flags.public_reply_posted) {
        throw new Error('boundary_violation_posted_externally');
    }
    if (execOutPackage.boundary_flags.outcome_recorded) {
        throw new Error('boundary_violation_outcome_recorded_in_section_5');
    }

    return {
        executed: true,
        execution_records: finalRecords,
        blocked_audit_only: blockedAuditOnly,
        approval_package_id: approvalPackageId,
        handoff_status: 'ready_for_outcome',
        pipeline_status: 'execution_ready',
        stop_reason: null,
        execution_output_package: execOutPackage
    } as ExecutionResult;
}

export async function runExecution(decisionId: string, eventId: string, businessId: string | null, mockMode: boolean): Promise<ExecutionResult> {
    const log = new ExecutionLog(decisionId);
    log.step('started', `Section 5 started. decision_id=${decisionId}`, 'Execution stage initialized and awaiting queue intake.');

    try {
        const intake = await receiveQueueOutput(decisionId, eventId, log);
        if ((intake as any).error) {
            return {
                executed: false,
                execution_records: [],
                blocked_audit_only: [],
                approval_package_id: null,
                handoff_status: 'failed',
                pipeline_status: 'error',
                stop_reason: (intake as any).error,
                log
            };
        }

        const { queueRecords, blockedAuditOnly, decision, event } = intake as any;
        const queueMap = new Map<string, any>(queueRecords.map((r: any) => [r.id, r]));

        const eligibility = await confirmEligibility(queueRecords, log);
        if ((eligibility as any).error) {
            return {
                executed: false,
                execution_records: [],
                blocked_audit_only: blockedAuditOnly,
                approval_package_id: null,
                handoff_status: 'failed',
                pipeline_status: 'error',
                stop_reason: (eligibility as any).error,
                log
            };
        }

        const { eligible } = eligibility as any;
        const actionIds = eligible.map((r: any) => r.action_id);
        const rules = await loadExecutionRules(businessId || event?.business_id || null, actionIds, log);

        const createdRecords = await createExecutionRecords(eligible, decision, log);
        const routing = routeByExecutionMode(createdRecords, log);
        const autoResults = await executeAutomaticActions(routing.lanes.automatic, queueMap, rules, event, decision, log);
        const approvalResults = await prepareApprovalRequiredOutputs(routing.lanes.approval_required, queueMap, rules, event, mockMode, log);
        const manualResults = await handleManualAssignments(routing.lanes.manual, queueMap, log);
        const observeResults = handleObserveOnly(routing.lanes.observe_only, log);

        const allResults = [...autoResults, ...approvalResults, ...manualResults, ...observeResults];
        const finalRecords = await handleStates(allResults, rules, log);
        await updateStatuses(finalRecords, log);

        const approvalPkg = await prisma.approvalPackage.findFirst({
            where: { execution_id: { in: finalRecords.map(r => r.execution_row_id) } },
            orderBy: { created_at: 'desc' }
        });

        const execOut = prepareExecutionOutput(
            finalRecords,
            blockedAuditOnly,
            approvalPkg?.approval_package_id || null,
            eventId,
            decisionId,
            businessId || event?.business_id || null,
            log,
            rules.snapshot_id,
            routing.routingSummaryId
        );

        const finalResult = stopBeforeOutcome(execOut, finalRecords, blockedAuditOnly, approvalPkg?.approval_package_id || null);
        finalResult.log = log;
        return finalResult;
    } catch (err: any) {
        log.step('error', `Section 5 fatal error: ${err?.message || err}`, 'Section 5 stopped due to fatal error.');
        return {
            executed: false,
            execution_records: [],
            blocked_audit_only: [],
            approval_package_id: null,
            handoff_status: 'failed',
            pipeline_status: 'error',
            stop_reason: err?.message || String(err),
            log
        };
    }
}
