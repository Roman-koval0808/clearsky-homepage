<script lang="ts">
	import { onMount } from 'svelte';

	interface TestScenario {
		name: string;
		description: string;
		author_name?: string;
		rating?: number;
		comment: string;
		expectedSignals: string[];
	}

	const scenarios: TestScenario[] = [
		{
			name: 'The Raving Fan',
			description: 'Perfect 5-star review with praise',
			author_name: 'John Doe',
			rating: 5,
			comment: 'Absolutely incredible service! The team replaced my entire roof in two days. Cleaned up everything. Best contractor in Timmins.',
			expectedSignals: ['SIG-TRUST-003', 'SIG-TRUST-006', 'SIG-TRUST-015']
		},
		{
			name: 'Emergency Crisis',
			description: 'Critical 1-star review with urgent issue',
			author_name: 'Margaret T.',
			rating: 1,
			comment: 'Emergency! My roof is leaking after the repair they did last week. I have called 5 times and no one answers. Water is coming into my kitchen right now!',
			expectedSignals: ['SIG-TRUST-001', 'SIG-TRUST-008', 'SIG-TRUST-017']
		},
		{
			name: 'Mixed Feedback',
			description: '4-star review with praise and communication complaint',
			author_name: 'Sarah M.',
			rating: 4,
			comment: 'The crew was professional and the job looks good. Only reason I am giving 4 stars is because communication before the appointment was a little slow.',
			expectedSignals: ['SIG-TRUST-003', 'SIG-TRUST-004', 'SIG-TRUST-005']
		},
		{
			name: 'Neutral Opportunity',
			description: '3-star review with mixed feedback',
			author_name: 'Bob B.',
			rating: 3,
			comment: 'Average experience. The roof was fixed but they left some shingles on my lawn. Took a few days to get a callback for the quote.',
			expectedSignals: ['SIG-TRUST-002', 'SIG-TRUST-009']
		},
		{
			name: 'Safety Violation',
			description: '4-star review with a safety complaint (hard hat)',
			author_name: 'Kevin L.',
			rating: 4,
			comment: 'Job was done quickly and at a fair price. However, I noticed one of the workers was not wearing a hard hat while on the roof. This is a safety concern.',
			expectedSignals: ['SIG-TRUST-003', 'SIG-TRUST-017']
		}
	];

	const callScenarios: TestScenario[] = [
		{
			name: 'Emergency Voice Call',
			description: 'Urgent roof leak requesting immediate dispatch',
			comment: 'Emergency! My roof is leaking after the repair they did last week. I have called 5 times and no one answers. Water is coming into my kitchen right now!',
			expectedSignals: ['SIG-COMM-000', 'SIG-COMM-001', 'SIG-COMM-006']
		},
		{
			name: 'Quote Request (Voice)',
			description: 'Customer asking for a callback for a quote',
			comment: 'Hi, I need someone to come out and give me a quote for a new roof. Call me back at 555-0199.',
			expectedSignals: ['SIG-COMM-004', 'SIG-COMM-005']
		}
	];

	const smsScenarios: TestScenario[] = [
		{
			name: 'Quote Request (SMS)',
			description: 'High intent SMS lead requesting a quote',
			comment: 'I would like to get a quote for a new roof. Can you send someone over?',
			expectedSignals: ['SIG-COMM-004', 'SIG-COMM-002']
		},
		{
			name: 'General Inquiry (SMS)',
			description: 'Standard question about services',
			comment: 'Do you guys do metal roofs or just shingles?',
			expectedSignals: ['SIG-COMM-007']
		}
	];

	const emailScenarios: TestScenario[] = [
		{
			name: 'Project Inquiry (Email)',
			description: 'Customer asking for a quote via email',
			comment: 'Hello, I need a detailed quote for replacing my entire roof next month. Can you please send an estimator? Thanks, John.',
			expectedSignals: ['SIG-COMM-004', 'SIG-COMM-005']
		},
		{
			name: 'Follow-up / Complaint (Email)',
			description: 'Customer complaining about a previous job',
			comment: 'Hi, the team was here yesterday but they left a mess in my driveway. I need someone to come clean this up immediately.',
			expectedSignals: ['SIG-COMM-001', 'SIG-COMM-006']
		}
	];

	const faqScenarios: TestScenario[] = [
		{
			name: 'Service Area (FAQ)',
			description: 'Question asked on Google Business Profile Q&A',
			comment: 'Do you provide service in the north end of town?',
			expectedSignals: ['SIG-COMM-007']
		}
	];

	let mode = $state<'review' | 'call' | 'sms' | 'email' | 'faq' | 'history'>('review');
	let selectedScenario = $state<TestScenario | null>(null);
	let selectedHistoricalCall = $state<any | null>(null);
	let historicalCalls = $state<any[]>([]);
	let isRunning = $state(false);
	let logs = $state<Array<{ type: string; message: string; description?: string; timestamp: string }>>([]);
	let draftReply = $state<string | null>(null);
	let outcomeResult = $state<any | null>(null);
	let outcomePackage = $state<any | null>(null);
	let feedbackResult = $state<any | null>(null);
	let feedbackPackage = $state<any | null>(null);
	let aiProtocol = $state<any | null>(null);
	let orchestratorDecision = $state<any | null>(null);
	let evaluationResult = $state<any | null>(null);
	let formData = $state({
		author_name: '',
		customer_email: '',
		customer_phone: '',
		rating: 4,
		_comment: '',
		get comment() { return this._comment; },
		set comment(v) {
			this._comment = v;
			if (selectedScenario && v !== selectedScenario.comment) {
				selectedScenario = null;
			}
		}
	});

	let aiExplainerText = $state<string | null>(null);
	let isExplaining = $state(false);

	// Step tracking
	const steps = [
		{ num: 1, name: 'Raw Data Received', icon: '📥' },
		{ num: 2, name: 'Event Mapping', icon: '🔄' },
		{ num: 3, name: 'Data Normalization', icon: '⚙️' },
		{ num: 4, name: 'Business Matching', icon: '🏢' },
		{ num: 5, name: 'Duplicate Check', icon: '🔍' },
		{ num: 6, name: 'AI Extraction', icon: '🧠' },
		{ num: 7, name: 'Storage & Handoff', icon: '💾' },
		{ num: 8, name: 'Signal Detection', icon: '⌁' },
		{ num: 9, name: 'Rule Evaluation', icon: '📋' },
		{ num: 10, name: 'Signal Creation', icon: '✨' },
		{ num: 11, name: 'Orchestrator Decision', icon: '🎯' },
		{ num: 12, name: 'Action Queue', icon: '📝' },
		{ num: 13, name: 'Outcome Recording', icon: '📊' },
		{ num: 14, name: 'Feedback Learning', icon: '🧠' }
	];

	let completedSteps = $state<number[]>([]);
	let activeSection = $state<'all' | 'section1' | 'section2' | 'section3' | 'section4' | 'section5' | 'section6' | 'section7' | 'draft' | 'outcome' | 'feedback' | 'protocol'>('all');

	function loadScenario(scenario: TestScenario) {
		selectedScenario = scenario;
		formData = {
			author_name: scenario.author_name || '',
			customer_email: mode === 'email' ? 'test@example.com' : '',
			customer_phone: (mode === 'sms' || mode === 'call') ? '+15550009999' : '',
			rating: scenario.rating || 0,
			comment: scenario.comment
		};
		logs = [];
		draftReply = null;
		outcomeResult = null;
		outcomePackage = null;
		feedbackResult = null;
		feedbackPackage = null;
		aiProtocol = null;
		completedSteps = [];
	}

	function addLog(type: 'info' | 'success' | 'warning' | 'error' | 'step', message: string, description?: string, timestamp?: string) {
		const ts = timestamp || new Date().toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			fractionalSecondDigits: 3
		});
		logs = [...logs, { type, message, description, timestamp: ts }];

		setTimeout(() => {
			const logsEl = document.getElementById('pipeline-test-logs');
			if (logsEl) {
				logsEl.scrollTop = logsEl.scrollHeight;
			}
		}, 0);
	}

	async function generateExplainer() {
		if (logs.length === 0) return;
		isExplaining = true;
		aiExplainerText = null;
		
		try {
			const res = await fetch('/api/ai-signals/explain-logs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					logs: logs.slice(-100), // Last 100 logs for context
					eventContext: {
						mode,
						selectedScenario,
						selectedHistoricalCall: selectedHistoricalCall ? {
							id: selectedHistoricalCall.id,
							created_at: selectedHistoricalCall.created_at
						} : null
					}
				})
			});
			const data = await res.json();
			aiExplainerText = data.explanation;
		} catch (e) {
			console.error('Failed to generate explainer', e);
			aiExplainerText = "Failed to generate explanation.";
		} finally {
			isExplaining = false;
		}
	}

	function getLogIcon(type: string): string {
		switch (type) {
			case 'step':
				return '🔵';
			case 'success':
				return '✅';
			case 'warning':
				return '⚠️';
			case 'error':
				return '🔴';
			default:
				return '🔵';
		}
	}

	function getLogColor(type: string): string {
		switch (type) {
			case 'step':
				return 'text-blue-200 bg-[#121820] border-[#1e2530]';
			case 'success':
				return 'text-green-300 bg-[#121820] border-[#1e2530]';
			case 'warning':
				return 'text-amber-300 bg-[#121820] border-[#1e2530]';
			case 'error':
				return 'text-red-300 bg-[#121820] border-[#1e2530]';
			default:
				return 'text-slate-300 bg-[#121820] border-[#1e2530]';
		}
	}

	function getLogSection(message: string): 'section1' | 'section2' | 'section3' | 'section4' | 'section5' | 'section6' | 'section7' | 'other' {
		if (message.includes('Section 7 -')) return 'section7';
		if (message.includes('Section 6 -')) return 'section6';
		if (message.includes('Section 5 -')) return 'section5';
		if (message.includes('Section 4 -')) return 'section4';
		if (message.includes('Section 3 -')) return 'section3';
		if (message.includes('[Step 1]') || message.includes('[Step 2/3]') || message.includes('[Step 4/5]')) return 'section1';
		if (
			message.includes('[Step 6]') ||
			message.includes('[Step 7]') ||
			message.includes('[Step 8]') ||
			message.includes('[Step 9]') ||
			message.includes('[Step 10]') ||
			message.includes('[Step 11]') ||
			message.includes('[Step 12]')
		) {
			return 'section2';
		}
		return 'other';
	}

	function getVisibleLogs() {
		return logs.filter((log) => activeSection === 'all' || getLogSection(log.message) === activeSection);
	}

	async function runTest() {
		isRunning = true;
		logs = [];
		draftReply = null;
		outcomeResult = null;
		outcomePackage = null;
		feedbackResult = null;
		feedbackPackage = null;
		aiProtocol = null;
		orchestratorDecision = null;
		evaluationResult = null;
		completedSteps = [];

		try {
			addLog('step', '🚀 Running real pipeline...', `Processing simulated ${mode} event...`);

			const payload = {
				author_name: formData.author_name,
				customer_email: formData.customer_email,
				customer_phone: formData.customer_phone,
				rating: formData.rating,
				comment: formData.comment,
				mode: mode
			};

			const response = await fetch('/api/signals/test', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await response.json();

			if (!data.success) {
				addLog('error', '❌ Pipeline failed', data.error);
				return;
			}

			outcomeResult = data.outcome || null;
			outcomePackage = data.outcome?.out_pkg?.section_6_completion_result || null;
			feedbackResult = data.feedback || null;
			feedbackPackage = data.feedback?.fb_pkg || null;
			aiProtocol = data.ai_protocol || null;
			orchestratorDecision = data.decision || null;
			evaluationResult = data.evaluation || null;

			// Look for AI Draft or SMS Dispatch in execution records
			const execOut = data.execution?.execution_output_package || data.execution_output_package;
			if (execOut && execOut.execution_records) {
				const draftRecord = execOut.execution_records.find((r: any) => {
					const output = typeof r.generated_output === 'string' ? JSON.parse(r.generated_output) : r.generated_output;
					return output && (output.draft_reply || output.sms_text || output.message);
				});
				if (draftRecord) {
					const output = typeof draftRecord.generated_output === 'string' ? JSON.parse(draftRecord.generated_output) : draftRecord.generated_output;
					draftReply = output.draft_reply || output.sms_text || output.message;
				} else {
					draftReply = null;
				}
			} else {
				draftReply = null;
			}

			// Display EVERY SINGLE log line from the pipeline
			if (data.logs && Array.isArray(data.logs)) {
				for (const logLine of data.logs) {
					if (!logLine.trim()) continue;

					// Parse timestamp from log string [YYYY-MM-DD HH:MM:SS.mmm]
					let extractedTimestamp: string | undefined;
					const timestampMatch = logLine.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]/);
					if (timestampMatch) {
						const timestamp = timestampMatch[1];
						const [datePart, timePart] = timestamp.split(' ');
						const date = new Date(`${datePart}T${timePart}Z`);
						extractedTimestamp = date.toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							fractionalSecondDigits: 3
						});
					}

					// Parse log line to extract type and content
					let logType: 'info' | 'success' | 'warning' | 'error' | 'step' = 'info';
					let displayLine = logLine;
					let description = '';

					// Detect log type from emoji
					if (logLine.includes('🔴')) logType = 'error';
					else if (logLine.includes('🟡')) logType = 'warning';
					else if (logLine.includes('✅')) logType = 'success';
					else if (logLine.includes('🌸')) logType = 'info'; // Rule evaluation
					else if (logLine.includes('🔵')) logType = 'info';
					else if (logLine.includes('ERROR')) logType = 'error';
					else if (logLine.includes('BLOCKED')) logType = 'warning';

					// Check if this is a multi-line entry (has context on next lines)
					const lines = displayLine.split('\n');
					if (lines.length > 1) {
						displayLine = lines[0];
						description = lines.slice(1).join('\n').replace(/\s+╰─ Context:\s+/, '').trim();
					}

					// Clean up emoji from display
					displayLine = displayLine
						.replace(/🔴\s*/, '')
						.replace(/✅\s*/, '')
						.replace(/🔵\s*/, '')
						.replace(/🟡\s*/, '')
						.replace(/🌸\s*/, '')
						.trim();

					addLog(logType, displayLine, description || undefined, extractedTimestamp);

					// Track step completion from pipeline steps
					const stepMatch = displayLine.match(/\[Step (\d+)/);
					if (stepMatch) {
						const stepNum = parseInt(stepMatch[1]);
						if (!completedSteps.includes(stepNum)) {
							completedSteps = [...completedSteps, stepNum].sort((a, b) => a - b);
						}
					}

					if (displayLine.includes('[Step 18]') || displayLine.includes('Section 6 -')) {
						if (!completedSteps.includes(13)) {
							completedSteps = [...completedSteps, 13].sort((a, b) => a - b);
						}
					}

					if (displayLine.includes('[Step 19]') || displayLine.includes('Section 7 -')) {
						if (!completedSteps.includes(14)) {
							completedSteps = [...completedSteps, 14].sort((a, b) => a - b);
						}
					}

					// Track section progress
					if (displayLine.includes('Section 3') || displayLine.includes('Section 4') || displayLine.includes('Section 5')) {
						// Extract all step numbers mentioned
						for (let i = 1; i <= 12; i++) {
							if (displayLine.includes(`Step ${i}`) || displayLine.includes(`[Step ${i}`)) {
								if (!completedSteps.includes(i)) {
									completedSteps = [...completedSteps, i];
								}
							}
						}
					}

					// Slight delay to show progression smoothly
					await new Promise(r => setTimeout(r, 30));
				}
			}

			addLog('success', '✨ Pipeline execution complete', `Event: ${data.event_id} | Decision: ${data.decision_id || outcomeResult?.decision_id || 'n/a'} | Outcome: ${outcomeResult?.handoff_status || outcomeResult?.outcome_status || 'n/a'} | Feedback: ${feedbackResult?.handoff_status || feedbackPackage?.summary_states?.human_review_state || 'n/a'}`);

			// Mark all main steps as complete
			completedSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
		} catch (error) {
			addLog('error', '❌ Request failed', error instanceof Error ? error.message : String(error));
		} finally {
			isRunning = false;
		}
	}

	async function runHistoricalReplay() {
		if (!selectedHistoricalCall) return;
		
		isRunning = true;
		logs = [];
		draftReply = null;
		outcomeResult = null;
		outcomePackage = null;
		feedbackResult = null;
		feedbackPackage = null;
		orchestratorDecision = null;
		evaluationResult = null;
		completedSteps = [];

		try {
			addLog('step', '🚀 Replaying Historical Pipeline...', `Event ID: ${selectedHistoricalCall.event_id}`);

			// Extract packages from database record
			if (selectedHistoricalCall.orchestrator_decisions && selectedHistoricalCall.orchestrator_decisions.length > 0) {
				orchestratorDecision = selectedHistoricalCall.orchestrator_decisions[0];
			}
			
			if (selectedHistoricalCall.signals && selectedHistoricalCall.signals.length > 0) {
				evaluationResult = { candidates: selectedHistoricalCall.signals };
				if (orchestratorDecision && orchestratorDecision.dominant_signal_id && !orchestratorDecision.dominant_signal) {
					orchestratorDecision.dominant_signal = selectedHistoricalCall.signals.find((s: any) => s.id === orchestratorDecision.dominant_signal_id);
				}
			}
			if (selectedHistoricalCall.outcomes && selectedHistoricalCall.outcomes.length > 0) {
				const outcome = selectedHistoricalCall.outcomes[0];
				outcomeResult = outcome;
				if (outcome.details) outcomePackage = outcome.details;
			}

			if (selectedHistoricalCall.feedback_records && selectedHistoricalCall.feedback_records.length > 0) {
				const feedback = selectedHistoricalCall.feedback_records[0];
				feedbackResult = feedback;
				if (feedback.details) feedbackPackage = feedback.details;
			}

			// Reconstruct AI Protocol from Enrichment data
			if (selectedHistoricalCall.enrichments && selectedHistoricalCall.enrichments.length > 0) {
				const en = selectedHistoricalCall.enrichments[0];
				aiProtocol = {
					message: selectedHistoricalCall.review_text || selectedHistoricalCall.unstructured_text?.split('--- PIPELINE LOGS ---')[0].trim() || 'No raw message stored',
					fields_to_extract: {
						contains_problem: "boolean (True if issue/complaint mentioned)",
						contains_quote_request: "boolean (True if asking for price/estimate)",
						contains_callback_request: "boolean (True if explicitly asking for a phone call back)",
						contains_emergency_keywords: "boolean (True if words like leak, flood, dangerous present)",
						requested_contact_method: "string (phone, email, text, or none)",
						service_requested: "string (specific service mentioned)",
						sentiment: "string (positive, neutral, negative)",
						praise_topics: "array (concise praise phrases)",
						complaint_topics: "array (concise complaint phrases)",
						summary: "string (one-sentence summary)",
						confidence_score: "number (0 to 1)"
					},
					raw_response: {
						contains_problem: en.ai_contains_problem,
						contains_quote_request: en.ai_contains_quote_request,
						contains_callback_request: en.ai_contains_callback_request,
						contains_emergency_keywords: en.ai_contains_emergency_keywords,
						requested_contact_method: en.ai_requested_contact_method,
						requested_action: en.ai_requested_action,
						detected_keywords: en.ai_detected_keywords,
						service_requested: en.ai_service_mentioned,
						sentiment: en.ai_sentiment,
						praise_topics: en.ai_praise_topics,
						complaint_topics: en.ai_complaint_topics,
						summary: en.ai_summary,
						confidence_score: en.ai_confidence_score,
						urgency_level: en.ai_urgency_level
					}
				};
			}

			// Look for AI Draft or SMS Dispatch in historical execution records
			draftReply = null;
			if (selectedHistoricalCall.orchestrator_decisions) {
				for (const decision of selectedHistoricalCall.orchestrator_decisions) {
					if (decision.action_queue) {
						for (const queue of decision.action_queue) {
							if (queue.executions) {
								for (const exec of queue.executions) {
									if (exec.generated_output) {
										try {
											const output = typeof exec.generated_output === 'string' ? JSON.parse(exec.generated_output) : exec.generated_output;
											if (output.draft_reply || output.sms_text || output.message) {
												draftReply = output.draft_reply || output.sms_text || output.message;
												break;
											}
										} catch (e) {
											console.error('Failed to parse historical generated output', e);
										}
									}
								}
							}
							if (draftReply) break;
						}
					}
					if (draftReply) break;
				}
			}

			// Parse logs from unstructured text
			const text = selectedHistoricalCall.unstructured_text || '';
			const parts = text.split('--- PIPELINE LOGS ---');
			
			if (parts.length > 1) {
				const rawLogs = parts[1].trim().split('\n').filter(Boolean);
				
				// Replay the logs through the exact same visual parser
				for (const logLine of rawLogs) {
					if (!logLine.trim()) continue;

					// Parse timestamp from log string [YYYY-MM-DD HH:MM:SS.mmm]
					let extractedTimestamp: string | undefined;
					const timestampMatch = logLine.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]/);
					if (timestampMatch) {
						const timestamp = timestampMatch[1];
						const [datePart, timePart] = timestamp.split(' ');
						const date = new Date(`${datePart}T${timePart}Z`);
						extractedTimestamp = date.toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							fractionalSecondDigits: 3
						});
					}

					let logType: 'info' | 'success' | 'warning' | 'error' | 'step' = 'info';
					let displayLine = logLine;
					let description = '';

					if (logLine.includes('🔴')) logType = 'error';
					else if (logLine.includes('🟡')) logType = 'warning';
					else if (logLine.includes('✅')) logType = 'success';
					else if (logLine.includes('🌸')) logType = 'info'; 
					else if (logLine.includes('🔵')) logType = 'info';
					else if (logLine.includes('ERROR')) logType = 'error';
					else if (logLine.includes('BLOCKED')) logType = 'warning';

					displayLine = displayLine
						.replace(/🔴\s*/, '')
						.replace(/✅\s*/, '')
						.replace(/🔵\s*/, '')
						.replace(/🟡\s*/, '')
						.replace(/🌸\s*/, '')
						.trim();

					addLog(logType, displayLine, description || undefined, extractedTimestamp);

					const stepMatch = displayLine.match(/\[Step (\d+)/);
					if (stepMatch) {
						const stepNum = parseInt(stepMatch[1]);
						if (!completedSteps.includes(stepNum)) {
							completedSteps = [...completedSteps, stepNum].sort((a, b) => a - b);
						}
					}

					if (displayLine.includes('[Step 18]') || displayLine.includes('Section 6 -')) {
						if (!completedSteps.includes(13)) {
							completedSteps = [...completedSteps, 13].sort((a, b) => a - b);
						}
					}

					if (displayLine.includes('[Step 19]') || displayLine.includes('Section 7 -')) {
						if (!completedSteps.includes(14)) {
							completedSteps = [...completedSteps, 14].sort((a, b) => a - b);
						}
					}

					if (displayLine.includes('Section 3') || displayLine.includes('Section 4') || displayLine.includes('Section 5')) {
						for (let i = 1; i <= 12; i++) {
							if (displayLine.includes(`Step ${i}`) || displayLine.includes(`[Step ${i}`)) {
								if (!completedSteps.includes(i)) {
									completedSteps = [...completedSteps, i];
								}
							}
						}
					}

					// Slightly faster replay for history
					await new Promise(r => setTimeout(r, 15));
				}
			} else {
				addLog('warning', 'No Terminal Logs Found', 'This call was processed before terminal logging was enabled.');
			}
			addLog('success', '✨ Historical Replay Complete', `Event: ${selectedHistoricalCall.event_id}`);
			completedSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

		} catch (error) {
			console.error(error);
			addLog('error', '❌ Replay Error', error instanceof Error ? error.message : 'Unknown error');
		} finally {
			isRunning = false;
		}
	}

	function downloadLogs() {
		if (logs.length === 0) return;
		
		let content = "--- ClearSky Pipeline Execution Logs ---\n\n";
		content += `Timestamp: ${new Date().toISOString()}\n`;
		content += `Mode: ${mode}\n`;
		if (mode !== 'history') {
			content += `Author: ${formData.author_name}\n`;
			content += `Rating: ${formData.rating} Stars\n`;
			content += `Comment: ${formData.comment}\n\n`;
		} else if (selectedHistoricalCall) {
			content += `Event ID: ${selectedHistoricalCall.event_id}\n`;
			content += `Provider: ${selectedHistoricalCall.provider}\n\n`;
		}
		
		content += "--- Execution Trace ---\n\n";
		logs.forEach(log => {
			content += `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}\n`;
			if (log.description) content += `    -> ${log.description}\n`;
		});
		
		if (aiProtocol) {
			content += "\n--- AI Protocol ---\n\n";
			const structuredObj = { ...aiProtocol.raw_response };
			delete structuredObj.urgency_level;
			structuredObj.bucket = orchestratorDecision?.dominant_signal?.bucket || 'None';
			structuredObj.priority = orchestratorDecision?.dominant_signal?.priority ?? orchestratorDecision?.priority ?? null;
			content += JSON.stringify(structuredObj, null, 2);
		}
		
		if (orchestratorDecision) {
			content += "\n\n--- Orchestrator Decision ---\n\n";
			content += JSON.stringify(orchestratorDecision, null, 2);
		}

		if (outcomePackage) {
			content += "\n\n--- Outcome Package ---\n\n";
			content += JSON.stringify(outcomePackage, null, 2);
		}

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `clearsky_pipeline_trace_${new Date().getTime()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function fetchHistoricalCalls() {
		try {
			const res = await fetch('/api/signals/recent-calls');
			const data = await res.json();
			if (data.success) {
				historicalCalls = data.events;
			}
		} catch (e) {
			console.error('Failed to fetch historical calls', e);
		}
	}

	onMount(() => {
		// Load first scenario by default
		if (scenarios.length > 0) {
			loadScenario(scenarios[1]); // Load emergency crisis as default
		}
		fetchHistoricalCalls();
	});

	const allScenarios = $derived(
		mode === 'review' ? scenarios :
		mode === 'call' ? callScenarios :
		mode === 'sms' ? smsScenarios :
		mode === 'email' ? emailScenarios :
		mode === 'faq' ? faqScenarios :
		[...scenarios, ...callScenarios, ...smsScenarios, ...emailScenarios, ...faqScenarios]
	);
</script>

<div class="flex h-screen bg-white text-text-body">
	<!-- Left Panel: Scenarios -->
	<div class="w-80 shrink-0 border-r border-slate-200 overflow-y-auto bg-white">
		<div class="sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
			<h2 class="text-lg font-bold text-text-dark">Test Center</h2>
			<div class="flex gap-2 mt-3 mb-2 bg-slate-100 p-1 rounded-xl">
				<button 
					class="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors {mode !== 'history' ? 'bg-white shadow-sm text-brand-orange' : 'text-slate-500 hover:text-slate-700'}"
					onclick={() => { mode = 'review'; loadScenario(scenarios[1]); }}
				>
					Scenarios
				</button>
				<button 
					class="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors {mode === 'history' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-500 hover:text-slate-700'}"
					onclick={() => { mode = 'history'; fetchHistoricalCalls(); }}
				>
					History
				</button>
			</div>
		</div>

		<div class="space-y-2 p-4">
			{#if mode === 'history'}
				{#if historicalCalls.length === 0}
					<div class="text-center text-slate-400 py-8 text-sm">No recent events found.</div>
				{/if}
				{#each historicalCalls as event (event.event_id)}
					<button
						onclick={() => {
							selectedHistoricalCall = event;
							runHistoricalReplay();
						}}
						class="w-full text-left p-3 rounded-[20px] transition-all border {selectedHistoricalCall === event ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white border-slate-200 hover:border-brand-blue'}"
					>
						<div class="flex items-center gap-2 mb-1">
							<span class="text-xs">{event.provider === 'telnyx_voice' ? '📞' : '💬'}</span>
							<div class="font-semibold text-sm truncate">{event.event_id}</div>
						</div>
						<div class="text-[10px] uppercase tracking-wider opacity-60 mb-1">
							{event.provider.replace('telnyx_', '')} · {event.event_type}
						</div>
						<div class="text-xs {selectedHistoricalCall === event ? 'text-white/80' : 'text-slate-500'}">
							{new Date(event.created_at).toLocaleString()}
						</div>
					</button>
				{/each}
			{:else}
				{#each allScenarios as scenario, idx (idx)}
					<button
						onclick={() => {
							// Infer mode from scenario if possible
							if (callScenarios.includes(scenario)) mode = 'call';
							else if (smsScenarios.includes(scenario)) mode = 'sms';
							else if (emailScenarios.includes(scenario)) mode = 'email';
							else if (faqScenarios.includes(scenario)) mode = 'faq';
							else mode = 'review';
							loadScenario(scenario);
						}}
						class="w-full text-left p-3 rounded-[20px] transition-all border {selectedScenario === scenario
							? (mode === 'review' ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-brand-blue text-white border-brand-blue shadow-md')
							: 'bg-white border-slate-200 hover:border-brand-blue hover:shadow-sm'}"
					>
						<div class="font-semibold text-sm">{scenario.name}</div>
						<div class="text-xs mt-1 {selectedScenario === scenario ? 'text-white/80' : 'text-slate-500'}">
							{#if scenario.rating}{scenario.rating} ⭐ — {/if}{scenario.description}
						</div>
					</button>
				{/each}
			{/if}
		</div>

		<!-- Custom Input / History Info -->
		{#if mode !== 'history'}
		<div class="border-t border-slate-200 p-4 mt-4">
			<h3 class="text-sm font-semibold text-text-dark mb-3">Custom Input</h3>
			<div class="space-y-3">
				{#if mode === 'review' || mode === 'faq'}
					<div>
						<label for="author-name" class="text-xs font-medium text-slate-300">
							{mode === 'review' ? 'Reviewer Name' : 'Customer Name'}
						</label>
						<input
							id="author-name"
							type="text"
							bind:value={formData.author_name}
							placeholder="e.g., Jane Smith"
							class="w-full mt-1 px-2 py-2 rounded-[20px] bg-white text-text-body text-xs border border-slate-200 focus:border-brand-blue outline-none"
						/>
					</div>
				{/if}
				
				{#if mode === 'email'}
					<div>
						<label for="customer-email" class="text-xs font-medium text-slate-300">Customer Email</label>
						<input
							id="customer-email"
							type="email"
							bind:value={formData.customer_email}
							placeholder="e.g., jane@example.com"
							class="w-full mt-1 px-2 py-2 rounded-[20px] bg-white text-text-body text-xs border border-slate-200 focus:border-brand-blue outline-none"
						/>
					</div>
				{/if}

				{#if mode === 'sms' || mode === 'call'}
					<div>
						<label for="customer-phone" class="text-xs font-medium text-slate-300">Customer Phone</label>
						<input
							id="customer-phone"
							type="tel"
							bind:value={formData.customer_phone}
							placeholder="e.g., +15551234567"
							class="w-full mt-1 px-2 py-2 rounded-[20px] bg-white text-text-body text-xs border border-slate-200 focus:border-brand-blue outline-none"
						/>
					</div>
				{/if}

				{#if mode === 'review'}
					<div>
						<label for="rating-select" class="text-xs font-medium text-slate-300">Rating (1-5 stars)</label>
						<div class="flex gap-2 mt-1">
							{#each [1, 2, 3, 4, 5] as star (star)}
								<button
									id={star === 1 ? 'rating-select' : undefined}
									onclick={() => (formData.rating = star)}
									class={`flex-1 py-2 rounded-[20px] text-center transition-all border ${formData.rating >= star
										? 'bg-brand-blue text-white border-brand-blue shadow-md'
										: 'bg-white text-slate-500 border-slate-200 hover:border-brand-orange hover:text-brand-orange'}`}
								>
									{star}★
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<div>
					<span class="text-xs font-medium text-slate-300">Simulate Event Type</span>
					<div class="flex flex-wrap gap-2 mt-1">
						<button 
							onclick={() => mode = 'review'}
							class={`flex-1 min-w-[70px] py-2 rounded-[20px] text-xs transition-all border ${mode === 'review' ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-brand-orange'}`}
						>
							⭐ Review
						</button>
						<button 
							onclick={() => mode = 'sms'}
							class={`flex-1 min-w-[70px] py-2 rounded-[20px] text-xs transition-all border ${mode === 'sms' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-brand-blue'}`}
						>
							💬 SMS
						</button>
						<button 
							onclick={() => mode = 'call'}
							class={`flex-1 min-w-[70px] py-2 rounded-[20px] text-xs transition-all border ${mode === 'call' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-brand-blue'}`}
						>
							📞 Call
						</button>
						<button 
							onclick={() => mode = 'email'}
							class={`flex-1 min-w-[70px] py-2 rounded-[20px] text-xs transition-all border ${mode === 'email' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-brand-blue'}`}
						>
							✉️ Email
						</button>
						<button 
							onclick={() => mode = 'faq'}
							class={`flex-1 min-w-[70px] py-2 rounded-[20px] text-xs transition-all border ${mode === 'faq' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-brand-blue'}`}
						>
							❓ FAQ
						</button>
					</div>
				</div>

				<div>
					<label for="review-comment" class="text-xs font-medium text-slate-300">
						{mode === 'review' ? 'Review Comment' : mode === 'sms' ? 'SMS Text' : mode === 'email' ? 'Email Body' : mode === 'faq' ? 'FAQ Question' : 'Call Transcript'}
					</label>
					<textarea
						id="review-comment"
						bind:value={formData.comment}
						placeholder="Enter text or transcript..."
						rows="6"
						class="w-full mt-1 px-3 py-2 rounded-[20px] bg-white text-text-body text-xs border border-slate-200 focus:border-brand-blue outline-none resize-none"
					></textarea>
				</div>
				<div class="mt-2">
					<button
						onclick={runTest}
						disabled={isRunning}
						class="w-full py-2 rounded-[20px] text-xs font-semibold bg-brand-orange text-white hover:bg-brand-orange/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm"
					>
						{isRunning ? '⏳ Running...' : '▶ Run'}
					</button>
				</div>
			</div>
		</div>
		{/if}
	</div>

	<!-- Right Panel: Pipeline View -->
	<div class="flex-1 flex flex-col min-w-0">
		<!-- Header -->
		<div class="border-b border-slate-200 bg-white p-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-text-dark">Pipeline Test Center</h1>
					<p class="text-sm text-slate-400 mt-1">Full Event-to-Outcome Pipeline (Sections 1-6 Live)</p>
				</div>
				{#if mode === 'history'}
					<div class="flex gap-2">
						<button
							onclick={downloadLogs}
							disabled={logs.length === 0}
							class="btn-outline bg-white flex items-center gap-2 text-sm"
						>
							⬇️ Download Trace
						</button>
						<button
							onclick={runHistoricalReplay}
							disabled={isRunning || !selectedHistoricalCall}
							class={`btn-primary ${isRunning || !selectedHistoricalCall ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
						>
							{isRunning ? '⏳ Replaying...' : '▶ Replay Historical Event'}
						</button>
					</div>
				{:else}
					<div class="flex gap-2">
						<button
							onclick={downloadLogs}
							disabled={logs.length === 0}
							class="btn-outline bg-white flex items-center gap-2 text-sm"
						>
							⬇️ Download Trace
						</button>
						<button
							onclick={runTest}
							disabled={isRunning}
							class={`btn-primary ${isRunning ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
						>
							{isRunning ? '⏳ Running...' : 
							mode === 'review' ? '▶ Simulate Review' : 
							mode === 'sms' ? '▶ Simulate SMS' : 
							mode === 'email' ? '▶ Simulate Email' : 
							mode === 'faq' ? '▶ Simulate FAQ' : 
							'▶ Simulate Voice Call'}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Steps Progress -->
		<div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
			<div class="text-xs font-medium text-slate-400 mb-3">Progress: {completedSteps.length} / {steps.length} Steps</div>
			<div class="grid grid-cols-14 gap-2">
				{#each steps as step (step.num)}
					<div
						class="relative group"
						title={step.name}
					>
						<button
							class={`w-full aspect-square rounded-[20px] text-center flex items-center justify-center transition-all text-xs font-medium border ${completedSteps.includes(step.num)
								? 'bg-brand-blue text-white border-brand-blue shadow-sm'
								: 'bg-white text-slate-400 border-slate-200 hover:border-brand-orange hover:text-brand-orange'}`}
						>
							{step.icon}
						</button>
						<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-[20px] bg-white border border-slate-200 text-text-body text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
							{step.name}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Logs Display -->
		<!-- Section Filter Tabs -->
			<div class="border-b border-slate-200 bg-white px-6 py-3 flex gap-2 overflow-x-auto">
			<button
				onclick={() => (activeSection = 'all')}
					class={`btn-outline whitespace-nowrap ${
					activeSection === 'all'
							? 'bg-brand-orange text-white border-brand-orange'
							: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				All Sections
			</button>
			<button
				onclick={() => (activeSection = 'section1')}
				class={`btn-outline whitespace-nowrap ${
					activeSection === 'section1'
						? 'bg-brand-orange text-white border-brand-orange'
						: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				Sections 1-2
			</button>
			<button
				onclick={() => (activeSection = 'section3')}
				class={`btn-outline whitespace-nowrap ${
					activeSection === 'section3'
						? 'bg-brand-orange text-white border-brand-orange'
						: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				Section 3
			</button>
			<button
				onclick={() => (activeSection = 'section4')}
				class={`btn-outline whitespace-nowrap ${
					activeSection === 'section4'
						? 'bg-brand-orange text-white border-brand-orange'
						: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				Section 4
			</button>
			<button
				onclick={() => (activeSection = 'section5')}
				class={`btn-outline whitespace-nowrap ${
					activeSection === 'section5'
						? 'bg-brand-orange text-white border-brand-orange'
						: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				Section 5
			</button>
			<button
				onclick={() => (activeSection = 'section6')}
				class={`btn-outline whitespace-nowrap ${
					activeSection === 'section6'
						? 'bg-brand-orange text-white border-brand-orange'
						: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				Section 6
			</button>
			<button
				onclick={() => (activeSection = 'section7')}
				class={`btn-outline whitespace-nowrap ${
					activeSection === 'section7'
						? 'bg-brand-orange text-white border-brand-orange'
						: 'bg-white text-brand-orange border-brand-orange'
				}`}
			>
				Section 7
			</button>

			{#if aiProtocol}
				<button
					onclick={() => (activeSection = 'protocol')}
					class={`btn-outline whitespace-nowrap ${
						activeSection === 'protocol'
							? 'bg-slate-800 text-white border-slate-800'
							: 'bg-white text-slate-800 border-slate-800'
					}`}
				>
					JSON Protocol
				</button>
			{/if}

			{#if outcomePackage}
				<button
					onclick={() => (activeSection = 'outcome')}
					class={`btn-outline whitespace-nowrap ${
						activeSection === 'outcome'
							? 'bg-brand-blue text-white border-brand-blue'
							: 'bg-white text-brand-blue border-brand-blue'
					}`}
				>
					Outcome Package
				</button>
			{/if}

			{#if feedbackPackage}
				<button
					onclick={() => (activeSection = 'feedback')}
					class={`btn-outline whitespace-nowrap ${
						activeSection === 'feedback'
							? 'bg-brand-blue text-white border-brand-blue'
							: 'bg-white text-brand-blue border-brand-blue'
					}`}
				>
					🧠 Feedback Package
				</button>
			{/if}

			{#if draftReply}
				<button
					onclick={() => (activeSection = 'draft')}
					class={`btn-outline whitespace-nowrap ${
						activeSection === 'draft'
							? 'bg-brand-blue text-white border-brand-blue'
							: 'bg-white text-brand-blue border-brand-blue'
					}`}
				>
					🤖 AI Draft
				</button>
			{/if}

			{#if logs.length > 0}
				<button
					onclick={() => (activeSection = 'explainer')}
					class={`btn-outline whitespace-nowrap ${
						activeSection === 'explainer'
							? 'bg-brand-orange text-white border-brand-orange'
							: 'bg-white text-brand-orange border-brand-orange'
					}`}
				>
					🧠 {isExplaining ? 'Thinking...' : 'AI Explainer'}
				</button>
			{/if}
		</div>

		<div id="pipeline-test-logs" class="flex-1 overflow-y-auto p-6 space-y-1 bg-white">
			{#if logs.length === 0}
				<div class="h-full flex items-center justify-center">
					<div class="text-center">
						<div class="text-4xl mb-4">🚀</div>
						<p class="text-slate-400 text-sm">Click "Run Pipeline Test" to start processing</p>
					</div>
				</div>
			{:else}
				{#if activeSection !== 'draft' && activeSection !== 'outcome' && activeSection !== 'feedback'}
					{#each getVisibleLogs() as log, index (log.timestamp + '-' + index)}
						<div class={`p-3 rounded border transition-all ${getLogColor(log.type)}`}>
							<div class="flex items-start gap-3">
								<span class="text-base leading-none mt-0.5 flex-shrink-0">{getLogIcon(log.type)}</span>
								<div class="flex-1 min-w-0">
									<div class="font-mono text-xs opacity-60">{log.timestamp}</div>
									<div class="font-medium text-sm mt-0.5 break-words">{log.message}</div>
									{#if log.description}
										<div class="text-xs opacity-70 mt-2 pl-3 border-l-2 border-current border-opacity-30 break-words">
											{log.description}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				{/if}

				{#if (activeSection === 'protocol') && aiProtocol}
					<div class="mt-8 p-6 rounded-[20px] bg-slate-50 border border-slate-200">
						<h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
							<span>📜</span> AI Extraction Protocol (JSON Contract)
						</h3>
						
						<div class="space-y-6">
							<!-- Request Side -->
							<div>
								<div class="flex items-center gap-2 mb-2">
									<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Request Payload</span>
									<span class="text-xs text-slate-400 font-mono">POST /v1/chat/completions</span>
								</div>
								<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
									<pre class="text-xs text-slate-700 overflow-x-auto">{JSON.stringify((() => {
										const obj = { message: aiProtocol.message, fields_to_extract: { ...aiProtocol.fields_to_extract } };
										delete obj.fields_to_extract.urgency_level;
										obj.fields_to_extract.bucket = "string (determined bucket)";
										obj.fields_to_extract.priority = "number (deterministic priority)";
										return obj;
									})(), null, 2)}</pre>
								</div>
							</div>

							<!-- Response Side -->
							<div>
								<div class="flex items-center gap-2 mb-2">
									<span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Structured Response</span>
									<span class="text-xs text-slate-400 font-mono">200 OK (Parsed JSON)</span>
								</div>
								<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
									<pre class="text-xs text-slate-700 overflow-x-auto">{JSON.stringify((() => {
										const obj = { ...aiProtocol.raw_response };
										delete obj.urgency_level;
										obj.bucket = orchestratorDecision?.dominant_signal?.bucket || 'None';
										obj.priority = orchestratorDecision?.dominant_signal?.priority ?? orchestratorDecision?.priority ?? null;
										return obj;
									})(), null, 2)}</pre>
								</div>
							</div>

							<!-- Final Mapped Result -->
							<div class="mt-6 border-t border-slate-200 pt-6">
								<div class="flex items-center gap-2 mb-4">
									<span class="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase">Final Mapped Result</span>
									<span class="text-xs text-slate-400 font-mono">EventEnrichment Schema Mapping</span>
								</div>
								
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<!-- Intent & Urgency -->
									<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
										<h4 class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Intent & Priority Mapping</h4>
										<div class="space-y-3">
											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Signal Priority</span>
													<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue uppercase">
														Bucket: {orchestratorDecision?.dominant_signal?.bucket || 'None'} | Priority: {orchestratorDecision?.dominant_signal?.priority ?? orchestratorDecision?.priority ?? '?'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">Derived from deterministic signal evaluation</span>
											</div>

											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Contains Problem</span>
													<span class="text-xs font-bold {aiProtocol.raw_response.contains_problem ? 'text-red-600' : 'text-slate-500'}">
														{aiProtocol.raw_response.contains_problem ? 'True (Flagged)' : 'False'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_contains_problem ← contains_problem</span>
											</div>

											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Emergency Keywords</span>
													<span class="text-xs font-bold {aiProtocol.raw_response.contains_emergency_keywords ? 'text-red-600' : 'text-slate-500'}">
														{aiProtocol.raw_response.contains_emergency_keywords ? 'True (Critical)' : 'False'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_contains_emergency_keywords ← contains_emergency_keywords</span>
											</div>

											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Sentiment Profile</span>
													<span class="text-xs font-bold {aiProtocol.raw_response.sentiment === 'positive' ? 'text-green-600' : aiProtocol.raw_response.sentiment === 'negative' ? 'text-red-600' : 'text-slate-500'} uppercase">
														{aiProtocol.raw_response.sentiment || 'neutral'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_sentiment ← sentiment</span>
											</div>
										</div>
									</div>

									<!-- Business Value -->
									<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
										<h4 class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Business Value Mapping</h4>
										<div class="space-y-3">
											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Quote Request</span>
													<span class="text-xs font-bold {aiProtocol.raw_response.contains_quote_request ? 'text-brand-blue' : 'text-slate-500'}">
														{aiProtocol.raw_response.contains_quote_request ? 'True (Lead)' : 'False'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_contains_quote_request ← contains_quote_request</span>
											</div>

											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Callback Request</span>
													<span class="text-xs font-bold {aiProtocol.raw_response.contains_callback_request ? 'text-brand-blue' : 'text-slate-500'}">
														{aiProtocol.raw_response.contains_callback_request ? 'True (Action Req)' : 'False'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_contains_callback_request ← contains_callback_request</span>
											</div>

											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Contact Method</span>
													<span class="text-xs font-bold text-slate-700 uppercase">
														{aiProtocol.raw_response.requested_contact_method || 'None'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_requested_contact_method ← requested_contact_method</span>
											</div>

											<div class="flex flex-col">
												<div class="flex justify-between items-center mb-1">
													<span class="text-xs font-semibold text-slate-600">Service Category</span>
													<span class="text-xs font-bold text-slate-700">
														{aiProtocol.raw_response.service_requested || 'Not specified'}
													</span>
												</div>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded w-fit">ai_service_mentioned ← service_requested</span>
											</div>
										</div>
									</div>

									<!-- Topics & Summary -->
									<div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
										<h4 class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Extracted Topics & Normalization Mapping</h4>
										
										<div class="mb-4">
											<div class="flex justify-between items-center mb-1">
												<span class="text-xs font-semibold text-slate-600">Normalized Summary</span>
												<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded">ai_summary ← summary</span>
											</div>
											<p class="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-100">{aiProtocol.raw_response.summary || 'No summary generated.'}</p>
										</div>

										<div class="grid grid-cols-2 gap-4">
											<div>
												<div class="flex items-center justify-between mb-2">
													<span class="text-xs font-semibold text-slate-600">Praise Topics</span>
													<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded">ai_praise_topics</span>
												</div>
												{#if aiProtocol.raw_response.praise_topics?.length > 0}
													<div class="flex flex-wrap gap-1.5">
														{#each aiProtocol.raw_response.praise_topics as topic}
															<span class="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-100 font-medium">{topic}</span>
														{/each}
													</div>
												{:else}
													<span class="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded">None extracted (Empty Array)</span>
												{/if}
											</div>
											<div>
												<div class="flex items-center justify-between mb-2">
													<span class="text-xs font-semibold text-slate-600">Complaint Topics</span>
													<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded">ai_complaint_topics</span>
												</div>
												{#if aiProtocol.raw_response.complaint_topics?.length > 0}
													<div class="flex flex-wrap gap-1.5">
														{#each aiProtocol.raw_response.complaint_topics as topic}
															<span class="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100 font-medium">{topic}</span>
														{/each}
													</div>
												{:else}
													<span class="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded">None extracted (Empty Array)</span>
												{/if}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="p-4 bg-amber-50 border border-amber-100 rounded-xl">
								<div class="flex gap-3">
									<span class="text-lg">💡</span>
									<p class="text-xs text-amber-800 leading-relaxed">
										This view represents the <strong>Deterministic Contract</strong> between the Application and the AI. 
										The AI is forbidden from making business decisions; it only extracts the raw facts listed in the <code>fields_to_extract</code>.
										Business logic is applied only AFTER this step by the <strong>Deterministic Signal Engine</strong>.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				{#if (activeSection === 'all' || activeSection === 'outcome') && outcomePackage}
					<div class="mt-8 p-6 rounded-[20px] bg-brand-orange/5 border border-brand-orange/20">
						<h3 class="text-lg font-bold text-brand-orange mb-4 flex items-center gap-2">
							<span>📊</span> Section 6 Outcome Package
						</h3>
						<div class="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
								<div><span class="font-semibold text-text-dark">Status:</span> <span class="text-slate-600">{outcomePackage.section_6_status}</span></div>
								<div><span class="font-semibold text-text-dark">Handoff:</span> <span class="text-slate-600">{outcomePackage.handoff_status}</span></div>
								<div><span class="font-semibold text-text-dark">Outcomes:</span> <span class="text-slate-600">{outcomePackage.outcome_records?.length || 0}</span></div>
								<div><span class="font-semibold text-text-dark">Blocked Context:</span> <span class="text-slate-600">{outcomePackage.blocked_no_external_action_context?.length || 0}</span></div>
							</div>
							<pre class="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-[20px] text-xs text-slate-700 overflow-x-auto">{JSON.stringify(outcomePackage, null, 2)}</pre>
						</div>
					</div>
				{/if}

				{#if (activeSection === 'all' || activeSection === 'protocol') && orchestratorDecision}
					<div class="mt-8 p-6 rounded-[20px] bg-brand-blue/5 border border-brand-blue/20">
						<h3 class="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
							<span>🎯</span> Signal Mapping & Orchestrator Decision
						</h3>
						
						<div class="space-y-6">
							<!-- 1. Rules Evaluated -->
							{#if evaluationResult?.candidates}
								<div>
									<h4 class="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">1. Evaluated Signals</h4>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
										{#each evaluationResult.candidates as candidate}
											<div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
												<div class="flex justify-between items-start mb-2">
													<div class="flex flex-col">
														<span class="font-bold text-xs text-text-dark">{candidate.name || candidate.signal_rule_id}</span>
														{#if candidate.name && candidate.signal_rule_id}
															<span class="text-[10px] text-slate-400 font-mono mt-0.5">{candidate.signal_rule_id}</span>
														{/if}
													</div>
												</div>
												<div class="text-[10px] text-slate-500 font-mono mt-auto">Bucket: {candidate.bucket} | Priority: {candidate.priority}</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}

					

							<!-- 3. Action Mapping -->
							{#if orchestratorDecision.action_queue}
								<div>
									<h4 class="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">2. Orchestrated Action Queue</h4>
									<div class="space-y-3">
										{#each orchestratorDecision.action_queue as queue}
											<div class="bg-white p-3 rounded-xl border-l-4 border-l-brand-orange border-y border-r border-y-slate-200 border-r-slate-200 shadow-sm">
												<div class="flex justify-between items-center mb-1">
													<div class="font-bold text-sm text-text-dark">{queue.action_library_id}</div>
													<div class="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">{queue.status}</div>
												</div>
												{#if queue.parameters}
													<pre class="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded">{JSON.stringify(typeof queue.parameters === 'string' ? JSON.parse(queue.parameters) : queue.parameters, null, 2)}</pre>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				{#if (activeSection === 'all' || activeSection === 'feedback') && feedbackPackage}
					<div class="mt-8 p-6 rounded-[20px] bg-brand-blue/5 border border-brand-blue/20">
						<h3 class="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2">
							<span>🧠</span> Section 7 Feedback Package
						</h3>
						<div class="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm">
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
								<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="font-semibold text-text-dark mb-1 text-xs uppercase opacity-50">Signal Validity</div>
									<div class="text-slate-700 font-medium">{feedbackPackage.summary_states.signal_validity}</div>
								</div>
								<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="font-semibold text-text-dark mb-1 text-xs uppercase opacity-50">Decision Quality</div>
									<div class="text-slate-700 font-medium">{feedbackPackage.summary_states.decision_quality}</div>
								</div>
								<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="font-semibold text-text-dark mb-1 text-xs uppercase opacity-50">Execution Quality</div>
									<div class="text-slate-700 font-medium">{feedbackPackage.summary_states.action_execution_quality}</div>
								</div>
								<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="font-semibold text-text-dark mb-1 text-xs uppercase opacity-50">Outcome Result</div>
									<div class="text-slate-700 font-medium">{feedbackPackage.summary_states.outcome_result}</div>
								</div>
								<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="font-semibold text-text-dark mb-1 text-xs uppercase opacity-50">Human Review</div>
									<div class="text-slate-700 font-medium">{feedbackPackage.summary_states.human_review_state}</div>
								</div>
								<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="font-semibold text-text-dark mb-1 text-xs uppercase opacity-50">Production Changes</div>
									<div class="text-slate-700 font-medium">{feedbackPackage.production_changes_applied ? 'APPLIED (Violation)' : 'NONE'}</div>
								</div>
							</div>
							<pre class="p-3 bg-slate-50 border border-slate-200 rounded-[20px] text-xs text-slate-700 overflow-x-auto">{JSON.stringify(feedbackPackage, null, 2)}</pre>
						</div>
					</div>
				{/if}

				{#if (activeSection === 'all' || activeSection === 'draft')}
					<div class="mt-8 p-6 rounded-[20px] bg-brand-blue/5 border border-brand-blue/20">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-bold text-brand-blue flex items-center gap-2">
								<span>🤖</span> {draftReply?.includes('[ClearSky') ? 'Operational Dispatch' : 'AI Draft Reply'}
							</h3>
							{#if outcomeResult?.dominant_signal || (selectedHistoricalCall?.orchestrator_decisions?.[0]?.dominant_signal)}
								{@const sig = outcomeResult?.dominant_signal || selectedHistoricalCall?.orchestrator_decisions?.[0]?.dominant_signal}
								<div class="flex items-center gap-2 px-3 py-1 bg-white border border-brand-blue/20 rounded-full shadow-sm">
									<span class="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Dominant Signal:</span>
									<span class="text-[10px] font-black text-text-dark uppercase">{sig.name || sig.signal_rule_id}</span>
								</div>
							{/if}
						</div>

						{#if draftReply}
							<div class="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm prose prose-sm max-w-none text-text-dark whitespace-pre-wrap mb-4">
								{draftReply}
							</div>

							<div class="flex justify-end gap-3">

								<button class="btn-outline px-4 py-2 rounded-lg text-sm">Edit Draft</button>
								<button class="btn-primary px-6 py-2 rounded-lg text-sm bg-brand-blue border-brand-blue">Approve & Send</button>
							</div>
							<div class="mt-4 flex justify-between items-center text-xs text-slate-400 italic">
								<span>Generated by ClearSky AI Decision Engine</span>
								<span>Ready for consultant approval</span>
							</div>
						{:else}
							<div class="text-center py-12 text-slate-400">
								No draft generated for this event type.
							</div>
						{/if}
					</div>
				{/if}

				{#if activeSection === 'explainer'}
					<div class="mt-8 p-6 rounded-[20px] bg-brand-orange/5 border border-brand-orange/20">
						<h3 class="text-lg font-bold text-brand-orange mb-4 flex items-center gap-2">
							<span>🧠</span> Pipeline Intelligence Explainer
						</h3>
						{#if isExplaining}
							<div class="flex flex-col items-center justify-center py-12">
								<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
								<p class="text-sm text-brand-orange mt-4">Analyzing pipeline execution logs...</p>
							</div>
						{:else if aiExplainerText}
							<div class="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm prose prose-sm max-w-none text-text-dark whitespace-pre-wrap">
								{aiExplainerText}
							</div>

						{:else}
							<div class="flex flex-col items-center justify-center py-12 bg-white rounded-[20px] border border-slate-200">
								<p class="text-sm text-slate-400 mb-4 text-center px-8">Ready to analyze the pipeline execution. This will use AI to translate the technical logs into a human-readable summary.</p>
								<button 
									onclick={generateExplainer}
									class="btn-primary flex items-center gap-2"
								>
									<span>✨</span> Generate Intelligence Explanation
								</button>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
