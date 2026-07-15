// ─── Reactive Stores ────────────────────────────────────────────────────────

export const pixelStore = $state({
    score: 0,
    bucket: 'unclassified',
    scrollDepth: 0,
    dwell30: false,
    dwell60: false,
    dwell120: false,
    promoFired: false,
    eventLog: [] as Array<{
        event: string;
        label: string;
        delta: number;
        bucket: string;
        scoreAfter: number;
        ts: number;
    }>,
    contentRadarLog: [] as Array<{
        payload: Record<string, any>;
        status: 'pending' | 'success' | 'failed' | 'error';
        statusCode?: number;
        error?: string | null;
        ts: number;
    }>
});

/** Reactive identity state — updates whenever a form captures new identity info */
export const identityStore = $state<{
    email: string | null;
    phone: string | null;
    name: string | null;
    lastUpdated: number | null;
}>({
    email: null,
    phone: null,
    name: null,
    lastUpdated: null,
});

// ─── Session ID ──────────────────────────────────────────────────────────────

const SESSION_ID_KEY = 'clearsky_session';
const STATE_KEY = 'clearsky_pixel_state';
const IDENTITY_KEY = 'clearsky_identity';
const SESSION_MAX_AGE = 180 * 24 * 60 * 60; // 180 days in seconds

const bucketPriority = ['emergency', 'active', 'comparison', 'research', 'unclassified'];

function readCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
    if (typeof document === 'undefined') return;
    const secure = location.protocol === 'https:' ? ' Secure;' : '';
    const cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSec}; path=/; SameSite=Lax;${secure}`;
    document.cookie = cookie;
}

// ─── Fingerprint ID ──────────────────────────────────────────────────────────

const FP_KEY = 'clearsky_fp';
let _fingerprintId: string | null = null;
let _cachedFpId: string | null = null;

export async function getFingerprintId(): Promise<string> {
    if (_fingerprintId) return _fingerprintId;

    if (typeof window === 'undefined') return 'server';

    const stored = window.localStorage.getItem(FP_KEY);
    if (stored) {
        _fingerprintId = stored;
        return _fingerprintId;
    }

    try {
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        _fingerprintId = `fp_${result.visitorId.slice(0, 8)}`;
        window.localStorage.setItem(FP_KEY, _fingerprintId);
        return _fingerprintId;
    } catch (e) {
        console.warn('Failed to load FingerprintJS', e);
        _fingerprintId = `fp_${Math.random().toString(36).slice(2, 10)}`;
        window.localStorage.setItem(FP_KEY, _fingerprintId);
        return _fingerprintId;
    }
}

export function setCachedFingerprintId(id: string) {
    _cachedFpId = id;
}

export function getSessionId() {
    if (typeof window === 'undefined') return 'server';

    try {
        const cookie = readCookie(SESSION_ID_KEY);
        if (cookie) {
            const [id, tsStr] = cookie.split('|');
            const ts = Number(tsStr) || 0;
            const age = Math.floor((Date.now() - ts) / 1000);
            if (id && age < SESSION_MAX_AGE) {
                return id;
            }
        }

        const newId = window.crypto?.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        writeCookie(SESSION_ID_KEY, `${newId}|${Date.now()}`, SESSION_MAX_AGE);
        return newId;
    } catch (e) {
        return window.localStorage.getItem(SESSION_ID_KEY) ?? (window.crypto?.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    }
}

// ─── Persistence ─────────────────────────────────────────────────────────────

let isInitialized = false;

export function initPixelStore() {
    if (typeof window === 'undefined' || isInitialized) return;
    try {
        const saved = window.localStorage.getItem(STATE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            // 30-minute inactivity check
            const SESSION_TIMEOUT = 30 * 60 * 1000;
            const now = Date.now();
            const lastActivity = data.lastActivity || now;
            const isNewSession = (now - lastActivity) > SESSION_TIMEOUT;

            if (isNewSession) {
                // Reset session state
                pixelStore.score = 0;
                pixelStore.bucket = 'unclassified';
                pixelStore.promoFired = false;
                pixelStore.eventLog = [];
            } else {
                pixelStore.score = data.score || 0;
                pixelStore.bucket = data.bucket || 'unclassified';
                pixelStore.promoFired = !!data.promoFired;
                if (data.eventLog && Array.isArray(data.eventLog)) {
                    pixelStore.eventLog = data.eventLog;
                }
            }
        }
        // Restore persisted identity
        const savedIdentity = window.localStorage.getItem(IDENTITY_KEY);
        if (savedIdentity) {
            const id = JSON.parse(savedIdentity);
            identityStore.email = id.email || null;
            identityStore.phone = id.phone || null;
            identityStore.name = id.name || null;
            identityStore.lastUpdated = id.lastUpdated || null;
        }
    } catch (err) {
        console.warn('Failed to load pixelStore from localstorage', err);
    }
    isInitialized = true;
    setupGlobalTracking();
}

function setupGlobalTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('focusout', (e) => {
        const el = e.target as HTMLInputElement | HTMLTextAreaElement;
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        
        const raw = el.value?.trim();
        if (!raw) return;

        const type = el.type?.toLowerCase() || '';
        const nameAttr = ((el.name || el.id) ?? '').toLowerCase();
        const ph = (el.placeholder ?? '').toLowerCase();
        const explicit = el.dataset?.identity?.toLowerCase();

        const identity: { email?: string; phone?: string; name?: string } = {};

        if (explicit === 'name' || /\bname\b/.test(nameAttr) || (ph.includes('name') && !ph.includes('last') && !ph.includes('company'))) {
            identity.name = raw;
        }
        else if (explicit === 'email' || type === 'email' || /\bemail\b/.test(nameAttr) || ph.includes('email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
            identity.email = raw;
        }
        else if (explicit === 'phone' || type === 'tel' || /\bphone\b|tel/.test(nameAttr) || ph.includes('phone') || ph.includes('tel') || /^[\d\s()+-]{7,20}$/.test(raw)) {
            if (raw.replace(/[^\d]/g, '').length >= 7) {
                identity.phone = raw;
            }
        }

        const changed = 
            (identity.email && identity.email !== identityStore.email) ||
            (identity.phone && identity.phone !== identityStore.phone) ||
            (identity.name && identity.name !== identityStore.name);

        if (changed) {
            captureIdentity('auto_field_capture', `Captured new contact info automatically`, 10, 'active', identity);
        }
    });
}

if (typeof window !== 'undefined') {
    initPixelStore();
}

function savePixelStore() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STATE_KEY, JSON.stringify({
            score: pixelStore.score,
            bucket: pixelStore.bucket,
            promoFired: pixelStore.promoFired,
            eventLog: pixelStore.eventLog,
            lastActivity: Date.now()
        }));
    } catch (e) {}
}

function saveIdentity() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(IDENTITY_KEY, JSON.stringify({
            email: identityStore.email,
            phone: identityStore.phone,
            name: identityStore.name,
            lastUpdated: identityStore.lastUpdated,
        }));
    } catch (e) {}
}

export function setPromoFired() {
    pixelStore.promoFired = true;
    savePixelStore();
}

// ─── Unified Identity Capture ─────────────────────────────────────────────────
/**
 * The single utility all forms must use when a user submits contact info.
 * - Fires the pixel event to the backend (triggers identity merge in pipeline)
 * - Updates identityStore reactively (Demo Panel updates instantly)
 * - Persists identity across page navigations
 *
 * @param event  The pixel event name (e.g. 'form_submit', 'promo_claim_submit')
 * @param label  Human-readable label for the event log
 * @param delta  Engagement score delta
 * @param bucket Intent bucket
 * @param identity  Object with at least one of: { email, phone, name }
 */
export function captureIdentity(
    event: string,
    label: string,
    delta: number,
    bucket: string,
    identity: { email?: string; phone?: string; name?: string }
) {
    // Merge any new info into the reactive identity store
    const changed =
        (identity.email && identity.email !== identityStore.email) ||
        (identity.phone && identity.phone !== identityStore.phone) ||
        (identity.name && identity.name !== identityStore.name);

    if (identity.email) identityStore.email = identity.email;
    if (identity.phone) identityStore.phone = identity.phone;
    if (identity.name) identityStore.name = identity.name;
    if (changed) {
        identityStore.lastUpdated = Date.now();
        saveIdentity();
    }

    // Fire the pixel event with identity data (backend will merge/upsert profile)
    firePixel(event, label, delta, bucket, {
        email: identityStore.email ?? undefined,
        phone: identityStore.phone ?? undefined,
        name: identityStore.name ?? undefined,
    });
}

// ─── Auto Form Identity Extractor ────────────────────────────────────────────
/**
 * Scans any DOM container (form, div, section) and automatically extracts
 * name / email / phone from its inputs — no manual field wiring needed.
 *
 * Field detection heuristics (checked in order):
 *   1. data-identity="name|email|phone" attribute on the input
 *   2. input.type  (email → email, tel → phone)
 *   3. input.name or input.id keyword matching
 *   4. input.placeholder keyword matching
 *
 * Usage:
 *   extractFormIdentity(containerEl, 'apt_submit', 'Appointment booked', 20, 'active')
 *
 * Or with the Svelte action pattern:
 *   <form use:autoTrack={{ event: 'apt_submit', label: 'Appointment booked', delta: 20, bucket: 'active' }}>
 */
export function extractFormIdentity(
    container: HTMLElement | null,
    event: string,
    label: string,
    delta: number,
    bucket: string
) {
    if (!container) return;

    const identity: { name?: string; email?: string; phone?: string } = {};

    const inputs = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input, textarea, select'
    );

    for (const el of inputs) {
        const raw = (el as HTMLInputElement | HTMLTextAreaElement).value?.trim();
        if (!raw) continue;

        // Priority 1: explicit data-identity attribute
        const explicit = (el as HTMLElement).dataset.identity?.toLowerCase();
        if (explicit === 'name')  { identity.name  = identity.name  || raw; continue; }
        if (explicit === 'email') { identity.email = identity.email || raw; continue; }
        if (explicit === 'phone') { identity.phone = identity.phone || raw; continue; }

        // Priority 2: input type
        const type = (el as HTMLInputElement).type?.toLowerCase();
        if (type === 'email') { identity.email = identity.email || raw; continue; }
        if (type === 'tel')   { identity.phone = identity.phone || raw; continue; }

        // Priority 3: name / id attribute keywords
        const nameAttr = ((el.name || el.id) ?? '').toLowerCase();
        if (/\bname\b/.test(nameAttr))  { identity.name  = identity.name  || raw; continue; }
        if (/\bemail\b/.test(nameAttr)) { identity.email = identity.email || raw; continue; }
        if (/\bphone\b|tel/.test(nameAttr)) { identity.phone = identity.phone || raw; continue; }

        // Priority 4: placeholder keyword matching
        const ph = (el.placeholder ?? '').toLowerCase();
        if (ph.includes('name') && !ph.includes('last') && !ph.includes('company')) {
            identity.name = identity.name || raw; continue;
        }
        if (ph.includes('email')) { identity.email = identity.email || raw; continue; }
        if (ph.includes('phone') || ph.includes('tel') || ph.includes('(705)')) {
            identity.phone = identity.phone || raw; continue;
        }
    }

    if (Object.keys(identity).length > 0) {
        captureIdentity(event, label, delta, bucket, identity);
    }
}

/**
 * Svelte 5 action — attach to any <form> or container element.
 * Listens for the element's submit event OR a custom 'clearsky:submit' event.
 *
 * Usage in template:
 *   <form use:autoTrack={{ event: 'apt_submit', label: 'Appointment booked', delta: 20, bucket: 'active' }}>
 */
export function autoTrack(
    node: HTMLElement,
    opts: { event: string; label: string; delta: number; bucket: string }
) {
    function capture() { extractFormIdentity(node, opts.event, opts.label, opts.delta, opts.bucket); }
    node.addEventListener('submit', capture);
    node.addEventListener('clearsky:submit', capture);
    return {
        update(newOpts: typeof opts) { opts = newOpts; },
        destroy() {
            node.removeEventListener('submit', capture);
            node.removeEventListener('clearsky:submit', capture);
        }
    };
}

// ─── Session Reset ─────────────────────────────────────────────────────────────
/**
 * Full session reset:
 *   1. Tells the server to unlink all events for this session from any profile
 *   2. Clears localStorage (pixel state + persisted identity)
 *   3. Clears the session cookie so a fresh ID is generated on next load
 *   4. Reloads the page
 */
export async function resetSession() {
    if (typeof window === 'undefined') return;

    const sessionId = getSessionId();

    try {
        await fetch('/api/reset-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
    } catch {}

    // Clear cookie
    const secure = location.protocol === 'https:' ? ' Secure;' : '';
    document.cookie = `${SESSION_ID_KEY}=; Max-Age=0; path=/; SameSite=Lax;${secure}`;
    // Clear all local state
    window.localStorage.clear();
    window.location.reload();
}


// ─── ContentRadar ─────────────────────────────────────────────────────────────

export async function submitToContentRadar(text: string, formId: string) {
    if (!text.trim()) return;

    try {
        const payload = {
            question_text: text.trim(),
            source_page: typeof window === 'undefined' ? 'server' : window.location.pathname,
            source_form: formId,
            timestamp: new Date().toISOString(),
            session_id: getSessionId()
        };

        try { pixelStore.contentRadarLog.unshift({ payload, status: 'pending', ts: Date.now(), error: null }); } catch(e) {}

        const res = await fetch('/hub/contentradar/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            try {
                const entry = pixelStore.contentRadarLog[0];
                if (entry && entry.payload === payload) { entry.status = 'success'; entry.statusCode = res.status; }
            } catch (e) {}
        } else {
            try {
                const entry = pixelStore.contentRadarLog[0];
                if (entry && entry.payload === payload) { entry.status = 'failed'; entry.statusCode = res.status; }
            } catch (e) {}
        }
    } catch (err) {
        console.warn('[ContentRadar] submit failed', err);
        try {
            const entry = pixelStore.contentRadarLog[0];
            if (entry) { entry.status = 'error'; entry.error = String(err); }
        } catch (e) {}
    }
}

// ─── Core Pixel Fire ──────────────────────────────────────────────────────────

export function firePixel(event: string, label: string, delta: number, bucket?: string, extra?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    pixelStore.score = Math.min(pixelStore.score + delta, 100);
    
    if (bucket && bucket !== 'unclassified') {
        const cur = bucketPriority.indexOf(pixelStore.bucket);
        const nxt = bucketPriority.indexOf(bucket);
        if (cur === -1 || nxt < cur || pixelStore.bucket === 'unclassified') {
            pixelStore.bucket = bucket;
        }
    }

    const payload = { 
        event, 
        score: pixelStore.score, 
        bucket: pixelStore.bucket, 
        delta, 
        label,
        session_id: getSessionId(),
        fingerprint_id: _cachedFpId,
        pageUrl: window.location.pathname,
        ...(extra || {})
    };

    try {
        pixelStore.eventLog.unshift({
            event,
            label,
            delta,
            bucket: pixelStore.bucket,
            scoreAfter: pixelStore.score,
            ts: Date.now()
        });
        savePixelStore();
    } catch (e) {}

    fetch('/hub/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch((err) => console.warn('[ClearSky Pixel] dispatch failed', err));
}
