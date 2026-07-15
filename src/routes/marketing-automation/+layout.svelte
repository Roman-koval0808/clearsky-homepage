<script lang="ts">
    import { onMount } from 'svelte';
    import TrustBar from '$lib/components/marketing-automation/rightflush/TrustBar.svelte';
    import Nav from '$lib/components/marketing-automation/rightflush/Nav.svelte';
    import MobileHeader from '$lib/components/marketing-automation/rightflush/MobileHeader.svelte';
    import MobileMenu from '$lib/components/marketing-automation/rightflush/MobileMenu.svelte';
    import Footer from '$lib/components/marketing-automation/rightflush/Footer.svelte';
    import LeadGrabber from '$lib/components/marketing-automation/rightflush/LeadGrabber.svelte';
    import ChatWidget from '$lib/components/marketing-automation/rightflush/ChatWidget.svelte';
    import DemoPanel from '$lib/components/marketing-automation/rightflush/DemoPanel.svelte';
    import DynamicPromo from '$lib/components/marketing-automation/rightflush/DynamicPromo.svelte';
    import { pixelStore, firePixel, initPixelStore, getFingerprintId, setCachedFingerprintId } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';
    import { page } from '$app/state';

    let { children } = $props();
    let mobileMenuOpen = $state(false);
    let isAdmin = $derived(page.url.pathname.includes('/marketing-automation/admin'));

    onMount(async () => {
        initPixelStore();
        
        const fpId = await getFingerprintId();
        setCachedFingerprintId(fpId);

        const path = window.location.pathname;
        const dwellBuckets = (() => {
            if (path.includes('/marketing-automation/blog') || path.includes('/marketing-automation/faq')) {
                return { b60: 'research', b120: 'research' };
            }
            if (path.includes('/marketing-automation/specials')) {
                return { b60: 'active', b120: 'active' };
            }
            return { b60: 'comparison', b120: 'active' };
        })();

        const handleScroll = () => {
            // Scroll depth logic
            const doc = document.documentElement.scrollHeight - window.innerHeight;
            if (doc > 0) {
                const pct = Math.round((window.scrollY / doc) * 100);
                if (pct >= 25 && pixelStore.scrollDepth < 25) firePixel('scroll_25', 'Scroll 25%', 3, 'research');
                if (pct >= 50 && pixelStore.scrollDepth < 50) firePixel('scroll_50', 'Scroll 50%', 5, 'research');
                if (pct >= 75 && pixelStore.scrollDepth < 75) firePixel('scroll_75', 'Scroll 75%', 7, 'comparison');
                if (pct >= 90 && pixelStore.scrollDepth < 90) firePixel('scroll_90', 'Scroll 90%', 8, 'comparison');
                pixelStore.scrollDepth = Math.max(pixelStore.scrollDepth, pct);
            }

            // Reveal animations
            document.querySelectorAll('.reveal').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('visible');
            });
        };

        window.addEventListener('scroll', handleScroll);
        
        // Initial check
        handleScroll();

        // Global IntersectionObserver for data-pixel-event
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const eventName = entry.target.getAttribute('data-pixel-event');
                    if (eventName) {
                        const eventLabel = entry.target.getAttribute('data-pixel-label') || `Viewed ${eventName}`;
                        const delta      = parseInt(entry.target.getAttribute('data-pixel-delta') || '5', 10);
                        const bucket     = entry.target.getAttribute('data-pixel-bucket') || 'research';
                        firePixel(eventName, eventLabel, delta, bucket);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-pixel-event]').forEach(el => observer.observe(el));

        // Dwell timers
        const dwellStart = Date.now();
        const dwellInterval = setInterval(() => {
            const s = Math.round((Date.now() - dwellStart) / 1000);
            if (s >= 30  && !pixelStore.dwell30)  { pixelStore.dwell30  = true; firePixel('dwell_30',  'Engaged on page for 30s',  4,  'research'); }
            if (s >= 60  && !pixelStore.dwell60)  { pixelStore.dwell60  = true; firePixel('dwell_60',  'Engaged on page for 1 min',  7,  dwellBuckets.b60); }
            if (s >= 120 && !pixelStore.dwell120) { pixelStore.dwell120 = true; firePixel('dwell_120', 'Extended engagement (2 mins)', 10, dwellBuckets.b120); }
            if (pixelStore.dwell120) clearInterval(dwellInterval);
        }, 1000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(dwellInterval);
            observer.disconnect();
        };
    });

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMobileMenu() {
        mobileMenuOpen = false;
        document.body.style.overflow = '';
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<div class="marketing-automation-shell" class:is-admin={isAdmin}>
    {#if !isAdmin}
        <TrustBar />
        <Nav />
        <MobileHeader onToggle={toggleMobileMenu} isOpen={mobileMenuOpen} />
        <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
    {/if}

    <main class="page-content" class:admin-content={isAdmin}>
        {@render children()}
    </main>

    {#if !isAdmin}
        <Footer />
        <LeadGrabber />
        <ChatWidget />
        <DemoPanel />
        <DynamicPromo />
    {/if}
</div>

<style>
    :global(:root) {
        --white:      #FFFFFF;
        --surface:    #F8F6F1;
        --border:     #E8E4DC;
        --text:       #111714;
        --text2:      #4A5E52;
        --text3:      #8A9E92;
        --green:      #1B5E3B;
        --green-mid:  #2D7A52;
        --green-lt:   #EBF5EF;
        --green-dk:   #0D3B27;
        --rust:       #C24A1E;
        --rust-lt:    #FAEDE8;
        --gold:       #B8862A;
        --gold-lt:    #FBF5E6;
        --ink:        #0D1F14;
        --sans:       'Barlow', sans-serif;
        --cond:       'Barlow Condensed', sans-serif;
        --nav-h:      68px;
        --trust-h:    40px;
        --col:        1180px;
        --radius:     20px;
    }

    :global(body) {
        font-family: var(--sans);
        background: var(--white);
        color: var(--text);
        overflow-x: hidden;
    }

    .page-content {
        margin-top: calc(var(--trust-h) + var(--nav-h));
    }
    
    .page-content.admin-content {
        margin-top: 0;
    }

    @media (max-width: 768px) {
        :global(:root) {
            --trust-h: 0px;
            --nav-h: 60px;
        }
        .page-content {
            margin-top: 60px;
        }
    }

    /* Shared animations */
    :global(.reveal) {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.7s ease, transform 0.7s ease;
    }
    :global(.reveal.visible) {
        opacity: 1;
        transform: translateY(0);
    }
    :global(.reveal-delay-1) { transition-delay: 0.1s; }
    :global(.reveal-delay-2) { transition-delay: 0.2s; }
    :global(.reveal-delay-3) { transition-delay: 0.3s; }
    :global(.reveal-delay-4) { transition-delay: 0.4s; }
</style>
