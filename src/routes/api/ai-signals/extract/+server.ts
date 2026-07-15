import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import prisma from '$lib/server/db';

const PROVIDERS = [
	'clearsky_website_forms', 'telnyx_voice', 'telnyx_sms', 'email_provider',
	'google_business_profile', 'dataforseo', 'matomo_analytics', 'clearsky_viewroom',
	'fotojobber', 'quote_systems', 'booking_systems', 'crms', 'social_media',
	'competitor_intelligence', 'contentradar', 'system_health'
] as const;

const ExtractRequestSchema = z.object({
	event_id: z.string().uuid(),
	provider: z.enum(PROVIDERS),
	event_type: z.string().min(1),
	unstructured_text: z.string().min(1)
});

const ExtractionResultSchema = z.object({
	intent: z.string(),
	service_requested: z.string(),
	problem_type: z.string(),
	urgency_level: z.enum(['low', 'medium', 'high']),
	timeline: z.string(),
	sentiment: z.enum(['positive', 'neutral', 'negative']),
	praise_topics: z.array(z.string()),
	complaint_topics: z.array(z.string()),
	summary: z.string(),
	confidence_score: z.number().min(0).max(1)
});

type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

let _openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
	const apiKey = env.AI_SEARCH_API_KEY ?? env.OPENAI_API_KEY;
	if (!apiKey) throw new Error('Missing AI_SEARCH_API_KEY');
	if (_openai) return _openai;
	_openai = new OpenAI({ apiKey, timeout: 12000, maxRetries: 0 });
	return _openai;
}

import { SignalEngine } from '$lib/server/signal-engine';

import { OrchestratorEngine } from '$lib/server/orchestrator-engine';
import { ActionQueueEngine } from '$lib/server/action-queue-engine';
import { runExecution } from '$lib/server/section-5-execution';
import { runOutcome } from '$lib/server/section-6-outcome';
import { runFeedback } from '$lib/server/section-7-feedback';

