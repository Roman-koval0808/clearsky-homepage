<script lang="ts">
    import { page } from '$app/stores';
    let { children } = $props();

    const navItems = [
        { label: 'Overview', href: '/marketing-automation/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'Visitors & Leads', href: '/marketing-automation/admin/visitors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'Event Log', href: '/marketing-automation/admin/events', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
        { label: 'Dynamic Rules', href: '/marketing-automation/admin/rules', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
        { label: 'Promo Performance', href: '/marketing-automation/admin/performance', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
        { label: 'Automation Triggers', href: '/marketing-automation/admin/triggers', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ];

    const engineNavItems = [
        { label: '1. Platform Overview', href: '/marketing-automation/admin/platform-overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: '2. Orchestrator Pipeline', href: '/marketing-automation/admin/orchestrator-demo', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { label: '3. Engine Simulator', href: '/marketing-automation/admin/engine-demo', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
        { label: '4. Customer Journey', href: '/marketing-automation/admin/journey-demo', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: '5. ContentRadar', href: '/marketing-automation/admin/contentradar-demo', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { label: '6. Fingerprinting', href: '/marketing-automation/admin/fingerprinting-demo', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4' },
        { label: '7. A2P Messaging', href: '/marketing-automation/admin/a2p-demo', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { label: '8. Pixel Platform', href: '/marketing-automation/admin/pixel-demo', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' }
    ];
</script>

<div class="admin-layout">
    <aside class="admin-sidebar">
        <div class="sidebar-brand">
            <div class="brand-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <span>ClearSky Engine</span>
        </div>
        <nav class="sidebar-nav">
            {#each navItems as item (item.href)}
                <a 
                    href={item.href} 
                    class="nav-link {$page.url.pathname === item.href || ($page.url.pathname.startsWith(item.href) && item.href !== '/marketing-automation/admin') ? 'active' : ''}"
                >
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d={item.icon}></path>
                    </svg>
                    {item.label}
                </a>
            {/each}

            <hr class="nav-divider" />
            <div class="nav-section-title">Engine Demos</div>
            
            {#each engineNavItems as item (item.href)}
                <a 
                    href={item.href} 
                    class="nav-link {$page.url.pathname.startsWith(item.href) ? 'active' : ''}"
                >
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d={item.icon}></path>
                    </svg>
                    {item.label}
                </a>
            {/each}
        </nav>
    </aside>
    
    <div class="admin-main">
        <header class="admin-header">
            <div class="header-title">Marketing Automation Intelligence</div>
            <div class="header-actions">
                <div class="admin-avatar">A</div>
            </div>
        </header>
        <main class="admin-content">
            {@render children()}
        </main>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        background-color: #f8fafc;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .admin-layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
    }

    .admin-sidebar {
        width: 260px;
        background: #0f172a;
        color: white;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px;
        font-size: 18px;
        font-weight: 700;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .brand-logo {
        width: 32px;
        height: 32px;
        background: #10b981;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .brand-logo svg {
        width: 18px;
        height: 18px;
        color: white;
    }

    .sidebar-nav {
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: #94a3b8;
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }

    .nav-link:hover {
        background: rgba(255,255,255,0.05);
        color: white;
    }

    .nav-link.active {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .nav-icon {
        width: 20px;
        height: 20px;
    }

    .nav-divider {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.1);
        margin: 12px 0;
    }

    .nav-section-title {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.05em;
        padding: 0 16px;
        margin-bottom: 8px;
        margin-top: 8px;
    }

    .admin-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .admin-header {
        height: 72px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        flex-shrink: 0;
    }

    .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #334155;
    }

    .admin-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #10b981;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
    }

    .admin-content {
        flex: 1;
        overflow-y: auto;
        padding: 32px;
    }
</style>
