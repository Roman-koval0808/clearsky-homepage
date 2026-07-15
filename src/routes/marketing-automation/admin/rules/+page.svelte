<script lang="ts">
    // Visual representation of the hardcoded Dynamic Promo rule
</script>

<svelte:head>
    <title>Dynamic Content Rules — ClearSky Engine</title>
</svelte:head>

<div class="rules-page">
    <div class="page-header">
        <div class="header-split">
            <div>
                <h1>Dynamic Content Rules</h1>
                <p>Manage real-time personalization logic and triggers.</p>
            </div>
            <button class="create-btn">+ Create New Rule</button>
        </div>
    </div>

    <div class="rule-card active">
        <div class="rule-header">
            <div class="rule-status active"></div>
            <h2>Service + Pricing Promo</h2>
            <div class="badge">Goal: Capture Email/Phone</div>
        </div>

        <div class="rule-body">
            <div class="logic-block">
                <h3>IF (Conditions)</h3>
                <div class="condition-list">
                    <div class="condition-item">
                        <span class="operator">AND</span>
                        <div class="condition-text">User viewed <strong>Product/Service Page</strong></div>
                    </div>
                    <div class="condition-item">
                        <span class="operator">AND</span>
                        <div class="condition-text">User viewed <strong>Pricing Page</strong></div>
                    </div>
                </div>
            </div>

            <div class="logic-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>

            <div class="logic-block action">
                <h3>THEN (Action)</h3>
                <div class="action-item">
                    <div class="action-icon">🎯</div>
                    <div class="action-text">
                        <strong>Show 20% Discount Promo Banner</strong>
                        <p>Placement: Right-side flush modal overlay.</p>
                        <p>Message: "Limited time offer — get 20% off today"</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .rules-page {
        max-width: 1000px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 32px;
    }

    .header-split {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .page-header h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
        color: #111827;
    }

    .page-header p {
        margin: 0;
        color: #64748b;
    }

    .create-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }

    .rule-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        padding: 24px;
        position: relative;
    }

    .rule-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
    }

    .rule-status {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #cbd5e1;
    }

    .rule-status.active {
        background: #10b981;
        box-shadow: 0 0 0 4px #d1fae5;
    }

    .rule-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
    }

    .badge {
        background: #f1f5f9;
        color: #475569;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        margin-left: auto;
    }

    .logic-block {
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        padding: 20px;
    }

    .logic-block h3 {
        margin: 0 0 16px;
        font-size: 14px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .condition-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .condition-item {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .operator {
        background: #e2e8f0;
        color: #475569;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
    }

    .condition-text {
        font-size: 15px;
        color: #1e293b;
    }

    .logic-arrow {
        display: flex;
        justify-content: center;
        padding: 16px 0;
        color: #94a3b8;
    }

    .logic-block.action {
        background: #f0fdf4;
        border-color: #a7f3d0;
    }

    .logic-block.action h3 {
        color: #047857;
    }

    .action-item {
        display: flex;
        gap: 16px;
    }

    .action-icon {
        font-size: 24px;
    }

    .action-text strong {
        font-size: 16px;
        color: #065f46;
        display: block;
        margin-bottom: 8px;
    }

    .action-text p {
        margin: 0 0 4px;
        font-size: 14px;
        color: #064e3b;
    }
</style>
