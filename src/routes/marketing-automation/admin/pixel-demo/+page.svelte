<script lang="ts">
    // Mock Data: 35+ Pixel Events
    const PIXEL_EVENTS = [
        // Research (1-20 range)
        { name: 'page_view_home', label: 'Viewed homepage', delta: 2, bucket: 'Research', path: false, negative: false },
        { name: 'page_view_about', label: 'Viewed about us', delta: 2, bucket: 'Research', path: false, negative: false },
        { name: 'page_view_blog', label: 'Read a blog post', delta: 3, bucket: 'Research', path: false, negative: false },
        { name: 'page_view_locations', label: 'Checked service areas', delta: 4, bucket: 'Research', path: false, negative: false },
        { name: 'scroll_depth_50', label: 'Scrolled 50% of page', delta: 1, bucket: 'Research', path: false, negative: false },
        { name: 'scroll_depth_90', label: 'Read entire page', delta: 2, bucket: 'Research', path: false, negative: false },
        { name: 'video_play_intro', label: 'Played intro video', delta: 4, bucket: 'Research', path: false, negative: false },
        { name: 'click_social_link', label: 'Clicked to social media', delta: 1, bucket: 'Research', path: false, negative: false },

        // Comparison (25-44 range)
        { name: 'page_view_pricing', label: 'Viewed pricing page', delta: 8, bucket: 'Comparison', path: true, negative: false },
        { name: 'page_view_reviews', label: 'Viewed testimonials', delta: 6, bucket: 'Comparison', path: false, negative: false },
        { name: 'page_view_team', label: 'Viewed team profiles', delta: 5, bucket: 'Comparison', path: false, negative: false },
        { name: 'page_view_warranty', label: 'Viewed warranty details', delta: 6, bucket: 'Comparison', path: false, negative: false },
        { name: 'download_guide', label: 'Downloaded prep guide', delta: 12, bucket: 'Comparison', path: true, negative: false },
        { name: 'click_competitor_compare', label: 'Viewed competitor comparison', delta: 10, bucket: 'Comparison', path: true, negative: false },
        { name: 'interaction_calculator', label: 'Used estimate calculator', delta: 12, bucket: 'Comparison', path: true, negative: false },
        { name: 'faq_expand_pricing', label: 'Expanded pricing FAQ', delta: 4, bucket: 'Comparison', path: false, negative: false },
        
        // Active (45-89 range)
        { name: 'form_start_contact', label: 'Started contact form', delta: 15, bucket: 'Active', path: true, negative: false },
        { name: 'form_submit_contact', label: 'Submitted contact form', delta: 30, bucket: 'Active', path: true, negative: false },
        { name: 'click_call_sales', label: 'Clicked sales phone number', delta: 25, bucket: 'Active', path: true, negative: false },
        { name: 'click_email_link', label: 'Clicked mailto link', delta: 15, bucket: 'Active', path: false, negative: false },
        { name: 'chat_initiate', label: 'Started live chat', delta: 20, bucket: 'Active', path: true, negative: false },
        { name: 'chat_provide_email', label: 'Gave email to chatbot', delta: 25, bucket: 'Active', path: false, negative: false },
        { name: 'booking_select_time', label: 'Selected calendar slot', delta: 20, bucket: 'Active', path: true, negative: false },
        { name: 'booking_confirm', label: 'Confirmed appointment', delta: 40, bucket: 'Active', path: true, negative: false },

        // Emergency (90+ range)
        { name: 'page_view_emergency', label: 'Viewed emergency services', delta: 40, bucket: 'Emergency', path: true, negative: false },
        { name: 'page_view_burst_pipe', label: 'Viewed burst pipe page', delta: 45, bucket: 'Emergency', path: true, negative: false },
        { name: 'click_call_emergency', label: 'Clicked emergency 24/7 number', delta: 50, bucket: 'Emergency', path: true, negative: false },
        { name: 'form_submit_urgent', label: 'Submitted urgent dispatch form', delta: 60, bucket: 'Emergency', path: true, negative: false },
        { name: 'search_emergency_plumber', label: 'Searched site for emergency', delta: 35, bucket: 'Emergency', path: true, negative: false },

        // Negative Events
        { name: 'form_abandon', label: 'Abandoned form half-filled', delta: -10, bucket: 'Negative', path: false, negative: true },
        { name: 'bounce_fast', label: 'Bounced under 5 seconds', delta: -5, bucket: 'Negative', path: false, negative: true },
        { name: 'unsubscribe_email', label: 'Unsubscribed from marketing', delta: -20, bucket: 'Negative', path: false, negative: true },
        { name: 'a2p_unsubscribe', label: 'Replied STOP to SMS', delta: -25, bucket: 'Negative', path: false, negative: true },
        { name: 'cart_abandon', label: 'Abandoned checkout', delta: -15, bucket: 'Negative', path: false, negative: true },
        { name: 'appointment_noshow', label: 'Missed scheduled appointment', delta: -20, bucket: 'Negative', path: false, negative: true },
        { name: 'error_404', label: 'Hit broken link', delta: -2, bucket: 'Negative', path: false, negative: true }
    ];

    let activeFilter = $state('All');
    
    let filteredEvents = $derived(
        activeFilter === 'All' 
            ? PIXEL_EVENTS 
            : PIXEL_EVENTS.filter(e => e.bucket === activeFilter)
    );

    let activeTab = $state('standard'); // 'standard' | 'negative'

    const payloadStandard = `{
  "event": "page_view_pricing",
  "timestamp": "2026-10-12T14:22:05Z",
  "identity": {
    "fingerprintId": "fp_7c4e2a",
    "sessionId": "cs_9912c",
    "identityTier": 5,
    "identityConfidence": 20,
    "isReturningVisitor": false
  },
  "engine_state": {
    "intentBucket": "Comparison",
    "delta": 8,
    "scoreRaw": 28,
    "scoreLive": 28,
    "pathContextMatched": true,
    "pathMultiplier": 1.5
  },
  "context": {
    "url": "https://rightflush.ca/pricing",
    "referrer": "https://google.com/",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "viewport": "1920x1080"
  }
}`;

    const payloadNegative = `{
  "event": "form_abandon",
  "timestamp": "2026-10-12T14:24:10Z",
  "identity": {
    "fingerprintId": "fp_7c4e2a",
    "sessionId": "cs_9912c",
    "identityTier": 5,
    "identityConfidence": 20,
    "isReturningVisitor": false
  },
  "engine_state": {
    "intentBucket": "Negative",
    "delta": -10,
    "scoreRaw": 18,
    "scoreLive": 18,
    "pathContextMatched": false,
    "pathMultiplier": 1.0
  },
  "context": {
    "url": "https://rightflush.ca/contact",
    "referrer": "https://rightflush.ca/pricing",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "viewport": "1920x1080"
  },
  "metadata": {
    "form_id": "contact_main",
    "fields_completed": 2,
    "last_field_focused": "phone_number",
    "friction_detected": true
  }
}`;