async function insertAiExtractionResult(args: {
	event_id: string;
	provider: string;
	event_type: string;
	unstructured_text: string;
	extraction: ExtractionResult;
}) {
	const trace: string[] = [];
	const log = (msg: string, data?: any) => {
		const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
		let entry = `🔵 [${timestamp}] ${msg}`;
		if (data) {
			const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
			entry += `\n   ╰─ Context: ${dataStr.replace(/\n/g, '\n   ')}`;
		}
		console.log(entry);
		trace.push(entry);
	};

	log(`[Step 8] AI Extraction: The AI has read the story. Extracting sentiment, topics, service mentions, and summary for Event ${args.event_id}`);

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Insert Enrichment (Full Field Mapping)
			await tx.enrichment.create({
				data: {
					id: crypto.randomUUID(),
					event_id: args.event_id,
					
					// New AI Context Fields
					ai_sentiment: args.extraction.sentiment,
					ai_sentiment_score: args.extraction.confidence_score,
					ai_review_tone: args.extraction.sentiment === 'positive' ? 'positive' : 'neutral',
					ai_praise_detected: args.extraction.praise_topics.length > 0,
					ai_complaint_detected: args.extraction.complaint_topics.length > 0,
					ai_praise_topics: args.extraction.praise_topics,
					ai_complaint_topics: args.extraction.complaint_topics,
					ai_primary_praise_topic: args.extraction.praise_topics[0] || null,
					ai_primary_complaint_topic: args.extraction.complaint_topics[0] || null,
					ai_service_mentioned: args.extraction.service_requested,
					ai_customer_experience_issue: args.extraction.problem_type,
					ai_urgency_level: args.extraction.urgency_level,
					ai_summary: args.extraction.summary,
					ai_suggested_response_type: 'automated_draft',
					ai_confidence_score: args.extraction.confidence_score,
					
					// Legacy compatibility
					intent: args.extraction.intent,
					service_requested: args.extraction.service_requested,
					problem_type: args.extraction.problem_type,
					urgency_level: args.extraction.urgency_level,
					timeline: args.extraction.timeline,
					sentiment: args.extraction.sentiment,
					summary: args.extraction.summary,
					confidence_score: args.extraction.confidence_score,
					created_at: new Date()
				}
			});

			// 2. Update Event Status
			await tx.event.update({
				where: { id: args.event_id },
				data: {
					ai_extraction_completed: true,
					processing_status: 'handoff_eligible',
					handoff_eligible: true
				}
			});
		});

		// 3. Trigger Signal Evaluation
		const engineResult = await SignalEngine.evaluate(args.event_id, trace);
		const fullTrace = [...(engineResult.trace || trace)];

		// 4. Run the rest of the pipeline
		const eventRecord = await prisma.event.findUnique({ where: { id: args.event_id } });
		
		if (eventRecord) {
			const signalCandidates = await prisma.signal.findMany({
				where: { event_id: args.event_id, status: 'candidate' }
			});

			const decisionResult = await OrchestratorEngine.makeDecision(args.event_id, signalCandidates, fullTrace);

			if (decisionResult?.log?.steps?.length) {
				decisionResult.log.steps.forEach(s => {
					const timestamp = s.timestamp;
					const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
					fullTrace.push(`${statusIcon} [${timestamp}] Section 3 - ${s.status.toUpperCase()} : ${s.message}`);
				});
			}

			if (decisionResult.decided && decisionResult.decision_id) {
				log(`[Step 13] Action Queue: Parameterizing...`);
				const queueResult = await ActionQueueEngine.processToQueue(decisionResult.decision_id);
				queueResult.log.steps.forEach(s => {
					const timestamp = s.timestamp;
					const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
					fullTrace.push(`${statusIcon} [${timestamp}] Section 4 - ${s.status.toUpperCase()} : ${s.message}`);
				});

				log(`[Step 14] Execution: Running execution module...`);
				const executionResult = await runExecution(
					decisionResult.decision_id,
					eventRecord.event_id,
					eventRecord.business_id as string,
					false
				);

				if (executionResult?.log?.steps?.length) {
					executionResult.log.steps.forEach((s: any) => {
						const timestamp = s.timestamp;
						const statusIcon = s.status.includes('error') ? '🔴' : (s.status.includes('blocked') || s.status.includes('warning')) ? '🟡' : '🔵';
						fullTrace.push(`${statusIcon} [${timestamp}] Section 5 - ${s.status.toUpperCase()} : ${s.message}`);
					});
				}

				if (executionResult?.executed && executionResult?.handoff_status === 'ready_for_outcome') {
					const outcomeResult = await runOutcome(
						executionResult.execution_output_package,
						eventRecord.event_id,
						decisionResult.decision_id,
						eventRecord.business_id as string
					);

					if (outcomeResult?.log?.steps?.length) {
						outcomeResult.log.steps.forEach((s: any) => {
							const timestamp = s.timestamp;
							const statusIcon = s.status.includes('fail') ? '🔴' : s.status.includes('warn') ? '🟡' : '🔵';
							fullTrace.push(`${statusIcon} [${timestamp}] Section 6 - ${s.status.toUpperCase()} : ${s.message}`);
						});
					}

					if (outcomeResult.completed) {
						const feedbackResult = await runFeedback(
							outcomeResult.out_pkg,
							eventRecord.event_id,
							decisionResult.decision_id,
							eventRecord.business_id as string
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
		}
		
		try {
			await prisma.event.update({
				where: { id: args.event_id },
				data: {
					unstructured_text: args.unstructured_text + '\n\n--- PIPELINE LOGS ---\n' + fullTrace.join('\n')
				}
			});
		} catch (e) {
			console.error('Failed to save pipeline logs to Event', e);
		}

		log(`[AI Extract] Success for Event: ${args.event_id}`);
		return fullTrace;
	} catch (err: any) {
		console.error(`[AI Extract] Database Error for Event: ${args.event_id}`, err);
		log(`🔴 [ERROR] AI Extraction Database Error: ${err.message || err}`);
		return trace;
	}
}


export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const parsed = ExtractRequestSchema.parse(body);
		const { event_id, provider, event_type, unstructured_text } = parsed;

		const openai = getOpenAIClient();
		const response = await openai.responses.parse({
			model: env.OPENAI_MODEL || 'gpt-4o-mini',
			input: [
				{ role: 'system', content: 'Extract structured signal data.' },
				{ role: 'user', content: unstructured_text }
			],
			temperature: 0,
			text: {
				format: {
					type: 'json_schema',
					name: 'clearsky_extraction',
					strict: true,
					schema: {
						type: 'object',
						additionalProperties: false,
						required: ['intent','service_requested','problem_type','urgency_level','timeline','sentiment','praise_topics','complaint_topics','summary','confidence_score'],
						properties: {
							intent: { type: 'string' },
							service_requested: { type: 'string' },
							problem_type: { type: 'string' },
							urgency_level: { type: 'string', enum: ['low', 'medium', 'high'] },
							timeline: { type: 'string' },
							sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
							praise_topics: { type: 'array', items: { type: 'string' } },
							complaint_topics: { type: 'array', items: { type: 'string' } },
							summary: { type: 'string' },
							confidence_score: { type: 'number' }
						}
					}
				}
			}
		});

		const extraction = ExtractionResultSchema.parse((response as any).output_parsed);
		const fullTrace = await insertAiExtractionResult({ event_id, provider, event_type, unstructured_text, extraction });
		
		return json({ success: true, event_id, trace: fullTrace });
	} catch (err) {
		console.error('[extract] Failed', err);
		return json({ success: false, accepted: true }, { status: 202 });
	}
};
