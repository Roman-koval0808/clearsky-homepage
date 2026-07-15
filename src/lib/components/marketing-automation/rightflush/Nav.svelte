<script lang="ts">
    import { page } from '$app/state';
    import { firePixel } from './pixelStore.svelte';

    const services = [
        { id: 'HotWater', label: 'Hot Water', href: '/marketing-automation/hot-water', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z M12 6v6l4 2' },
        { id: 'Drains', label: 'Drains', href: '/marketing-automation/blocked-drains', icon: 'M12 22V12m0 0C12 7 7 4 7 4s1 4 5 8zm0 0c0-5 5-8 5-8s-1 4-5 8z' },
        { id: 'Bathroom', label: 'Bathrooms', href: '/marketing-automation/bathroom-renovations', icon: 'M2 11h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z M6 11V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7 M6 19v2M18 19v2' },
        { id: 'Leaks', label: 'Leaks', href: '/marketing-automation/leak-detection', icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
        { id: 'Gas', label: 'Gas', href: '/marketing-automation/gas-plumbing', icon: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' },
        { id: 'Pipes', label: 'Pipes', href: '/marketing-automation/pipe-repair', icon: 'M12 12H5a4 4 0 0 1 0-8h14 M12 12h7a4 4 0 0 1 0 8H5' },
        { id: 'Water', label: 'Filtration', href: '/marketing-automation/water-filtration', icon: 'M12 2l-5.5 9h11L12 2z M6.5 11a6 6 0 1 0 11 0' },
        { id: 'Pricing', label: 'Pricing', href: '/marketing-automation/pricing', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
        { id: 'Reviews', label: 'Reviews', href: '/marketing-automation/reviews', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
        { id: 'Blog', label: 'Blog', href: '/marketing-automation/blog', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8' }
    ];

    let scrolled = $state(false);

    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', () => {
            scrolled = window.scrollY > 20;
        });
    }
</script>

<nav class:scrolled id="mainNav">
  <div class="nav-inner">

    <a href="/marketing-automation" class="nav-logo">
      <div class="nav-logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div class="nav-logo-text">
        <span class="nav-logo-name">RightFlush</span>
        <span class="nav-logo-tag">Plumbing · Timmins ON</span>
      </div>
    </a>

    <div class="nav-services">
      {#each services as svc}
        <a 
            href={svc.href} 
            class="nav-svc" 
            class:active={page.url.pathname === svc.href}
        >
          <div class="nav-svc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                {#if svc.id === 'HotWater'}
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                {:else if svc.id === 'Drains'}
                    <path d="M12 22V12m0 0C12 7 7 4 7 4s1 4 5 8zm0 0c0-5 5-8 5-8s-1 4-5 8z"/>
                {:else if svc.id === 'Bathroom'}
                    <rect x="2" y="11" width="20" height="8" rx="2"/><path d="M6 11V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7"/><path d="M6 19v2M18 19v2"/>
                {:else if svc.id === 'Leaks'}
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                {:else if svc.id === 'Gas'}
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                {:else if svc.id === 'Pipes'}
                    <path d="M12 12H5a4 4 0 0 1 0-8h14"/><path d="M12 12h7a4 4 0 0 1 0 8H5"/>
                {:else if svc.id === 'Water'}
                    <path d="M12 2l-5.5 9h11L12 2z"/><path d="M6.5 11a6 6 0 1 0 11 0"/>
                {:else if svc.id === 'Pricing'}
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                {:else if svc.id === 'Reviews'}
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                {:else if svc.id === 'Blog'}
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                {/if}
            </svg>
          </div>
          <span class="nav-svc-label">{svc.label}</span>
        </a>
      {/each}
    </div>

    <div class="nav-right">
      <a 
        href="/marketing-automation/emergency" 
        class="nav-emergency" 
        onclick={() => firePixel('nav_emergency', 'Nav: Emergency', 15, 'emergency')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
        Emergency
      </a>
      <a 
        href="/marketing-automation/contact" 
        class="nav-book"
        onclick={() => firePixel('nav_book', 'Nav: Book Now', 10, 'active')}
      >Book Now</a>
    </div>

  </div>
</nav>

<style>
nav {
  position: fixed; top: var(--trust-h); left: 0; right: 0; z-index: 190;
  height: var(--nav-h);
  background: var(--white);
  border-bottom: 1px solid var(--border);
  transition: box-shadow 0.3s;
}
nav.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
.nav-inner {
  max-width: var(--col); margin: 0 auto; width: 100%;
  height: 100%; display: flex; align-items: center;
  padding: 0 24px; gap: 32px;
}
.nav-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.nav-logo-mark {
  width: 38px; height: 38px; background: var(--green);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
}
.nav-logo-mark svg { width: 22px; height: 22px; stroke: #fff; }
.nav-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
.nav-logo-name { font-family: var(--cond); font-size: 20px; font-weight: 800; color: var(--ink); text-transform: uppercase; letter-spacing: 0.02em; }
.nav-logo-tag { font-size: 10px; color: var(--text3); font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }

.nav-services { display: flex; align-items: center; gap: 2px; flex: 1; }
.nav-svc {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 12px; border-radius: var(--radius);
  transition: background 0.2s; cursor: pointer;
  text-decoration: none; border: none; background: transparent;
}
.nav-svc:hover { background: var(--green-lt); }
.nav-svc.active { background: var(--green-lt); }
.nav-svc-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.nav-svc-icon svg { width: 22px; height: 22px; stroke: var(--green); }
.nav-svc-label { font-size: 10px; font-weight: 600; color: var(--text2); letter-spacing: 0.03em; white-space: nowrap; text-align: center; }

.nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.nav-emergency {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: var(--radius);
  background: var(--rust-lt); border: 1.5px solid var(--rust);
  font-size: 13px; font-weight: 600; color: var(--rust);
  transition: all 0.2s; text-decoration: none;
}
.nav-emergency:hover { background: var(--rust); color: #fff; }
.nav-emergency svg { width: 14px; height: 14px; stroke: currentColor; }
.nav-book {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: var(--radius);
  background: var(--green); color: #fff;
  font-size: 13px; font-weight: 600;
  transition: background 0.2s; text-decoration: none; border: none;
}
.nav-book:hover { background: var(--green-mid); }

@media (max-width: 768px) {
  nav { display: none; }
}
</style>
