<script lang="ts">
    import { page } from '$app/stores';
    import { firePixel, captureIdentity } from './pixelStore.svelte';

    let isOpen = $state(false);
    let mode = $state('speak');
    let name = $state('');
    let phone = $state('');
    let job = $state('');

    let isEmergencyPage = $derived($page.url.pathname.includes('/emergency') || $page.url.pathname.includes('/burst-pipe'));

    function toggleLG() {
        isOpen = !isOpen;
        if (isOpen) firePixel('lg_open', 'Lead Grabber opened', 8, 'active');
    }

    function selectMode(m: string) {
        mode = m;
    }

    function submit() {
        const identity = mode === 'speak' ? { phone, name } : { email: phone, name };
        captureIdentity('lg_submit', 'Lead Grabber submitted', 15, 'active', identity);
        alert('Request sent! We will contact you shortly.');
        isOpen = false;
        name = ''; phone = ''; job = '';
    }
</script>

<div class="lead-grabber">
  <button class="lg-btn" onclick={toggleLG}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
  </button>
  <span class="lg-label">Get help</span>
</div>

{#if isOpen}
    <div class="lg-panel open">
      <div class="lg-header">
        <div>
          <div class="lg-header-title">Get help now</div>
          <div class="lg-header-sub">Choose how you'd like to connect</div>
        </div>
        <button class="lg-close" onclick={toggleLG}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="lg-body">
        <div class="lg-options">
          <button 
            class="lg-option" 
            class:selected={mode === 'speak'} 
            onclick={() => selectMode('speak')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
            <span>Call me back</span>
          </button>
          {#if !isEmergencyPage}
          <button 
            class="lg-option" 
            class:selected={mode === 'email'} 
            onclick={() => selectMode('email')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>Email me</span>
          </button>
          {/if}
        </div>
        <input class="lg-input" type="text" placeholder="Your name" bind:value={name}>
        <input 
            class="lg-input" 
            type={mode === 'speak' ? 'tel' : 'email'} 
            placeholder={mode === 'speak' ? 'Phone — (705) 000-0000' : 'Email address'} 
            bind:value={phone}
        >
        {#if mode === 'email'}
            <input class="lg-input" type="text" placeholder="What's the job?" bind:value={job}>
        {/if}
        <button class="lg-submit" onclick={submit}>Send request</button>
      </div>
    </div>
{/if}

<style>
.lead-grabber {
  position: fixed; bottom: 96px; right: 24px; z-index: 490;
  width: 56px; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.lg-btn {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--rust); color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(194,74,30,0.35);
  cursor: pointer; transition: all 0.2s;
}
.lg-btn:hover { background: #a83818; transform: scale(1.05); }
.lg-btn svg { width: 24px; height: 24px; stroke: #fff; }
.lg-label { font-size: 9px; font-weight: 600; color: var(--rust); letter-spacing: 0.04em; text-align: center; white-space: nowrap; }

.lg-panel {
  position: fixed; bottom: 90px; right: 90px; z-index: 490;
  width: 300px; background: var(--white);
  border: 1px solid var(--border); border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  overflow: hidden;
}
.lg-panel.open { display: block; animation: slideUp 0.3s ease; }
@keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

.lg-header { background: var(--rust); padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; }
.lg-header-title { font-family: var(--cond); font-size: 18px; font-weight: 700; color: #fff; text-transform: uppercase; }
.lg-header-sub { font-size: 11px; color: rgba(255,255,255,0.65); }
.lg-close { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; }
.lg-close svg { width: 18px; height: 18px; stroke: currentColor; }
.lg-body { padding: 16px; }
.lg-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.lg-option {
  padding: 12px; border: 1.5px solid var(--border); border-radius: var(--radius);
  text-align: center; cursor: pointer; transition: all 0.2s;
  background: none; font-family: inherit;
}
.lg-option:hover { border-color: var(--rust); background: var(--rust-lt); }
.lg-option.selected { border-color: var(--rust); background: var(--rust-lt); }
.lg-option svg { width: 22px; height: 22px; stroke: var(--rust); margin: 0 auto 6px; display: block; }
.lg-option span { font-size: 12px; font-weight: 600; color: var(--rust); }
.lg-input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-size: 13px; font-family: inherit; outline: none; margin-bottom: 8px; }
.lg-input:focus { border-color: var(--rust); }
.lg-submit { width: 100%; background: var(--rust); color: #fff; border: none; border-radius: var(--radius); padding: 12px; font-family: var(--cond); font-weight: 700; font-size: 16px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
.lg-submit:hover { background: #a83818; }
</style>
