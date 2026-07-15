<script lang="ts">
    const triggers = [
        {
            name: "Hot Lead Follow-up",
            condition: "Score ≥ 80 AND Not Contacted Today",
            action: "Send SMS Offer",
            status: "Active",
            log: 1
        },
        {
            name: "Warm Lead Nurture",
            condition: "Score ≥ 50 AND Left Site",
            action: "Send Email Campaign",
            status: "Inactive",
            log: 0
        },
        {
            name: "Abandoned Quote",
            condition: "Filled Name/Email but no Submit",
            action: "Send Push Notification",
            status: "Inactive",
            log: 0
        }
    ];
</script>

<svelte:head>
    <title>Automation Triggers — ClearSky Engine</title>
</svelte:head>

<div class="triggers-page">
    <div class="page-header">
        <h1>Automation Triggers</h1>
        <p>Configure automated messaging based on behavioral scores.</p>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Trigger Name</th>
                    <th>Condition</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Times Fired</th>
                </tr>
            </thead>
            <tbody>
                {#each triggers as t}
                    <tr>
                        <td><strong>{t.name}</strong></td>
                        <td><code class="code-cond">{t.condition}</code></td>
                        <td>{t.action}</td>
                        <td>
                            <span class="status-badge {t.status === 'Active' ? 'active' : 'inactive'}">
                                {t.status}
                            </span>
                        </td>
                        <td>{t.log}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .triggers-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 32px;
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

    .table-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .data-table th {
        padding: 16px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .data-table td {
        padding: 16px 24px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        color: #1e293b;
    }

    .code-cond {
        font-family: monospace;
        background: #f8fafc;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        color: #0f172a;
    }

    .status-badge {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .status-badge.active { background: #d1fae5; color: #047857; }
    .status-badge.inactive { background: #f1f5f9; color: #64748b; }
</style>
