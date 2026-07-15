<script lang="ts">
    import { fly, fade, slide } from 'svelte/transition';

    interface Question {
        id: string;
        text: string;
        source: string;
        page: string;
        session: string;
        topic: string;
        time: string;
    }

    const MOCK_QUESTIONS: Question[] = [
        { id: 'q1', text: "Do I need to leave my taps dripping tonight?", source: "Blog Hero", page: "/blog/winter-prep", session: "fp_881b2", topic: "Frozen Pipes", time: "11:02 AM" },
        { id: 'q2', text: "My water heater is making a popping sound", source: "Sidebar Form", page: "/services/water-heaters", session: "cs_1292a", topic: "Water Heaters", time: "11:45 AM" },
        { id: 'q3', text: "Are my outside taps at risk of freezing?", source: "FAQ Widget", page: "/faq", session: "fp_910ca", topic: "Frozen Pipes", time: "12:15 PM" },
        { id: 'q4', text: "How much to replace a garbage disposal?", source: "Pricing Page", page: "/pricing", session: "cs_441bb", topic: "Pricing", time: "1:22 PM" },
        { id: 'q5', text: "Pipes in the garage feel cold, should I wrap them?", source: "Blog Hero", page: "/blog/winter-prep", session: "cs_9912c", topic: "Frozen Pipes", time: "2:05 PM" },
        { id: 'q6', text: "What temperature do pipes actually freeze at?", source: "Contact Form", page: "/contact", session: "fp_112bc", topic: "Frozen Pipes", time: "3:30 PM" },
        { id: 'q7', text: "Is it bad to flush wipes if they say flushable?", source: "Sidebar Form", page: "/blog/clogs", session: "cs_551da", topic: "Clogs", time: "4:12 PM" },
        { id: 'q8', text: "I have no water coming out of the sink, is it frozen?", source: "FAQ Widget", page: "/faq", session: "fp_221cd", topic: "Frozen Pipes", time: "5:01 PM" }
    ];

    let activeIndex = $state(-1);
    let activeQuestions = $derived(activeIndex >= 0 ? MOCK_QUESTIONS.slice(0, activeIndex + 1) : []);
    let frozenPipesCount = $derived(activeQuestions.filter(q => q.topic === 'Frozen Pipes').length);
    let isFlagged = $derived(frozenPipesCount >= 5);

    let draftStatus = $state<'idle' | 'loading' | 'ready'>('idle');

    function simulateNext() {
        if (activeIndex < MOCK_QUESTIONS.length - 1) {
            activeIndex++;
        }
    }

    function draftWithClaude() {
        draftStatus = 'loading';
        setTimeout(() => {
            draftStatus = 'ready';
        }, 1500);
    }
</script>

