<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { pixelStore, identityStore, getSessionId, resetSession } from './pixelStore.svelte';

  let visible = $state(false);
  let activeTab = $state<'events' | 'radar' | 'profile'>('events');
  let customerProfile: any = $state(null);
  let profileLoading = $state(false);
  let profileTimer: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === 'true') visible = true;
    } catch (e) {}

    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd') visible = !visible;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function fetchProfile() {
    profileLoading = true;
    try {
      const res = await fetch('/api/profile-by-session?sessionId=' + getSessionId());
      if (res.ok) {
        const data = await res.json();
        customerProfile = data.profile ?? null;
      }
    } catch {}
    profileLoading = false;
  }

  // Smart polling: only poll when panel is open AND on profile tab
  $effect(() => {
    const shouldPoll = visible && activeTab === 'profile';
    if (shouldPoll) {
      fetchProfile();
      profileTimer = setInterval(fetchProfile, 3000);
    } else {
      if (profileTimer) { clearInterval(profileTimer); profileTimer = null; }
    }
    return () => { if (profileTimer) { clearInterval(profileTimer); profileTimer = null; } };
  });

  // Also refresh profile from identityStore changes instantly (no waiting for poll)
  $effect(() => {
    if (identityStore.lastUpdated && activeTab === 'profile' && visible) {
      fetchProfile();
    }
  });

  const short = (s: string | undefined) =>
    s ? (s.length > 20 ? s.slice(0, 10) + '…' + s.slice(-6) : s) : '—';

  function relative(ts: number) {
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60) return `${d}s ago`;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    return `${Math.floor(d / 3600)}h ago`;
  }

  const BUCKET_COLOR: Record<string, string> = {
    emergency: '#7f1d1d',
    active: '#78350f',
    comparison: '#1e3a8a',
    research: '#14532d',
    unclassified: '#374151',
  };
  const BUCKET_BG: Record<string, string> = {
    emergency: '#fef2f2',
    active: '#fffbeb',
    comparison: '#eff6ff',
    research: '#f0fdf4',
    unclassified: '#f9fafb',
  };
</script>

