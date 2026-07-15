<script>
  export let firm = {};
  export let summary = {};

  function printReport() {
    window.print();
  }

  function downloadData() {
    const data = JSON.stringify({ firm, summary }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contentradar-audit-${firm.name?.replace(/\s+/g, '-').toLowerCase()}-${firm.auditDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="topbar">
  <div class="topbar-left">
    <div class="firm-name">{firm.name} — {firm.city}</div>
    <div class="firm-meta">
      Audit initiated {firm.auditDate} · Data pull complete · {summary.signalsScoredAuto} / 60 signals scored
    </div>
  </div>
  <div class="topbar-right">
    <span class="status-pill">Ready for review</span>
    <button class="btn" onclick={printReport}>Print / Save PDF</button>
    <button class="btn btn-primary" onclick={downloadData}>Download data export</button>
    <button class="btn btn-icon">···</button>
  </div>
</div>

<style>
  @media print {
    .topbar {
      background: white !important;
      padding: 0 0 10px 0 !important;
    }
  }
  .topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px 20px 10px;
    border-bottom: 0.5px solid var(--color-border, #e0dfd8);
    background: var(--color-bg-secondary, #f5f5f0);
    gap: 12px;
  }

  .firm-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary, #1a1a18);
  }

  .firm-meta {
    font-size: 11px;
    color: var(--color-text-tertiary, #888);
    margin-top: 3px;
    line-height: 1.5;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .status-pill {
    font-size: 11px;
    padding: 5px 12px;
    border-radius: 9999px;
    background: #E1F5EE;
    color: #085041;
    border: 0.5px solid #0F6E56;
    text-align: center;
    line-height: 1.3;
    white-space: nowrap;
  }

  .btn {
    font-size: 13px;
    padding: 6px 16px;
    border-radius: 9999px;
    border: 0.5px solid #ccc;
    background: #fff;
    cursor: pointer;
    color: var(--color-text-primary, #1a1a18);
    white-space: nowrap;
    font-family: inherit;
  }

  .btn:hover {
    background: var(--color-bg-secondary, #f5f5f0);
  }

  .btn-primary {
    background: #4267AD;
    color: white;
    border-color: #4267AD;
  }

  .btn-primary:hover {
    background: #3C3489;
  }

  .btn-icon {
    padding: 4px 10px;
    font-size: 16px;
    line-height: 1;
  }
</style>