<div class="demo-container">
    <header class="demo-header">
        <div class="header-split">
            <div>
                <h1>ContentRadar</h1>
                <p>Detecting high-intent clusters and driving human-in-the-loop workflows.</p>
            </div>
            <div class="controls">
                <button 
                    class="btn-simulate" 
                    onclick={simulateNext}
                    disabled={activeIndex >= MOCK_QUESTIONS.length - 1}
                >
                    Simulate Next Inbound Question
                </button>
            </div>
        </div>
    </header>

    <div class="radar-layout">
        <!-- Part 1: Question Stream -->
        <div class="stream-panel">
            <h3>Live Question Stream</h3>
            <p class="panel-desc">Aggregated from all site forms, FAQs, and widgets.</p>

            <div class="feed-container">
                {#if activeQuestions.length === 0}
                    <div class="empty-state">Waiting for inbound signals...</div>
                {/if}
                
                <div class="feed-list">
                    {#each [...activeQuestions].reverse() as q (q.id)}
                        <div class="question-card" in:fly={{ y: -20, duration: 300 }}>
                            <div class="q-header">
                                <span class="q-topic {q.topic === 'Frozen Pipes' ? 'hot-topic' : ''}">{q.topic}</span>
                                <span class="q-time">{q.time}</span>
                            </div>
                            <div class="q-text">"{q.text}"</div>
                            <div class="q-meta">
                                <span class="meta-item">📍 {q.source}</span>
                                <span class="meta-item">🔗 {q.page}</span>
                                <span class="meta-item">👤 {q.session}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Right Side: Counter & Workflow -->
        <div class="dashboard-panel">
            <!-- Part 2: Threshold Counter -->
            <div class="threshold-card {isFlagged ? 'flagged-state' : ''}">
                <div class="card-header">
                    <h3>Hot Clusters</h3>
                    <span class="window-badge">48h Window</span>
                </div>
                
                <div class="cluster-item">
                    <div class="cluster-title">
                        <strong>Frozen Pipes</strong>
                        <span>{frozenPipesCount} / 5</span>
                    </div>
                    <div class="progress-track">
                        <div 
                            class="progress-fill {isFlagged ? 'fill-red' : ''}" 
                            style="width: {(frozenPipesCount / 5) * 100}%"
                        ></div>
                    </div>
                </div>

                {#if isFlagged}
                    <div class="flag-banner" in:slide={{ duration: 400 }}>
                        <strong>🚨 ContentRadar Flag Fired</strong>
                        <p>5 questions detected in 38 hours. Publishing a dedicated article is highly recommended.</p>
                    </div>
                {/if}
            </div>

            <!-- Part 3: Rep Workflow -->
            {#if isFlagged}
                <div class="workflow-card" in:fade={{ duration: 400, delay: 200 }}>
                    <div class="card-header border-bottom">
                        <h3>Action Workflow</h3>
                        <span class="status-badge">Requires Human Review</span>
                    </div>

                    <div class="workflow-content">
                        <div class="context-group">
                            <span class="context-label">Topic Context</span>
                            <div class="context-value">Frozen Pipes (High Urgency)</div>
                        </div>

                        <div class="context-group">
                            <span class="context-label">Approved Source Material (Pre-filtered)</span>
                            <ul class="source-list">
                                <li><code>rightflush-winter-prep-guide.pdf</code></li>
                                <li><code>URL: rightflush.ca/services/winterization</code></li>
                            </ul>
                        </div>

                        <div class="action-section">
                            {#if draftStatus === 'idle'}
                                <button class="btn-claude" onclick={draftWithClaude}>
                                    ✨ Draft Article with Claude
                                </button>
                                <p class="action-note">Passes the 5 recent questions and approved source material to the LLM to draft a highly relevant FAQ post.</p>
                            {:else if draftStatus === 'loading'}
                                <div class="loading-state">
                                    <div class="spinner"></div>
                                    <span>Claude is drafting...</span>
                                </div>
                            {:else}
                                <div class="success-state" in:fade>
                                    <div class="success-icon">✅</div>
                                    <div class="success-text">
                                        <strong>Draft Ready for Review</strong>
                                        <span>Sent to the Content Approval Queue.</span>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
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

    .header-split {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
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

    .btn-simulate {
        background: #0f172a;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
    }

    .btn-simulate:hover:not(:disabled) {
        background: #1e293b;
        transform: translateY(-1px);
    }

    .btn-simulate:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .radar-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
    }

    /* Stream Panel */
    .stream-panel, .dashboard-panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    h3 {
        margin: 0;
        font-size: 20px;
        color: #0D1F14;
    }

    .panel-desc {
        margin: -20px 0 0 0;
        color: #64748b;
        font-size: 14px;
    }

    .feed-container {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        min-height: 500px;
        max-height: 600px;
        overflow-y: auto;
    }

    .empty-state {
        text-align: center;
        color: #94a3b8;
        padding: 40px 0;
        font-style: italic;
    }

    .feed-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .question-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .q-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .q-topic {
        font-size: 12px;
        font-weight: 700;
        background: #f1f5f9;
        color: #475569;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .q-topic.hot-topic {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
    }

    .q-time {
        font-size: 12px;
        color: #94a3b8;
    }

    .q-text {
        font-size: 15px;
        font-weight: 500;
        color: #0f172a;
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .q-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #64748b;
        flex-wrap: wrap;
    }

    /* Dashboard Panel */
    .threshold-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        transition: all 0.3s;
    }

    .threshold-card.flagged-state {
        border-color: #ef4444;
        box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .border-bottom {
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 16px;
    }

    .window-badge {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .cluster-item {
        margin-bottom: 20px;
    }

    .cluster-title {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 15px;
    }

    .progress-track {
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-fill.fill-red {
        background: #ef4444;
    }

    .flag-banner {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        padding: 16px;
        border-radius: 8px;
        color: #7f1d1d;
    }

    .flag-banner strong {
        display: block;
        font-size: 16px;
        margin-bottom: 4px;
    }

    .flag-banner p {
        margin: 0;
        font-size: 14px;
    }

    /* Workflow Card */
    .workflow-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
    }

    .status-badge {
        font-size: 12px;
        font-weight: 600;
        color: #b45309;
        background: #fef3c7;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .workflow-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .context-label {
        display: block;
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;
        color: #64748b;
        margin-bottom: 8px;
    }

    .context-value {
        font-size: 15px;
        font-weight: 500;
        color: #0f172a;
    }

    .source-list {
        margin: 0;
        padding-left: 20px;
        font-size: 14px;
        color: #475569;
    }

    .source-list li {
        margin-bottom: 4px;
    }

    code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
    }

    .action-section {
        margin-top: 12px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }

    .btn-claude {
        width: 100%;
        background: #6d28d9;
        color: white;
        border: none;
        padding: 16px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 12px;
    }

    .btn-claude:hover {
        background: #5b21b6;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
    }

    .action-note {
        margin: 0;
        font-size: 13px;
        color: #64748b;
        text-align: center;
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 8px;
        color: #6d28d9;
        font-weight: 500;
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e9d5ff;
        border-top-color: #6d28d9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .success-state {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
    }

    .success-icon {
        font-size: 24px;
    }

    .success-text {
        display: flex;
        flex-direction: column;
    }

    .success-text strong {
        color: #166534;
        font-size: 15px;
    }

    .success-text span {
        color: #15803d;
        font-size: 14px;
    }

    @media (max-width: 768px) {
        .radar-layout {
            grid-template-columns: 1fr;
        }
        .header-split {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }
    }
</style>