</script>

<div class="demo-container">
    <header class="demo-header">
        <h1>Pixel Platform</h1>
        <p>The complete event taxonomy and payload structure driving the ClearSky engine.</p>
    </header>

    <!-- Part 1: Event Catalogue -->
    <div class="catalogue-section">
        <div class="section-header">
            <h3>Event Catalogue (35+)</h3>
            <div class="filters">
                {#each ['All', 'Emergency', 'Active', 'Comparison', 'Research', 'Negative'] as filter (filter)}
                    <button 
                        class="filter-pill {activeFilter === filter ? 'active' : ''}"
                        onclick={() => activeFilter = filter}
                    >
                        {filter}
                    </button>
                {/each}
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Label</th>
                        <th>Base Delta</th>
                        <th>Bucket Signal</th>
                        <th>Path Multiplier</th>
                        <th>Negative</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredEvents as event (event.name)}
                        <tr>
                            <td><code>{event.name}</code></td>
                            <td>{event.label}</td>
                            <td>
                                <span class="delta-pill {event.delta > 0 ? 'pos' : 'neg'}">
                                    {event.delta > 0 ? '+' : ''}{event.delta}
                                </span>
                            </td>
                            <td>
                                <span class="bucket-pill b-{event.bucket.toLowerCase()}">
                                    {event.bucket}
                                </span>
                            </td>
                            <td>
                                {#if event.path}
                                    <span class="badge yes">Yes</span>
                                {:else}
                                    <span class="badge no">No</span>
                                {/if}
                            </td>
                            <td>
                                {#if event.negative}
                                    <span class="badge yes-neg">Yes</span>
                                {:else}
                                    <span class="badge no">No</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Part 2: Payload Inspector -->
    <div class="payload-section">
        <div class="section-header">
            <div>
                <h3>Live Payload Inspector</h3>
                <p class="panel-desc">This is what the hub receives on every <code>firePixel()</code> call.</p>
            </div>
            <div class="tabs-nav">
                <button 
                    class="tab-btn {activeTab === 'standard' ? 'active' : ''}" 
                    onclick={() => activeTab = 'standard'}
                >
                    Standard Page Load
                </button>
                <button 
                    class="tab-btn {activeTab === 'negative' ? 'active' : ''}" 
                    onclick={() => activeTab = 'negative'}
                >
                    Negative Friction Event
                </button>
            </div>
        </div>

        <div class="code-window">
            <div class="window-header">
                <div class="dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                </div>
                <div class="filename">POST /hub/events</div>
            </div>
            <div class="window-body">
                <pre><code>{#if activeTab === 'standard'}{payloadStandard}{:else}{payloadNegative}{/if}</code></pre>
            </div>
        </div>
    </div>
</div>

<style>
    .demo-container {
        padding: 40px;
        max-width: 1200px;
        margin: 0 auto;
        font-family: var(--sans, system-ui, sans-serif);
        color: #111714;
    }

    .demo-header {
        margin-bottom: 40px;
    }

    .demo-header h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px;
        color: #0D1F14;
    }

    .demo-header p {
        font-size: 16px;
        color: #4A5E52;
        margin: 0;
    }

    h3 {
        margin: 0;
        font-size: 20px;
        color: #0D1F14;
    }

    .panel-desc {
        margin: 4px 0 0 0;
        color: #64748b;
        font-size: 14px;
    }

    /* Section Headers */
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 20px;
    }

    /* Part 1: Catalogue */
    .catalogue-section {
        margin-bottom: 48px;
    }

    .filters {
        display: flex;
        gap: 8px;
    }

    .filter-pill {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .filter-pill:hover {
        background: #f1f5f9;
        color: #0f172a;
    }

    .filter-pill.active {
        background: #0f172a;
        color: white;
        border-color: #0f172a;
    }

    .table-container {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow-x: auto;
        max-height: 500px;
        overflow-y: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 14px;
    }

    th {
        background: #f8fafc;
        padding: 16px;
        font-weight: 600;
        color: #475569;
        border-bottom: 2px solid #e2e8f0;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    td {
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        color: #0f172a;
        white-space: nowrap;
    }

    tr:hover td {
        background: #f8fafc;
    }

    code {
        font-family: monospace;
        font-size: 13px;
    }

    td code {
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: 6px;
        color: #334155;
    }

    .delta-pill {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 13px;
        text-align: center;
        min-width: 40px;
    }
    .delta-pill.pos { background: #dcfce7; color: #166534; }
    .delta-pill.neg { background: #fee2e2; color: #991b1b; }

    .bucket-pill {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .b-emergency { background: #fee2e2; color: #991b1b; }
    .b-active { background: #dcfce7; color: #166534; }
    .b-comparison { background: #fef9c3; color: #854d0e; }
    .b-research { background: #f1f5f9; color: #475569; }
    .b-negative { background: #f3f4f6; color: #374151; }

    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge.yes { background: #e0f2fe; color: #0369a1; }
    .badge.no { color: #94a3b8; }
    .badge.yes-neg { background: #fee2e2; color: #991b1b; }

    /* Part 2: Payload Inspector */
    .tabs-nav {
        display: flex;
        gap: 8px;
    }

    .tab-btn {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }
    .tab-btn:hover { background: #f8fafc; color: #0f172a; }
    .tab-btn.active { background: #0f172a; color: white; border-color: #0f172a; }

    .code-window {
        background: #0f172a;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    }

    .window-header {
        background: #1e293b;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #334155;
    }

    .dots {
        display: flex;
        gap: 6px;
        margin-right: 16px;
    }

    .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }

    .filename {
        color: #94a3b8;
        font-family: monospace;
        font-size: 13px;
    }

    .window-body {
        padding: 24px;
        overflow-x: auto;
    }

    .window-body pre {
        margin: 0;
    }

    .window-body code {
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #e2e8f0;
    }

    /* Basic JSON Syntax Highlighting Simulation */
    .window-body code {
        color: #38bdf8; /* keys */
    }

    @media (max-width: 1024px) {
        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }
        .filters {
            flex-wrap: wrap;
        }
    }
</style>
