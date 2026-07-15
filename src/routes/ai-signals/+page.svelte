<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { dashboardState } from '../../lib/clearsky/dashboard-state.svelte.ts';

	/**
	 * DASHBOARD TYPES & CONSTANTS
	 */
	const sidebarViews = [
		'urgent', 'approval', 'signals', 'assigned', 'waiting',
		'automated', 'blocked', 'completed'
	] as const;
	type SidebarView = (typeof sidebarViews)[number] | null;
	type SearchMode = 'all' | 'sector' | 'business' | 'source' | 'signal' | 'status' | 'sla';
	type SortMode = 'priority' | 'time';

	// Local UI State
	let searchQuery = $state('');
	let sidebarView = $state<SidebarView>(null); // Start with 'All' (null) for visibility
	let searchMode = $state<SearchMode>('all');
	let sortMode = $state<SortMode>('priority');
	let detailOpen = $state(true); // Default to open for the new 3-column layout
	let visibleCount = $state(20);

	let filterSector = $state('');
	let filterBusiness = $state('');
	let filterSource = $state('');
	let filterSignal = $state('');
	let filterStatus = $state('');
	let filterSla = $state('');

	const sidebarMeta: Record<Exclude<SidebarView, null>, { label: string; icon: string; tone: string }> = {
		urgent: { label: 'Urgent Now', icon: '⚡', tone: 'red' },
		approval: { label: 'Needs Approval', icon: '◴', tone: 'orange' },
		signals: { label: 'New Signals', icon: '⌁', tone: 'blue' },
		assigned: { label: 'Assigned to Me', icon: '♟', tone: 'ink' },
		waiting: { label: 'Waiting on Business', icon: '◷', tone: 'purple' },
		automated: { label: 'Automated', icon: '⚙', tone: 'green' },
		blocked: { label: 'Blocked / Needs Review', icon: '🛡', tone: 'red-outline' },
		completed: { label: 'Completed', icon: '✓', tone: 'green' }
	};

	// Derived Data from Global State
	const dashboard = $derived(dashboardState.data);
	const selectedId = $derived(dashboardState.selectedEventId);
	const currentEnrichment = $derived(dashboardState.currentEnrichment);

	function getSourceIcon(source: string) {
		const s = source.toLowerCase();
		if (s.includes('sms')) return '💬';
		if (s.includes('call') || s.includes('voice')) return '📞';
		if (s.includes('email')) return '✉';
		if (s.includes('review') || s.includes('google')) return '☆';
		return '◎';
	}

	function getSignalIcon(bucket: string) {
		if (bucket === 'Risk') return '▥';
		if (bucket === 'Opportunity') return '✧';
		if (bucket === 'Bottleneck') return '🛡';
		return '⌁';
	}

	function getLogoClass(name: string) {
		const n = name.toLowerCase();
		if (n.includes('apex')) return 'apex';
		if (n.includes('lodge')) return 'lodge';
		if (n.includes('smith')) return 'sa';
		if (n.includes('northern')) return 'nc';
		if (n.includes('dental')) return 'dental';
		if (n.includes('market')) return 'market';
		return '';
	}

	/**
	 * CORE DATA PIPELINE: Mapping -> Filtering -> Sorting
	 * This is the single source of truth for the list.
	 */
	const rawQueueRecords = $derived.by(() => {
		const events = dashboard.events ?? [];
		const signals = dashboard.signals ?? [];
		const enrichments = dashboard.enrichments ?? {};
		const approvals = dashboard.approvals ?? [];
		const actions = dashboard.actionQueue ?? [];
		const outcomes = dashboard.outcomes ?? [];

		const recordsFromSignals = signals.map((signal) => {
			const event = events.find((e: any) => e.id === signal.event_id) ?? null;
			const action = actions.find((a: any) => a.signal_id === signal.id || (event && a.event_id === event.id)) ?? null;
			const approval = approvals.find((a: any) => (event && a.event_id === event.id) && a.status === 'pending') ?? null;
			const outcome = outcomes.find((o: any) => action && o.action_id === action.id) ?? null;
			const enrichment = event ? enrichments[event.id] : null;

			const bucket = signal.bucket || 'Momentum';
			const name = event ? formatLabel(event.provider_id || event.provider) : 'System Alert';
			const sector = event ? formatLabel(event.network_category) : 'Internal';
			const source = event ? formatQueueLabel(event.event_type) : 'AI Engine';
			const signalName = formatQueueLabel(signal.name || 'Engagement Momentum');
			const summary = summarizeEvent(event, enrichment, signal);
			const shortDesc = makeShortDescription(summary);
			const recommendedAction = resolveRecommendedAction(event, signal, action);
			const shortSuggestion = makeShortSuggestion(action, signal, approval);
			const priorityClass = bucketClass(bucket);
			const badgeClass = statusClass(action, approval);
			const badgeLabel = approval ? 'Needs Approval' : action?.status === 'queued' ? 'Queued' : 'New';
			const slaLabel = deriveSla(event, signal, enrichment, action, approval);

			return {
				id: signal.id,
				event, signal, action, approval, outcome, enrichment,
				name, sector, source, signalName, summary, shortDesc, shortSuggestion, recommendedAction, bucket,
				priorityClass, badgeClass, badgeLabel, slaLabel,
				selected: selectedId === event?.id || selectedId === signal.id,
				hasApproval: Boolean(approval),
				sourceIcon: getSourceIcon(source),
				signalIcon: getSignalIcon(bucket),
				logoClass: getLogoClass(name)
			};
		});

		const signalEventIds = new Set(signals.map(s => s.event_id).filter(Boolean));
		const recordsFromOrphanEvents = events
			.filter(e => !signalEventIds.has(e.id))
			.map((event) => {
				const enrichment = enrichments[event.id] ?? null;
				const hasCompletedExtraction = Boolean(
					enrichment && (
						typeof enrichment.summary === 'string' && enrichment.summary.trim().length > 0 ||
						typeof enrichment.service_requested === 'string' && enrichment.service_requested.trim().length > 0
					)
				);
				const summary = event.unstructured_text || 'Raw intake event.';
				const shortDesc = makeShortDescription(summary);
				const recommendedAction = resolveRecommendedAction(event, null, null);
				const name = formatLabel(event.provider_id || event.provider);
				return {
					id: event.id,
					event, signal: null, action: null, approval: null, outcome: null, enrichment,
					name,
					sector: formatLabel(event.network_category),
					source: formatQueueLabel(event.event_type),
					signalName: hasCompletedExtraction ? 'Intake Ready' : 'Processing Intake...',
					summary,
					shortDesc,
					recommendedAction,
					shortSuggestion: hasCompletedExtraction ? 'Review extracted intake' : 'Waiting for extraction',
					bucket: 'Intake',
					priorityClass: 'p3',
					badgeClass: 'new',
					badgeLabel: hasCompletedExtraction ? 'Ready' : 'Intake',
					slaLabel: deriveSla(event, null, enrichment, null, null),
					selected: selectedId === event.id,
					hasApproval: false,
					sourceIcon: getSourceIcon(event.event_type),
					signalIcon: '▧',
					logoClass: getLogoClass(name)
				};
			});

		const combined = [...recordsFromSignals, ...recordsFromOrphanEvents];
		
		// DEDUPLICATION: Group by stable Event Identity
		const eventMap = new SvelteMap<string, any>();
		for (const record of combined) {
			// Prefer provider_event_id or review_id for stable identity
			const stableId = record.event?.provider_event_id || record.event?.review_id || record.event?.id || record.id;
			
			const existing = eventMap.get(stableId);
			if (!existing) {
				eventMap.set(stableId, record);
			} else {
				// Pick higher priority
				const w = (p: string) => (p === 'p1' ? 1 : p === 'p2' ? 2 : (p === 'p3' ? 3 : 4));
				if (w(record.priorityClass) < w(existing.priorityClass)) {
					eventMap.set(stableId, record);
				}
			}
		}

		return Array.from(eventMap.values());
	});

	const queueRecords = $derived.by(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		return rawQueueRecords
			.filter(record => matchesSidebarView(record))
			.filter(record => matchesFilters(record))
			.filter(record => matchesSearch(record, normalizedQuery))
			.sort(compareQueueRecords);
	});

	/**
	 * SELECTION LOGIC
	 * Stable selection that looks in raw data, not just filtered results.
	 */
	const selectedRecord = $derived.by(() => {
		if (!selectedId) return null;
		
		// 1. Try finding by Signal ID
		const signal = (dashboard.signals ?? []).find((s: any) => s.id === selectedId);
		if (signal) {
			const event = (dashboard.events ?? []).find((e: any) => e.id === signal.event_id);
			if (event) {
				return {
					event,
					signal,
					action: (dashboard.actionQueue ?? []).find((a: any) => a.event_id === event.id) ?? null,
					approval: (dashboard.approvals ?? []).find((a: any) => a.event_id === event.id && a.status === 'pending') ?? null,
					enrichment: (dashboard.enrichments ?? {})[event.id] ?? null
				};
			}
		}

		// 2. Try finding by Event ID (for orphan events or direct selection)
		const event = (dashboard.events ?? []).find((e: any) => e.id === selectedId);
		if (event) {
			return {
				event,
				signal: (dashboard.signals ?? []).find((s: any) => s.event_id === event.id) ?? null,
				action: (dashboard.actionQueue ?? []).find((a: any) => a.event_id === event.id) ?? null,
				approval: (dashboard.approvals ?? []).find((a: any) => a.event_id === event.id && a.status === 'pending') ?? null,
				enrichment: (dashboard.enrichments ?? {})[event.id] ?? null
			};
		}

		return null;
	});

	const selectedEvent = $derived(selectedRecord?.event ?? null);
	const selectedSignal = $derived(selectedRecord?.signal ?? null);
	const selectedAction = $derived(selectedRecord?.action ?? null);
	const selectedApproval = $derived(selectedRecord?.approval ?? null);
	const selectedQueueItem = $derived.by(() => {
		if (!selectedEvent) return null;
		return rawQueueRecords.find((r: any) => r.event?.id === selectedEvent.id) ?? null;
	});
	const selectedRecommendedAction = $derived.by(() => {
		if (!selectedEvent) return null;
		return selectedQueueItem?.recommendedAction ?? resolveRecommendedAction(selectedEvent, selectedSignal, selectedAction);
	});

	// Counters for sidebar (always based on total data)
	const sidebarCounts = $derived.by(() => {
		const signals = dashboard.signals ?? [];
		const approvals = dashboard.approvals ?? [];
		const actions = dashboard.actionQueue ?? [];
		const outcomes = dashboard.outcomes ?? [];

		return {
			urgent: signals.filter((s: any) => s.bucket === 'Risk').length,
			approval: approvals.filter((a: any) => a.status === 'pending').length,
			signals: signals.length, // Updated to match view key
			assigned: actions.length,
			waiting: approvals.filter((a: any) => a.status === 'pending').length + actions.filter((a: any) => a.execution_mode === 'approval_required').length,
			automated: actions.filter((a: any) => a.execution_mode === 'automatic').length,
			blocked: signals.filter((s: any) => s.bucket === 'Bottleneck').length + approvals.length,
			completed: outcomes.length,
			overdue: actions.filter((a: any) => a.priority <= 1 && a.status !== 'completed').length
		};
	});

	const headlineCounts = $derived.by(() => ({
		urgent: (dashboard.signals ?? []).filter((s: any) => s.bucket === 'Risk').length,
		approval: (dashboard.approvals ?? []).length,
		overdue: (dashboard.actionQueue ?? []).filter((a: any) => a.priority <= 1 && a.status !== 'completed').length
	}));

	const visibleQueueRecords = $derived(queueRecords.slice(0, visibleCount));
	const canShowMore = $derived(visibleCount < queueRecords.length);

	const filterOptions = $derived.by(() => {
		const unique = (values: string[]) => Array.from(new Set(values)).sort();
		return {
			sectors: unique(rawQueueRecords.map(r => r.sector).filter(Boolean)),
			businesses: unique(rawQueueRecords.map(r => r.name).filter(Boolean)),
			sources: unique(rawQueueRecords.map(r => r.source).filter(Boolean)),
			signals: unique(rawQueueRecords.map(r => r.signalName).filter(Boolean)),
			statuses: unique(rawQueueRecords.map(r => r.badgeLabel).filter(Boolean)),
			slas: unique(rawQueueRecords.map(r => r.slaLabel).filter(Boolean))
		};
	});

	/**
	 * ACTION HANDLERS
	 */
	onMount(() => {
		// Poll check to see if we have data yet, if not, wait for first sync
		const checkInterval = setInterval(() => {
			if ((dashboard.events ?? []).length > 0) {
				if (!dashboardState.selectedEventId) {
					dashboardState.selectEvent(dashboard.events[0].id);
				}
				// Default to 'urgent' if there are urgent items, else 'signals'
				if (!sidebarView) {
					sidebarView = sidebarCounts.urgent > 0 ? 'urgent' : 'signals';
				}
				clearInterval(checkInterval);
			}
		}, 1000);

		return () => clearInterval(checkInterval);
	});

	function selectEvent(id: string) {
		dashboardState.selectEvent(id);
		detailOpen = true;
	}

	function setSidebarView(view: SidebarView) {
		sidebarView = view;
		visibleCount = 20; // Reset scroll on view change
	}

	function clearAll() {
		sidebarView = null;
		searchQuery = '';
		searchMode = 'all';
		sortMode = 'priority';
		visibleCount = 20;
		filterSector = '';
		filterBusiness = '';
		filterSource = '';
		filterSignal = '';
		filterStatus = '';
		filterSla = '';
	}

	function resetFocus() {
		clearAll();
		sidebarView = 'urgent';
		detailOpen = false;
	}

	function approveItem(eventId: string, edited: boolean = false) {
		const approval = (dashboard.approvals ?? []).find(
			(a: any) => a.event_id === eventId && a.status === 'pending'
		);
		if (approval) dashboardState.approveApproval(approval.id, edited);
	}

	function discardItem(eventId: string) {
		const approval = (dashboard.approvals ?? []).find(
			(a: any) => a.event_id === eventId && a.status === 'pending'
		);
		if (approval) dashboardState.discardApproval(approval.id);
	}

	/**
	 * FILTERING LOGIC
	 */
	function matchesSidebarView(record: any) {
		if (!sidebarView) return true;
		switch (sidebarView) {
			case 'urgent': return record.bucket === 'Risk';
			case 'approval': return Boolean(record.approval);
			case 'signals': return Boolean(record.signal);
			case 'assigned': return Boolean(record.action);
			case 'waiting': return Boolean(record.approval) || record.action?.execution_mode === 'approval_required';
			case 'automated': return record.action?.execution_mode === 'automatic';
			case 'blocked': return record.bucket === 'Bottleneck' || Boolean(record.approval);
			case 'completed': return Boolean(record.outcome);
			default: return true;
		}
	}

	function matchesSearch(record: any, query: string) {
		if (!query) return true;
		const searchFields = [
			record.name, record.sector, record.source, record.signalName, record.summary, record.bucket
		];
		return searchFields.some(f => String(f ?? '').toLowerCase().includes(query));
	}

	function matchesFilters(record: any) {
		if (filterSector && record.sector !== filterSector) return false;
		if (filterBusiness && record.name !== filterBusiness) return false;
		if (filterSource && record.source !== filterSource) return false;
		if (filterSignal && record.signalName !== filterSignal) return false;
		if (filterStatus && record.badgeLabel !== filterStatus) return false;
		if (filterSla && record.slaLabel !== filterSla) return false;
		return true;
	}

	function compareQueueRecords(left: any, right: any) {
		const w = (p: string) => (p === 'p1' ? 1 : p === 'p2' ? 2 : 3);
		
		// If sorting by time, show newest first
		if (sortMode === 'time') {
			const leftTime = new Date(left.event?.created_at || 0).getTime();
			const rightTime = new Date(right.event?.created_at || 0).getTime();
			return rightTime - leftTime;
		}
		
		// Default: Sort by priority
		// 1. Primary Sort: Priority Class (p1 > p2 > p3)
		const leftWeight = w(left.priorityClass);
		const rightWeight = w(right.priorityClass);
		if (leftWeight !== rightWeight) return leftWeight - rightWeight;

		// 2. Secondary Sort: Urgency Level (high > medium > low > null)
		const urgencyMap: Record<string, number> = { high: 1, medium: 2, low: 3 };
		const leftUrgencyVal = left.enrichment?.ai_urgency_level || left.enrichment?.urgency_level;
		const rightUrgencyVal = right.enrichment?.ai_urgency_level || right.enrichment?.urgency_level;
		const leftUrgency = urgencyMap[leftUrgencyVal?.toLowerCase() || ''] || 4;
		const rightUrgency = urgencyMap[rightUrgencyVal?.toLowerCase() || ''] || 4;
		if (leftUrgency !== rightUrgency) return leftUrgency - rightUrgency;

		// 3. Tertiary Sort: Recency (Newest first)
		const leftTime = new Date(left.event?.created_at || 0).getTime();
		const rightTime = new Date(right.event?.created_at || 0).getTime();
		return rightTime - leftTime;
	}

	function formatLabel(v: any) {
		return (v ?? 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
	}

	function formatQueueLabel(value: unknown) {
		const raw = typeof value === 'string' ? value : value == null ? '' : String(value);
		const normalized = raw.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
		if (!normalized) return 'Unknown';

		const acronyms = new Set(['sms', 'ai', 'api', 'crm', 'gbp', 'id', 'ui', 'ux', 'url', 'sql', 'dns', 'ssl', 'http', 'https']);
		const smallWords = new Set(['and', 'or', 'to', 'at', 'of', 'in', 'on', 'for', 'by', 'with', 'from', 'the', 'a', 'an']);

		return normalized
			.split(' ')
			.map((word, index) => {
				const clean = word.replace(/[^A-Za-z0-9'.-]/g, '');
				const lower = clean.toLowerCase();

				if (acronyms.has(lower)) return lower.toUpperCase();
				if (index > 0 && smallWords.has(lower)) return lower;
				if (/^[A-Z0-9]{2,}$/.test(clean)) return clean;
				if (!clean) return word;
				return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
			})
			.join(' ');
	}

	function formatDetailLabel(value: unknown, fallback = 'Unknown') {
		const raw = typeof value === 'string' ? value : value == null ? '' : String(value);
		const normalized = raw
			.replace(/[_-]+/g, ' ')
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/\s+/g, ' ')
			.trim();

		if (!normalized) return fallback;

		return normalized
			.split(' ')
			.map((word) => {
				if (/^[A-Z0-9]{2,}$/.test(word)) return word;
				if (word.length <= 3) return word.toUpperCase();
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			})
			.join(' ');
	}

	function formatDetailValue(value: unknown, fallback = 'Not available') {
		if (value == null) return fallback;
		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (!trimmed) return fallback;
			return trimmed;
		}
		return String(value);
	}

	function formatRelative(iso: any) {
		if (!iso) return 'Just now';
		const d = new Date(iso);
		const diff = Math.round((Date.now() - d.getTime()) / 1000);
		if (diff < 60) return `${Math.max(1, diff)}s ago`;
		const diffMin = Math.round(diff / 60);
		if (diffMin < 60) return `${diffMin} min ago`;
		return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}

	function summarizeEvent(event: any, enrichment: any, signal: any) {
		const base = enrichment?.summary ?? event?.unstructured_text ?? 'Live signal ready.';
		if (signal?.bucket === 'Risk') return `${base} High-priority escalation.`;
		return base;
	}

	function makeShortDescription(text: string) {
		const cleaned = String(text ?? '').replace(/\s+/g, ' ').trim();
		if (!cleaned) return 'No summary available.';
		const sentence = cleaned.split(/[.!?]/)[0] || cleaned;
		return sentence.length > 52 ? `${sentence.slice(0, 49)}...` : sentence;
	}

	function makeShortSuggestion(action: any, signal: any, approval: any) {
		const title = String(action?.title ?? '').replace(/\s+/g, ' ').trim();
		if (title) {
			return title.length > 34 ? `${title.slice(0, 31)}...` : title;
		}
		if (approval) return 'Approve recommended action';
		if (signal?.bucket === 'Risk') return 'Send urgent follow-up';
		if (signal?.bucket === 'Bottleneck') return 'Draft recovery response';
		if (signal?.bucket === 'Opportunity') return 'Contact lead now';
		return 'Review and assign';
	}

	function bucketClass(b: string) {
		return (b === 'Risk' || b === 'Bottleneck') ? 'p1' : (b === 'Opportunity' ? 'p2' : 'p3');
	}

	function resolveRecommendedAction(event: any, signal: any, currentAction: any) {
		const networkCategory = String(event?.network_category ?? '').trim();
		const eventType = String(event?.event_type ?? '').trim();
		const providerId = String(event?.provider_id || event?.provider || '').trim();
		const bucket = String(signal?.bucket ?? '').trim();

		if (networkCategory === 'Systems' || providerId === 'system_health' || eventType.includes('alert')) {
			return { actionId: 'ACT-SYS-004', title: 'Trigger System Health Check', executionMode: 'automatic', owner: 'Automation Engine' };
		}

		if (eventType === 'review_received' || bucket === 'Bottleneck') {
			return { actionId: 'ACT-REV-001', title: 'Draft Review Response', executionMode: 'approval_required', owner: 'Business Owner' };
		}

		if (networkCategory === 'Communication' || providerId === 'telnyx_voice' || providerId === 'telnyx_sms' || providerId === 'email_provider') {
			return {
				actionId: 'ACT-COM-002',
				title: bucket === 'Risk' ? 'Send urgent follow-up' : 'Send follow-up',
				executionMode: 'approval_required',
				owner: 'Business Owner'
			};
		}

		if (networkCategory === 'Conversion' || networkCategory === 'Growth') {
			return { actionId: 'ACT-CRM-003', title: 'Update CRM Record', executionMode: 'automatic', owner: 'Automation Engine' };
		}

		if (currentAction?.action_id || currentAction?.title) {
			return {
				actionId: currentAction.action_id ?? null,
				title: currentAction.title ?? 'Review signal',
				executionMode: currentAction.execution_mode ?? 'approval_required',
				owner: deriveActionOwner(currentAction) ?? 'Business Owner'
			};
		}

		return {
			actionId: null,
			title: 'Review and assign',
			executionMode: 'approval_required',
			owner: 'Business Owner'
		};
	}

	function statusClass(a: any, app: any) {
		if (app) return 'approval';
		if (a?.execution_mode === 'automatic') return 'assigned';
		return 'new';
	}

	function deriveSla(event: any, signal: any, enrichment: any, action: any, approval: any) {
		const endSource = signal?.created_at ?? enrichment?.created_at ?? action?.created_at;

		if (endSource) {
			const end = new Date(endSource).getTime();
			if (!Number.isNaN(end)) {
				return formatRelative(endSource);
			}
		}

		if (approval) return 'Needs review';
		if (signal || enrichment) return 'Ready';
		return 'Processing';
	}

	const mappingData = $derived.by(() => {
		if (!selectedEvent) return null;
		return {
			sourceEventName: selectedEvent.event_type,
			clearSkyEventName: 'ClearSky Signal',
			sourceOfEvent: formatLabel((selectedEvent.provider_id || selectedEvent.provider)),
			categoryOfEvent: formatLabel(selectedEvent.network_category)
		};
	});

	function requireString(value: unknown, key: string, missing: string[]) {
		if (typeof value === 'string' && value.trim().length > 0) return value.trim();
		missing.push(key);
		return '';
	}

	function nullableString(value: unknown) {
		if (typeof value === 'string' && value.trim().length > 0) return value.trim();
		return null;
	}

	function formatRelativeStrict(iso: string) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) throw new Error('Invalid timestamp');
		const diff = Math.round((Date.now() - d.getTime()) / 60000);
		if (diff < 60) return `${Math.max(1, diff)} min ago`;
		return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}

	function deriveActionOwner(action: any) {
		if (typeof action?.owner === 'string' && action.owner.trim().length > 0) return action.owner.trim();
		if (action?.execution_mode === 'approval_required') return 'Business Owner';
		if (action?.execution_mode === 'automatic') return 'Automation Engine';
		return null;
	}

	function deriveCustomerName(enrichment: any, event: any) {
		const provider = String(event?.provider_id ?? '');
		const seed = String(event?.id ?? event?.event_id ?? event?.provider_id ?? '0');
		
		const explicit = (enrichment as any)?.customer_name ?? 
						 (event as any)?.customer_name ?? 
						 (event as any)?.reviewer_display_name ?? 
						 (event as any)?.author_name;

		if (typeof explicit === 'string' && explicit.trim().length > 0) {
			const cleanExplicit = explicit.trim();
			if (isLikelyPersonName(cleanExplicit) || isEmail(cleanExplicit) || isPhone(cleanExplicit)) {
				return cleanExplicit;
			}
		}

		const text = String(event?.unstructured_text ?? '');
		if (!text) return fallbackCustomerByProvider(provider, seed);

		const emailMatch = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}\b/);
		if (emailMatch?.[0]) return emailMatch[0];

		const phoneMatch = text.match(/(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/);
		if (phoneMatch?.[0]) return phoneMatch[0].trim();

		const namedPatterns = [
			/\b(?:my name is|i am|i'm|this is|name is)\s+([A-Za-z]+(?:\s+[A-Za-z\.]+){0,2})\b/i,
			/\b(?:customer(?:'s)? name is|contact(?:\s+name)?\s+is|signed\s+by)\s+([A-Za-z]+(?:\s+[A-Za-z\.]+){0,2})\b/i
		];

		for (const p of namedPatterns) {
			const m = text.match(p);
			if (m?.[1]) {
				const candidate = m[1].trim();
				if (isLikelyPersonName(candidate)) return candidate;
			}
		}

		return fallbackCustomerByProvider(provider, seed);
	}

	function fallbackCustomerByProvider(provider: string, seed: string) {
		if (provider === 'telnyx_voice' || provider === 'telnyx_sms') return fallbackPhoneNumber(seed);
		if (provider === 'email_provider') return fallbackEmail(seed);
		if (provider === 'google_business_profile') return fallbackName(seed);
		return fallbackName(seed);
	}

	function fallbackPhoneNumber(seed: string) {
		let value = 0;
		for (let index = 0; index < seed.length; index += 1) {
			value = (value * 31 + seed.charCodeAt(index)) % 1000000000;
		}
		const area = 200 + (value % 700);
		const exchange = 200 + Math.floor(value / 1000) % 700;
		const line = 1000 + Math.floor(value / 1000000) % 9000;
		return `${area}-${exchange}-${line}`;
	}

	function fallbackName(seed: string) {
		const names = ['John Doe', 'Jane Miller', 'Alex Carter', 'Sam Taylor', 'Chris Morgan'];
		let value = 0;
		for (let index = 0; index < seed.length; index += 1) {
			value = (value * 33 + seed.charCodeAt(index)) % 2147483647;
		}
		return names[value % names.length];
	}

	function fallbackEmail(seed: string) {
		let value = 0;
		for (let index = 0; index < seed.length; index += 1) {
			value = (value * 37 + seed.charCodeAt(index)) % 100000;
		}
		return `contact${value}@example.com`;
	}

	function isEmail(value: string) {
		return /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}\b/.test(value);
	}

	function isPhone(value: string) {
		return /(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/.test(value);
	}

	function isLikelyPersonName(value: string) {
		const clean = value.trim().replace(/\s+/g, ' ');
		if (clean.length < 2 || clean.length > 60) return false;
		if (isEmail(clean) || isPhone(clean)) return false;
		// Allow periods for names like "Alex P."
		if (!/^[A-Za-z][A-Za-z'\-\.\s]*$/.test(clean)) return false;

		const words = clean.toLowerCase().split(' ');
		const blocked = new Set([
			'giving', 'call', 'calling', 'because', 'our', 'service', 'support',
			'help', 'hello', 'hi', 'hey', 'thanks', 'thank', 'team', 'customer',
			'not', 'even', 'a', 'an', 'the', 'just', 'writing', 'leaving', 'very', 'so', 'really',
			'inconsiderate', 'drivers', 'blocked', 'driveway', 'trucks', 'next', 'door'
		]);
		if (words.some((w) => blocked.has(w))) return false;

		return words.length >= 1;
	}

	function deriveCampaignSource(enrichment: any, event: any) {
		const explicit = (enrichment as any)?.campaign_source ?? (enrichment as any)?.campaign;
		if (typeof explicit === 'string' && explicit.trim().length > 0) return explicit.trim();

		if (event?.provider_id && event?.event_type) {
			return `${formatDetailLabel(event.provider_id || event.provider)} · ${formatDetailLabel(event.event_type)}`;
		}

		return null;
	}

	const strictDetail = $derived.by(() => {
		if (!selectedEvent) {
			return {
				ok: false,
				error: 'No event selected.'
			} as const;
		}

		const enrichment = selectedRecord?.enrichment ?? {};
		const isIntake = !selectedSignal;

		const missing: string[] = [];
		const eventType = requireString(selectedEvent.event_type, 'event.event_type', missing);
		const source = requireString((selectedEvent.provider_id || selectedEvent.provider), 'event.provider_id', missing);
		const networkCategory = requireString(selectedEvent.network_category, 'event.network_category', missing);

		// Signals fields - use fallbacks for Intake
		const hasCompletedExtraction = Boolean(
			enrichment && (
				typeof enrichment.summary === 'string' && enrichment.summary.trim().length > 0 ||
				typeof enrichment.service_requested === 'string' && enrichment.service_requested.trim().length > 0
			)
		);

		const signalName = selectedSignal 
			? requireString(selectedSignal.name, 'signal.name', missing)
			: hasCompletedExtraction ? 'Intake Ready' : 'Processing Intake...';
		const bucket = selectedSignal
			? requireString(selectedSignal.bucket, 'signal.bucket', missing)
			: 'Intake';

		const serviceRequested = nullableString(enrichment.ai_service_mentioned) ?? nullableString(enrichment.service_requested) ?? nullableString(selectedEvent.unstructured_text);
		const urgency = nullableString(enrichment.ai_urgency_level) ?? nullableString(enrichment.urgency_level) ?? (selectedSignal?.bucket === 'Risk' ? 'high' : null);
		const sentiment = nullableString(enrichment.ai_sentiment) ?? nullableString(enrichment.sentiment) ?? (selectedSignal?.bucket === 'Risk' ? 'negative' : null);
		const summary = requireString(enrichment.ai_summary ?? enrichment.summary ?? selectedEvent.unstructured_text, 'enrichment.summary|event.unstructured_text', missing);

		const resolvedAction = selectedRecommendedAction;
		if (!resolvedAction) {
			return {
				ok: false,
				error: 'Unable to resolve recommended action from event and signal data.'
			} as const;
		}
		const actionTitle = requireString(resolvedAction.title, 'recommendedAction.title', missing);
		const executionMode = requireString(resolvedAction.executionMode, 'recommendedAction.executionMode', missing);
		const actionOwner = nullableString(resolvedAction.owner);

		const customer = nullableString(
			deriveCustomerName(enrichment, selectedEvent),
		);
		const threadConversation = requireString(selectedEvent.event_id, 'event.event_id', missing);
		const campaignSource = nullableString(
			deriveCampaignSource(enrichment, selectedEvent),
		);

		const detectedSource = selectedSignal?.created_at ?? selectedEvent.occurred_at ?? selectedEvent.created_at;
		if (!detectedSource) {
			missing.push('signal.created_at|event.occurred_at|event.created_at');
		}

		if (missing.length > 0) {
			return {
				ok: false,
				error: `Missing required fields: ${missing.join(', ')}`
			} as const;
		}

		let detected = '';
		try {
			detected = formatRelativeStrict(String(detectedSource));
		} catch {
			return {
				ok: false,
				error: 'Invalid required timestamp: signal.created_at|event.occurred_at|event.created_at'
			} as const;
		}

		return {
			ok: true,
			data: {
				businessName: selectedQueueItem?.name ?? formatLabel((selectedEvent.provider_id || selectedEvent.provider)),
				eventType,
				source,
				networkCategory,
				signalName,
				bucket,
				detected,
				serviceRequested,
				urgency,
				sentiment,
				summary,
				customer,
				threadConversation,
				campaignSource,
				actionTitle,
				executionMode,
				actionOwner,
				isIntake
			}
		} as const;
	});
</script>

<svelte:head>
	<title>ClearSky Command Center</title>
</svelte:head>

<div class="app">
	<header class="topbar">
		<div class="brand">
			<svg viewBox="0 0 64 64" fill="none"><path d="M21.5 44H48a11 11 0 0 0 1.8-21.9A16 16 0 0 0 19 17.8 12.5 12.5 0 0 0 21.5 44Z" stroke="#1263ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
			<div><span>ClearSky</span> <span>Command Center</span></div>
		</div>

		<div class="select">All Businesses <span>▼</span></div>

		<div class="search">
			<span>⌕</span>
			<input bind:value={searchQuery} placeholder="Search signals..." />
		</div>

		<div class="top-status">
			<button class="chip red" onclick={() => setSidebarView('urgent')}>⚠ Urgent: {headlineCounts.urgent}</button>
			<button class="chip orange" onclick={() => setSidebarView('approval')}>◴ Approval: {headlineCounts.approval}</button>
			<button class="chip purple" onclick={() => setSidebarView('waiting')}>◷ Overdue: {headlineCounts.overdue}</button>
		</div>
	</header>

	<main class="content {detailOpen ? 'with-detail' : ''}">
		<aside class="sidebar">
			<div class="side-label">Work Queue</div>
			<div class="nav-list">
				{#each sidebarViews as view (view)}
					<button class="nav-item {sidebarView === view ? 'active' : ''}" onclick={() => setSidebarView(view)}>
						<span class="nav-icon {sidebarMeta[view].tone}">{sidebarMeta[view].icon}</span>
						<span class="nav-title">{sidebarMeta[view].label}</span>
						<span class="nav-count {view === 'urgent' ? 'red' : ''}">{sidebarCounts[view as keyof typeof sidebarCounts] ?? 0}</span>
					</button>
				{/each}
			</div>

			<div class="filter-head">
				<div class="side-label">Filters</div>
				<button class="clear" onclick={clearAll}>Clear all</button>
			</div>
			<div class="filter-list">
				<label class="filter-row">
					<span class="filter-icon">✦</span>
					<span class="filter-label">Sector</span>
					<select bind:value={filterSector}>
						<option value="">All</option>
						{#each filterOptions.sectors as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
				<label class="filter-row">
					<span class="filter-icon">▣</span>
					<span class="filter-label">Business</span>
					<select bind:value={filterBusiness}>
						<option value="">All</option>
						{#each filterOptions.businesses as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
				<label class="filter-row">
					<span class="filter-icon">⌁</span>
					<span class="filter-label">Source</span>
					<select bind:value={filterSource}>
						<option value="">All</option>
						{#each filterOptions.sources as option (option)}
							<option class="text-[9px]" value={option}>{option}</option>
						{/each}
					</select>
				</label>
				<label class="filter-row">
					<span class="filter-icon">✺</span>
					<span class="filter-label">Signal</span>
					<select bind:value={filterSignal}>
						<option value="">All</option>
						{#each filterOptions.signals as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
				<label class="filter-row">
					<span class="filter-icon">◉</span>
					<span class="filter-label">Status</span>
					<select bind:value={filterStatus}>
						<option value="">All</option>
						{#each filterOptions.statuses as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
				<label class="filter-row">
					<span class="filter-icon">◷</span>
					<span class="filter-label">SLA</span>
					<select bind:value={filterSla}>
						<option value="">All</option>
						{#each filterOptions.slas as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
			</div>
		</aside>

		<section class="main">
			<div class="queue-head">
				<h1>Prioritized Work Queue</h1>
				<div class="controls">
					<button class="control" onclick={() => detailOpen = !detailOpen}>{detailOpen ? 'Hide' : 'Show'} Details</button>
					<select class="control sort-select" bind:value={sortMode}>
						<option value="priority">Sort by Priority</option>
						<option value="time">Sort by Time</option>
					</select>
				</div>
			</div>

			<div class="queue">
				{#each visibleQueueRecords as item (`${item.id}:${item.event?.id ?? 'no-event'}`)}
					<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
					<article
						class="card {item.selected ? 'selected' : ''}"
						onclick={() => selectEvent(item.event.id)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectEvent(item.event.id)}
						role="button"
						tabindex="0"
					>
						<div class="priority {item.priorityClass}">{item.priorityClass.toUpperCase()}</div>
						<div class="business">
							<div class="logo {item.logoClass}">{item.name.charAt(0)}</div>
							<div>
								<div class="biz-name">{item.name}</div>
								<div class="sector">{item.sector}</div>
								<div class="meta">
									<span class="meta-source">{item.sourceIcon} {item.source}</span>
									<span>{item.signalIcon} {item.signalName}</span>
								</div>
							</div>
						</div>
						<div class="card-copy">
							<div class="desc-line">{item.shortDesc}</div>
							<div class="recommendation">{item.shortSuggestion}</div>
						</div>
						<div>
							<div class="status {item.badgeClass}">{item.badgeLabel}</div>
							<div class="timer {item.priorityClass === 'p1' ? 'red' : 'green'}">◷ {item.slaLabel}</div>
						</div>
						<button class="action-btn {item.hasApproval ? 'primary' : ''}" onclick={(e) => { e.stopPropagation(); item.hasApproval ? approveItem(item.event.id) : selectEvent(item.event.id) }}>
							{item.hasApproval ? 'Approve' : 'View'}
						</button>
						<div class="kebab">⋮</div>
					</article>
				{:else}
					<div class="empty-state card" style="padding: 60px 40px; text-align: center; border: 1px dashed rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.02); border-radius: 12px;">
						<div style="font-size: 32px; margin-bottom: 16px; opacity: 0.5;">📭</div>
						<div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #fff;">No items match your filters</div>
						<div class="muted" style="margin-bottom: 20px; font-size: 13px;">Try adjusting your search, filters, or view selection.</div>
						<button class="clear" onclick={clearAll} style="padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05); color: #1263ff; font-weight: 600; cursor: pointer; transition: all 0.2s;">Clear all filters</button>
					</div>
				{/each}
			</div>

			{#if canShowMore}
				<div style="padding: 20px; text-align: center;">
					<button class="control" onclick={() => visibleCount += 20}>Show more</button>
				</div>
			{/if}
		</section>

		<aside class="detail {detailOpen ? 'open' : ''}">
			{#if selectedEvent}
				{#if strictDetail.ok}
					<div class="detail-header-mock">
							<h2>{strictDetail.data.businessName} • {formatDetailLabel(strictDetail.data.signalName)}</h2>
						<button class="close" onclick={() => detailOpen = false}>×</button>
					</div>

					<section class="panel-section">
						<h3><span class="section-icon event">✢</span> Event</h3>
						<div class="triplet-grid">
								<div><div class="label">Event Type</div><div class="value red">{formatDetailLabel(strictDetail.data.eventType)}</div></div>
								<div><div class="label">Source</div><div class="value red">{formatDetailLabel(strictDetail.data.source)}</div></div>
								<div><div class="label">Network Category</div><div class="value">{formatDetailLabel(strictDetail.data.networkCategory)}</div></div>
						</div>
					</section>

					<section class="panel-section">
						<h3><span class="section-icon signal">⌁</span> Signal</h3>
						<div class="triplet-grid">
								<div><div class="label">Signal Name</div><div class="value">{formatDetailLabel(strictDetail.data.signalName)}</div></div>
								<div><div class="label">Bucket</div><div class="value">{formatDetailLabel(strictDetail.data.bucket)}</div></div>
							<div><div class="label">Detected</div><div class="value">{strictDetail.data.detected}</div></div>
						</div>
					</section>

					<section class="panel-section">
						<h3><span class="section-icon summary">✦</span> AI Summary</h3>
							<p><strong>Service Requested:</strong> {formatDetailValue(strictDetail.data.serviceRequested)}</p>
							<p><strong>Urgency:</strong> {formatDetailLabel(strictDetail.data.urgency)}</p>
							<p><strong>Sentiment:</strong> {formatDetailLabel(strictDetail.data.sentiment)}</p>
							<p><strong>Summary:</strong> {formatDetailValue(strictDetail.data.summary)}</p>
					</section>

					<section class="panel-section">
						<h3><span class="section-icon context">♟</span> Relationship Context</h3>
						<div class="triplet-grid">
								<div><div class="label">Customer</div><div class="value link">{formatDetailValue(strictDetail.data.customer)}</div></div>
								<div><div class="label">Thread / Conversation</div><div class="value link">{formatDetailValue(strictDetail.data.threadConversation)}</div></div>
								<div><div class="label">Campaign / Source</div><div class="value link">{formatDetailValue(strictDetail.data.campaignSource)}</div></div>
						</div>
					</section>

					<section class="panel-section">
						<h3><span class="section-icon action">⦿</span> Recommended Action</h3>
						<div class="triplet-grid">
								<div><div class="label">Action</div><div class="value link">{formatDetailLabel(strictDetail.data.actionTitle)}</div></div>
								<div><div class="label">Execution Mode</div><div class="value">{formatDetailLabel(strictDetail.data.executionMode)}</div></div>
								<div><div class="label">Owner</div><div class="value">{formatDetailValue(strictDetail.data.actionOwner)}</div></div>
						</div>
					</section>

					<section class="panel-section actions">
						<h3><span class="section-icon controls">⚡</span> Action Controls</h3>
						<div class="detail-actions wrap">
							<button class="detail-btn primary" onclick={() => approveItem(selectedEvent.id)} disabled={!selectedApproval}>✓ Approve</button>
							<button class="detail-btn" type="button">⌁ Edit</button>
							<button class="detail-btn" type="button">♟ Assign</button>
							<button class="detail-btn" type="button">◷ Snooze</button>
							<button class="detail-btn danger" onclick={() => discardItem(selectedEvent.id)} disabled={!selectedApproval}>✓ Mark Resolved</button>
						</div>
					</section>
				{:else}
					<div class="detail-error">
						<h3>Details Error</h3>
						<p>{strictDetail.error}</p>
					</div>
				{/if}
			{:else}
				<div class="empty-detail">Select an item to see details</div>
			{/if}
		</aside>
	</main>

	<footer class="bottombar">
		<div class="tabs">
			<div class="tab active">💬 Conversations</div>
			<div class="tab">☆ Reviews <span class="mini-count">{sidebarCounts.signals}</span></div>
			<div class="tab">♙ Leads <span class="mini-count">{sidebarCounts.urgent}</span></div>
			<div class="tab">☑ Tasks <span class="mini-count">{sidebarCounts.assigned}</span></div>
			<div class="tab">⚙ Automation Log <span class="mini-count">{sidebarCounts.automated}</span></div>
			<div class="tab">🛡 Blocked Events <span class="mini-count">{sidebarCounts.blocked}</span></div>
		</div>
		<div class="refresh">
			<button>⟳ Refresh</button>
			<span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
			<span>⌃</span>
		</div>
	</footer>
</div>

<style>
	:root {
		--bg: #f6f8fb;
		--panel: #ffffff;
		--line: #e5eaf2;
		--text: #0f172a;
		--muted: #64748b;
		--blue: #1263ff;
		--blue-soft: #eaf1ff;
		--teal: #0ea5a8;
		--red: #ef4444;
		--red-soft: #fff0f0;
		--orange: #f59e0b;
		--orange-soft: #fff7e6;
		--green: #16a34a;
		--green-soft: #eaf8ef;
		--purple: #7c3aed;
		--purple-soft: #f1ebff;
		--shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
		--radius: 16px;
	}

	:global(body) {
		margin: 0;
		font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		background: var(--bg);
		color: var(--text);
	}

	.app {
		height: 100vh;
		display: grid;
		grid-template-rows: 72px 1fr 76px;
		min-width: 1024px;
	}

	.topbar {
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--line);
		display: grid;
		grid-template-columns: 310px 180px 1fr auto;
		align-items: center;
		padding: 0 20px;
		gap: 20px;
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.brand { font-weight: 800; display: flex; align-items: center; gap: 10px; font-size: 20px; letter-spacing: -0.02em; }
	.brand svg { width: 38px; }
	.brand span:first-child { color: var(--blue); }

	.select {
		height: 38px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 12px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: #fff;
		font-size: 13px;
		font-weight: 700;
		color: var(--text);
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0,0,0,0.02);
		white-space: nowrap;
	}
	.select:hover {
		border-color: #d1d5db;
		background: #f8fafc;
	}
	.select span {
		font-size: 10px;
		color: #94a3b8;
		display: inline-block;
		margin-left: 2px;
	}

	.search { 
		display: flex; 
		align-items: center; 
		gap: 10px; 
		background: var(--panel); 
		border: 1px solid var(--line); 
		border-radius: 10px; 
		padding: 0 14px; 
		height: 38px;
		max-width: 420px;
	}
	.search input { border: none; outline: none; width: 100%; font-size: 13px; background: transparent; }

	.top-status { display: flex; gap: 10px; align-items: center; }
	.chip { height: 34px; padding: 0 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 6px; }
	.chip.red { background: var(--red-soft); color: var(--red); border-color: #ffd4d4; }
	.chip.orange { background: var(--orange-soft); color: #cc7300; border-color: #ffe0a3; }
	.chip.purple { background: #f3efff; color: #7c3aed; border-color: #ded1ff; }

	.content { 
		display: grid; 
		grid-template-columns: 250px 1fr var(--detail-width, 0px); 
		overflow: hidden; 
		height: 100%; 
		transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.content.with-detail {
		--detail-width: 330px;
	}

	.sidebar { background: rgba(255, 255, 255, 0.88); border-right: 1px solid var(--line); padding: 22px 18px; overflow-y: auto; overflow-x: hidden; position: relative; height: 100%; }
	.side-label { font-size: 11px; font-weight: 800; color: #8b97a7; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.06em; }

	.nav-list { display: grid; gap: 6px; }
	.nav-item {
		display: grid; grid-template-columns: 22px 1fr auto; align-items: center;
		width: 100%; padding: 8px 10px; border-radius: 11px;
		font-size: 13px; font-weight: 650; color: #1f2937; gap: 8px; border: none; background: transparent;
	}
	.nav-item:hover { background: #f3f6fb; }
	.nav-item.active { background: linear-gradient(90deg, #edf4ff, #f8fbff); color: #0b1220; }
	.nav-icon { font-size: 14px; }
	.nav-icon.red { color: #ef4444; }
	.nav-icon.orange { color: #f59e0b; }
	.nav-icon.blue { color: #3b82f6; }
	.nav-icon.purple { color: #8b5cf6; }
	.nav-icon.green { color: #22c55e; }
	.nav-icon.ink { color: #111827; }
	.nav-icon.red-outline { color: #ef4444; }
	.nav-title { display: inline-flex; align-items: center; gap: 8px; }
	.nav-count {
		min-width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center;
		font-size: 11px; font-weight: 800; color: #667085; background: #f1f5f9; border: 1px solid #e2e8f0;
	}
	.nav-count.red { background: #fff0f0; color: #ef4444; border-color: #fecaca; }

	.filter-list { display: grid; gap: 10px; margin-top: 12px; }
	.filter-head { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; }
	.filter-row {
		display: grid; grid-template-columns: 18px max-content 1fr; align-items: center;
		gap: 10px; padding: 10px 12px; border-radius: 14px; border: 1px solid #e5eaf2; background: #fff;
		font-size: 13px; font-weight: 700; color: #1f2937; min-width: 0;
	}
	.nav-item, .filter-row { box-sizing: border-box; max-width: 100%; }
	.nav-title, .filter-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.filter-row select {
		border: none; background: transparent; font-size: 11px; font-weight: 700; color: #94a3b8;
		padding: 0; width: 100%; text-align: left;
	}
	.filter-row select:focus { outline: none; }
	.filter-row select option { font-size: 22px; }
	.filter-icon { color: #2563eb; font-size: 14px; }
	.filter-label { color: #111827; }

	.main {
		min-width: 0;
		padding: 12px 16px 20px;
		overflow: auto;
		height: 100%;
	}

	.queue-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 4px 0 12px;
	}

	.queue-head h1 {
		font-size: 18px;
		margin: 0;
		letter-spacing: -0.02em;
		font-weight: 800;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.control {
		height: 34px;
		padding: 0 10px;
		border: 1px solid var(--line);
		background: var(--panel);
		border-radius: 9px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}

	.sort-select { padding: 0 10px; border-radius: 9px; border: 1px solid var(--line); background: var(--panel); font-size: 12px; font-weight: 650; cursor: pointer; height: 34px; }

	.queue {
		display: grid;
		gap: 10px;
		min-width: 500px;
	}

	.card {
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		min-height: 96px;
		display: grid;
		grid-template-columns: 44px minmax(160px, 220px) minmax(0, 1fr) 112px 104px 20px;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		box-shadow: 0 8px 22px rgba(15, 23, 42, 0.035);
		transition: all 0.2s;
		cursor: pointer;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.card:hover { box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06); transform: translateY(-1px); }
	.card.selected {
		border-color: var(--blue);
		box-shadow: 0 0 0 2px rgba(18, 99, 255, 0.10), var(--shadow);
	}

	.priority {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		display: grid;
		place-items: center;
		font-weight: 900;
		font-size: 15px;
	}

	.p1 { background: var(--red-soft); color: var(--red); border: 1px solid #ffd3d3; }
	.p2 { background: var(--orange-soft); color: #ea7a00; border: 1px solid #ffe0a3; }
	.p3 { background: var(--green-soft); color: var(--green); border: 1px solid #bce8c8; }

	.business {
		display: grid;
		grid-template-columns: 38px 1fr;
		gap: 10px;
		align-items: center;
		min-width: 0;
	}

	.logo {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: grid;
		place-items: center;
		color: #fff;
		font-weight: 900;
		font-size: 13px;
		overflow: hidden;
		background: linear-gradient(135deg, #1263ff, #3b82f6);
		flex-shrink: 0;
	}
	.logo.apex { background: linear-gradient(135deg, #0f3357, #18a8bd); }
	.logo.lodge { background: linear-gradient(135deg, #21466b, #89c0d8); }
	.logo.sa { background: #0b2e69; }
	.logo.nc { background: #41aa93; }
	.logo.dental { background: #92d3c6; color: #0f766e; }
	.logo.market { background: #8b5cf6; }

	.biz-name {
		font-weight: 800;
		font-size: 14px;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sector {
		color: var(--muted);
		font-size: 10px;
		margin-top: 1px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 11px;
		color: #334155;
		margin-top: 6px;
		white-space: nowrap;
		overflow: hidden;
		line-height: 1.2;
		flex-wrap: wrap;
	}
	.meta .meta-source { color: var(--blue); font-weight: 700; }
	.meta span:last-child { color: #334155; }

	.card-copy {
		font-size: 12.5px;
		line-height: 1.28;
		color: var(--text);
		min-width: 0;
	}
	.desc-line {
		max-height: 2.6em;
		overflow: hidden;
		word-break: break-word;
	}

	.recommendation {
		color: var(--blue);
		font-weight: 700;
		margin-top: 4px;
		font-size: 13px;
		max-height: 2.6em;
		overflow: hidden;
		word-break: break-word;
	}

	.status {
		justify-self: start;
		font-size: 10px;
		font-weight: 800;
		padding: 5px 8px;
		border-radius: 7px;
		white-space: nowrap;
	}

	.status.approval { background: var(--orange-soft); color: #c76a00; border: 1px solid #ffe0a3; }
	.status.assigned { background: var(--green-soft); color: var(--green); border: 1px solid #bce8c8; }
	.status.new { background: #eaf1ff; color: var(--blue); border: 1px solid #d5e3ff; }

	.timer {
		margin-top: 6px;
		font-size: 10px;
		font-weight: 800;
		color: var(--orange);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.timer.red { color: var(--red); }
	.timer.green { color: var(--green); }

	.action-btn {
		height: 32px;
		border-radius: 8px;
		border: 1px solid #b7ccff;
		background: #fff;
		color: var(--blue);
		font-weight: 800;
		font-size: 11px;
		cursor: pointer;
		padding: 0 10px;
		white-space: nowrap;
	}

	.action-btn.primary {
		background: var(--blue);
		color: #fff;
		border: none;
		box-shadow: 0 8px 18px rgba(18, 99, 255, 0.22);
	}

	.kebab {
		color: #94a3b8;
		font-size: 18px;
		text-align: center;
	}

	.detail { 
		background: #fff; 
		border-left: 1px solid var(--line); 
		padding: 24px;
		overflow-y: auto;
		height: 100%;
		min-width: 0;
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s 0.3s, opacity 0.3s linear;
	}
	.detail.open { 
		visibility: visible;
		opacity: 1;
		transition: opacity 0.3s linear;
	}
	.detail-header-mock { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	.detail-header-mock h2 { margin: 0; font-size: 14px; line-height: 1.2; font-weight: 800; color: #0b1a39; }
	.close { border: none; background: transparent; font-size: 24px; color: #0b1a39; line-height: 1; cursor: pointer; }
	.panel-section { padding: 14px 0; border-top: 1px solid #dbe3ee; }
	.panel-section h3 { margin: 0 0 10px; font-size: 15px; font-weight: 800; color: #0b1a39; letter-spacing: 0.01em; }
	.section-icon { display: inline-flex; width: 18px; justify-content: center; margin-right: 6px; }
	.section-icon.event { color: #2563eb; }
	.section-icon.signal { color: #2563eb; }
	.section-icon.summary { color: #3b82f6; }
	.section-icon.context { color: #2563eb; }
	.section-icon.action { color: #ef4444; }
	.section-icon.controls { color: #f59e0b; }
	.triplet-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }
	.triplet-grid > div { min-width: 0; }
	.label { color: #64748b; font-size: 12px; line-height: 1.2; font-weight: 700; }
	.value { margin-top: 4px; color: #0b1a39; font-size: 13px; line-height: 1.3; font-weight: 700; white-space: normal; overflow-wrap: anywhere; word-break: break-word; }
	.value.red { color: #f22121; }
	.value.link { color: #2563eb; }
	.panel-section p { margin: 0 0 6px; color: #0b1a39; font-size: 13px; line-height: 1.4; }
	.panel-section p strong { font-weight: 800; }
	.detail-actions { display: flex; gap: 10px; margin-top: 15px; }
	.detail-actions.wrap { flex-wrap: wrap; }
	.detail-btn { padding: 10px; border-radius: 8px; border: 1px solid var(--line); background: #fff; font-weight: 700; font-size: 13px; cursor: pointer; }
	.detail-btn.primary { background: var(--blue); color: #fff; border: none; }
	.detail-btn.danger { color: var(--red); border-color: var(--red); }
	.detail-error { border: 1px solid #fca5a5; background: #fff1f2; color: #991b1b; border-radius: 12px; padding: 16px; margin-top: 10px; }
	.detail-error h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; }
	.detail-error p { margin: 0; font-size: 13px; line-height: 1.4; }

	@media (max-width: 1180px) {
		.detail { width: min(92vw, 520px); }
		.triplet-grid { grid-template-columns: 1fr; }
	}

	.clear { color: var(--blue); font-weight: 700; font-size: 12px; cursor: pointer; border: none; background: none; }
	.muted { color: var(--muted); font-size: 13px; }
	.bottombar {
		background: rgba(255, 255, 255, 0.94);
		border-top: 1px solid var(--line);
		padding: 10px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
	}

	.tabs {
		display: flex;
		align-items: center;
		gap: 28px;
		height: 100%;
	}

	.tab {
		height: 56px;
		display: flex;
		align-items: center;
		gap: 9px;
		color: #64748b;
		font-size: 13px;
		font-weight: 750;
		position: relative;
		cursor: pointer;
	}

	.tab.active {
		color: var(--blue);
	}

	.tab.active::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: -10px;
		height: 3px;
		border-radius: 999px;
		background: var(--blue);
	}

	.mini-count {
		min-width: 22px;
		height: 22px;
		border-radius: 999px;
		background: #f1f5f9;
		color: #475569;
		display: grid;
		place-items: center;
		font-size: 11px;
		font-weight: 900;
	}

	.refresh {
		display: flex;
		align-items: center;
		gap: 14px;
		color: #64748b;
		font-size: 12px;
		white-space: nowrap;
	}

	.refresh button {
		height: 34px;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: #fff;
		color: #475569;
		font-weight: 700;
		padding: 0 12px;
		cursor: pointer;
	}
</style>