<style>
  /* ── Toggle button ── */
  .demo-toggle {
    position: fixed; left: 18px; bottom: 18px; z-index: 9999;
    width: 44px; height: 44px; border-radius: 12px;
    background: #fff; border: 1px solid #e2e8f0;
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: box-shadow 0.2s, transform 0.15s;
    padding: 0;
  }
  .demo-toggle:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.16); transform: translateY(-1px); }
  .demo-toggle svg { display: block; }

  /* ── Panel shell ── */
  .demo-panel {
    position: fixed; left: 18px; bottom: 70px;
    width: 400px; max-height: 76vh;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.14);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    z-index: 9999;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: panelIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes panelIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Header ── */
  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;
  }
  .panel-title {
    font-weight: 800; font-size: 14px; color: #0f172a;
    display: flex; align-items: center; gap: 8px;
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
    animation: livePulse 2s infinite;
  }
  @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .close-btn {
    width: 28px; height: 28px; border-radius: 8px;
    background: #f1f5f9; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #64748b; transition: background 0.15s, color 0.15s;
  }
  .close-btn:hover { background: #e2e8f0; color: #0f172a; }

  /* ── Score bar ── */
  .score-area { padding: 10px 16px 0; flex-shrink: 0; }
  .score-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .score-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .score-val { font-size: 11px; font-weight: 700; color: #0f172a; }
  .progress-track { height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  .progress-fill  { height: 100%; background: linear-gradient(90deg, #2563eb, #1d4ed8); border-radius: 999px; transition: width 0.4s ease; }
  .bucket-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-bottom: 10px; }
  .bucket-pill {
    padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  .session-id { font-size: 10px; color: #94a3b8; font-family: monospace; }

  /* ── Tabs ── */
  .tabs-bar {
    display: flex; gap: 0;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;
    padding: 0 12px;
  }
  .tab-btn {
    padding: 9px 14px; font-size: 12px; font-weight: 600;
    color: #94a3b8; background: none; border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer; transition: color 0.15s, border-color 0.15s;
    margin-bottom: -1px;
    letter-spacing: 0.02em;
  }
  .tab-btn:hover { color: #475569; }
  .tab-btn.active { color: #1d4ed8; border-bottom-color: #1d4ed8; }

  /* ── Tab body ── */
  .tab-body { flex: 1; overflow-y: auto; padding: 10px 14px; }

  /* ── Event log rows ── */
  .event-row {
    display: flex; flex-direction: column; gap: 2px;
    padding: 8px 10px; border-radius: 8px;
    margin-bottom: 4px; background: #f8fafc;
    transition: background 0.15s;
  }
  .event-row:hover { background: #f1f5f9; }
  .event-row-top { display: flex; justify-content: space-between; align-items: center; }
  .event-name { font-weight: 700; color: #0f172a; font-size: 12px; }
  .event-time { font-size: 10px; color: #94a3b8; }
  .event-meta { font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .delta-badge { font-weight: 700; color: #16a34a; font-size: 11px; }
  .empty-state { text-align: center; padding: 32px 16px; color: #94a3b8; font-size: 12px; }
  .empty-icon { font-size: 28px; margin-bottom: 8px; }

  /* ── Profile card ── */
  .profile-card {
    background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
    border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px;
    margin-bottom: 10px;
  }
  .profile-name { font-size: 16px; font-weight: 800; color: #1e3a8a; margin-bottom: 10px; }
  .profile-field { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; color: #374151; }
  .profile-field-icon { font-size: 14px; }
  .profile-id { font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 10px; }
  .live-badge { font-size: 10px; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 2px 7px; border-radius: 999px; }
  .loading-shimmer { height: 80px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); border-radius: 10px; animation: shimmer 1.4s infinite; background-size: 200% 100%; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Radar rows ── */
  .radar-row {
    padding: 8px 10px; border-radius: 8px; background: #f8fafc; margin-bottom: 4px;
  }
  .radar-row-top { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .radar-form { font-weight: 700; font-size: 12px; color: #0f172a; }
  .radar-status { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 999px; }
  .radar-status.success { background: #dcfce7; color: #166534; }
  .radar-status.pending { background: #fef9c3; color: #854d0e; }
  .radar-status.failed  { background: #fee2e2; color: #991b1b; }
  .radar-status.error   { background: #fce7f3; color: #9d174d; }
  .radar-question { font-size: 11px; color: #64748b; }

  /* ── Footer ── */
  .panel-footer { padding: 8px 14px; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
  .reset-btn {
    width: 100%; padding: 6px; border-radius: 6px;
    background: #fef2f2; border: 1px solid #fecaca;
    color: #991b1b; font-size: 11px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .reset-btn:hover { background: #fee2e2; }
</style>

<!-- ── Toggle button ── -->
<button class="demo-toggle" aria-label="Toggle demo panel" title="Pixel Demo (Shift+D)" onclick={() => visible = !visible}>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>
</button>

{#if visible}
<div class="demo-panel" role="dialog" aria-label="Pixel Demo Panel">

  <!-- Header -->
  <div class="panel-header">
    <div class="panel-title">
      <div class="live-dot"></div>
      Pixel Demo
    </div>
    <button class="close-btn" aria-label="Close" onclick={() => visible = false}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>

  <!-- Score bar -->
  <div class="score-area">
    <div class="score-meta">
      <span class="score-label">Engagement Score</span>
      <span class="score-val">{pixelStore.score} / 100</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:{pixelStore.score}%"></div>
    </div>
    <div class="bucket-row">
      <div class="bucket-pill" style="background:{BUCKET_BG[pixelStore.bucket] ?? '#f9fafb'};color:{BUCKET_COLOR[pixelStore.bucket] ?? '#374151'}">
        {pixelStore.bucket}
      </div>
      <span class="session-id">{short(getSessionId())}</span>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs-bar">
    <button class="tab-btn" class:active={activeTab === 'events'} onclick={() => activeTab = 'events'}>
      Events ({pixelStore.eventLog.length})
    </button>
    <button class="tab-btn" class:active={activeTab === 'radar'} onclick={() => activeTab = 'radar'}>
      ContentRadar
    </button>
    <button class="tab-btn" class:active={activeTab === 'profile'} onclick={() => { activeTab = 'profile'; fetchProfile(); }}>
      Profile {identityStore.lastUpdated ? '●' : ''}
    </button>
  </div>

  <!-- Tab body -->
  <div class="tab-body">

    {#if activeTab === 'events'}
      {#if pixelStore.eventLog.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📡</div>
          No events yet — browse the site to capture activity.
        </div>
      {:else}
        {#each pixelStore.eventLog as e, i (e.ts + '_' + i)}
          <div class="event-row">
            <div class="event-row-top">
              <span class="event-name">{e.event}</span>
              <span class="event-time">{relative(e.ts)}</span>
            </div>
            <div class="event-meta">
              <span>{e.label}</span>
              <span class="delta-badge">+{e.delta}</span>
              <span style="color:{BUCKET_COLOR[e.bucket] ?? '#374151'};font-weight:600">{e.bucket}</span>
              <span>→ {e.scoreAfter}</span>
            </div>
          </div>
        {/each}
      {/if}

    {:else if activeTab === 'radar'}
      {#if pixelStore.contentRadarLog.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🔭</div>
          No ContentRadar activity yet.
        </div>
      {:else}
        {#each pixelStore.contentRadarLog as c, i (c.ts + '_' + i)}
          <div class="radar-row">
            <div class="radar-row-top">
              <span class="radar-form">{c.payload.source_form}</span>
              <span class="radar-status {c.status}">{c.status}</span>
            </div>
            <div class="radar-question">{c.payload.question_text}</div>
          </div>
        {/each}
      {/if}

    {:else if activeTab === 'profile'}
      {#if profileLoading && !customerProfile}
        <div class="loading-shimmer"></div>
      {:else if customerProfile}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Identity Resolved</span>
          <span class="live-badge">● Live</span>
        </div>
        <div class="profile-card">
          <div class="profile-name">{customerProfile.display_name || customerProfile.first_name || 'Unknown'}</div>
          <div class="profile-field">
            <span class="profile-field-icon">📧</span>
            <span>{customerProfile.email || 'No email'}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field-icon">📱</span>
            <span>{customerProfile.phone_number || 'No phone'}</span>
          </div>
          <div class="profile-id">Profile ID: {short(customerProfile.id)}</div>
        </div>
        {#if identityStore.lastUpdated}
          <div style="font-size:11px;color:#94a3b8;text-align:center;">
            Last updated: {relative(identityStore.lastUpdated)}
          </div>
        {/if}
      {:else}
        <div class="empty-state">
          <div class="empty-icon">🕵️</div>
          Anonymous session.<br>Submit any form to reveal your identity.
        </div>
      {/if}
    {/if}

  </div>

  <!-- Footer -->
  <div class="panel-footer">
    <button class="reset-btn" onclick={resetSession}>
      Reset Session Data
    </button>
  </div>

</div>
{/if}
