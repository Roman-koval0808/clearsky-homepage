import { browser } from '$app/environment';

/**
 * STRICT ACTION LIBRARY (Technical Spec Doc Adherence)
 */
export const ACTION_LIBRARY = {
    'ACT-REV-001': {
        title: 'Draft Review Response',
        description: 'Create a context-aware response draft for customer reviews.',
        base_priority: 2,
        default_mode: 'approval_required'
    },
    'ACT-COM-002': {
        title: 'Send urgent follow-up',
        description: 'Send immediate follow-up to the customer and alert the business owner.',
        base_priority: 1,
        default_mode: 'automatic'
    },
    'ACT-CRM-003': {
        title: 'Update CRM Record',
        description: 'Sync extracted customer intent or sentiment to CRM.',
        base_priority: 3,
        default_mode: 'automatic'
    },
    'ACT-SYS-004': {
        title: 'Trigger System Health Check',
        description: 'Initiate automated diagnostics based on reported anomalies.',
        base_priority: 2,
        default_mode: 'automatic'
    }
} as const;

export type ActionId = keyof typeof ACTION_LIBRARY;

export const NETWORK_CATEGORIES = {
    'Communication': ['telnyx_voice', 'telnyx_sms', 'email_provider'],
    'Trust': ['google_business_profile', 'social_media'],
    'Visibility': ['dataforseo', 'matomo_analytics', 'competitor_intelligence'],
    'Conversion': ['clearsky_website_forms', 'booking_systems', 'quote_systems'],
    'Engagement': ['clearsky_viewroom', 'fotojobber'],
    'Growth': ['crms'],
    'Systems': ['system_health', 'contentradar']
} as const;

export type DashboardData = {
    providers: any[];
    events: any[];
    signals: any[];
    enrichments: Record<string, any>;
    actionQueue: any[];
    approvals: any[];
    outcomes: any[];
    feedback: any[];
    metrics: Record<string, number>;
};

const DEFAULT_DATA: DashboardData = {
    providers: [
        { id: 'telnyx_voice', name: 'Telnyx Voice', icon: 'telnyx' },
        { id: 'telnyx_sms', name: 'Telnyx SMS', icon: 'telnyx' },
        { id: 'google_business_profile', name: 'Google Business Profile', icon: 'google' },
        { id: 'clearsky_website_forms', name: 'Website Forms', icon: 'social' },
        { id: 'email_provider', name: 'Email', icon: 'email' },
        { id: 'dataforseo', name: 'DataForSEO', icon: 'dataforseo' },
        { id: 'matomo_analytics', name: 'Matomo Analytics', icon: 'social' },
        { id: 'clearsky_viewroom', name: 'ClearSky ViewRoom', icon: 'social' },
        { id: 'fotojobber', name: 'Fotojobber', icon: 'social' },
        { id: 'quote_systems', name: 'Quote Systems', icon: 'crm' },
        { id: 'booking_systems', name: 'Booking Systems', icon: 'crm' },
        { id: 'crms', name: 'Internal CRM', icon: 'crm' },
        { id: 'social_media', name: 'Social Media', icon: 'social' },
        { id: 'competitor_intelligence', name: 'Competitor Intelligence', icon: 'social' },
        { id: 'contentradar', name: 'ContentRadar', icon: 'social' },
        { id: 'system_health', name: 'System Health', icon: 'social' }
    ],
    events: [],
    signals: [],
    enrichments: {},
    actionQueue: [],
    approvals: [],
    outcomes: [],
    feedback: [],
    metrics: {
        revenue_growth: 18,
        booked_work: 22,
        reputation_score: 4.8,
        suppressed_count: 0,
        human_intervention_rate: 0,
        ai_accuracy: 94
    }
};

class DashboardState {
    #data = $state<DashboardData>(DEFAULT_DATA);
    #selectedEventId = $state<string | null>(null);
    #activeBucket = $state<string | null>(null);
    #loading = $state(false);

    constructor() {
        if (browser) {
            this.sync();
            // Poll for updates every 5 seconds for the prototype
            setInterval(() => this.sync(), 5000);
        }
    }

    async sync() {
        if (this.#loading) return;
        try {
            const res = await fetch('/api/ai-signals/dashboard');
            const json = await res.json();
            if (json.success) {
                this.#data = {
                    ...this.#data,
                    ...json.data,
                    providers: DEFAULT_DATA.providers
                };
                if (!this.#selectedEventId && this.#data.events.length > 0) {
                    this.#selectedEventId = this.#data.events[0].id;
                }
            }
        } catch (e) {
            console.error('[Dashboard Sync Failed]', e);
        }
    }

    get data() { return this.#data; }
    get selectedEventId() { return this.#selectedEventId; }
    get activeBucket() { return this.#activeBucket; }
    set activeBucket(bucket: string | null) { this.#activeBucket = bucket; }

    get currentEnrichment() {
        if (!this.#selectedEventId) return null;
        return this.#data.enrichments[this.#selectedEventId] || null;
    }

    selectEvent(id: string) { 
        this.#selectedEventId = id; 
    }

    toggleBucket(bucket: string) {
        this.#activeBucket = this.#activeBucket === bucket ? null : bucket;
    }

    addSimulationResult(rawEvent: any, extraction: any) {
        void rawEvent;
        void extraction;
        this.sync();
    }

    async approveApproval(id: string, edited: boolean = false) {
        try {
            const res = await fetch('/api/ai-signals/actions/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, edited })
            });
            if ((await res.json()).success) {
                this.sync();
            }
        } catch (e) { console.error(e); }
    }

    async discardApproval(id: string) {
        try {
            const res = await fetch('/api/ai-signals/actions/discard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if ((await res.json()).success) {
                this.sync();
            }
        } catch (e) { console.error(e); }
    }

    clear() {
        // Resetting on Postgres is usually more destructive, 
        // for now just reset the local state and the server will overwrite on next sync.
        this.#data = { ...DEFAULT_DATA };
    }
}

export const dashboardState = new DashboardState();
