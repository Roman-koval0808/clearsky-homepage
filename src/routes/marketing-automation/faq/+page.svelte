<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, captureIdentity, submitToContentRadar } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let searchTerm = $state('');
    let openItems = $state<Set<string>>(new Set(['How does flat-rate pricing work?']));
    let stillQuestion = $state('');
    let stillPhone = $state('');

    const categories = [
        {
            id: 'pricing',
            title: 'Pricing & Estimates',
            subtitle: 'What things cost and how we quote',
            icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
            faqs: [
                { q: 'How does flat-rate pricing work?', a: 'We assess the complete job before quoting and give you a single flat-rate price. That\'s the number on the invoice — no hourly rate, no parts markups, no call-out fees layered on top. If we open something up and find a problem that changes the scope, we stop, tell you, and get your approval before continuing. You never see a higher number on the invoice than what you agreed to.' },
                { q: 'Do you charge for estimates?', a: 'Free estimates on all jobs over $500. For smaller jobs — a dripping tap, a simple repair — we can usually quote over the phone or via FotoJobber photo without a visit. There\'s no call-out fee for estimates on larger work. The estimate visit costs nothing and there\'s no obligation to proceed.' },
                { q: 'What does a hot water tank replacement cost?', a: 'A conventional 40-gallon natural gas tank replacement runs $1,200–$1,800 installed — including removal and disposal of the old unit, the new tank, all connections, and testing. Tankless installations run $3,200–$4,800 depending on the unit and what infrastructure upgrades are needed. We quote the full scope. The estimate is free and there\'s no obligation to proceed.' },
                { q: 'What does it cost to clear a blocked drain?', a: 'Standard kitchen or bathroom drain clearing runs $150–$300. A main sewer line blockage requiring jetting and camera inspection is $300–$500. Root intrusion in the main line adds time and cost depending on the extent. We quote before starting — you always know the price before we touch anything.' }
            ]
        },
        {
            id: 'emergency',
            title: 'Emergency Response',
            subtitle: 'Burst pipes, flooding, no hot water',
            icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17v0.01',
            faqs: [
                { q: 'What counts as an emergency and what\'s the response time?', a: 'Emergencies are situations that can\'t wait until regular business hours: burst pipe, active flooding, sewage backup, no hot water, gas smell. We dispatch within 15 minutes of the call — 24 hours a day, 365 days a year. The owner answers emergency calls personally.' },
                { q: 'What should I do first when a pipe bursts?', a: 'Shut off the main water valve immediately — this is the single most important action. The main shutoff is usually in the basement near the foundation wall where the water line enters the house. Turn it clockwise until it stops. Then call us at (705) 700-1234.' }
            ]
        },
        {
            id: 'services',
            title: 'Services & Coverage',
            subtitle: 'What we do and where we go',
            icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
            faqs: [
                { q: 'What areas do you serve?', a: 'Our primary service area is Timmins and the immediately surrounding communities. We also serve Cochrane, South Porcupine, Iroquois Falls, Kapuskasing, Matheson, and Kirkland Lake.' },
                { q: 'Do you do gas work?', a: 'Yes — both RightFlush plumbers hold current TSSA certification for gas fitting work. We install gas appliances, extend gas lines, repair gas supply connections, and perform gas safety inspections.' }
            ]
        }
    ];

    onMount(() => {
        firePixel('page_load', 'Page Visited - FAQ', 4, 'research');
    });

    function toggleFAQ(q: string) {
        if (openItems.has(q)) {
            openItems.delete(q);
        } else {
            openItems.add(q);
            firePixel('faq_expand', 'FAQ expanded: ' + q.substring(0, 30), 5, 'research');
        }
    }

    const filteredCats = $derived(
        categories.map(cat => ({
            ...cat,
            faqs: cat.faqs.filter(f => 
                f.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                f.a.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(cat => cat.faqs.length > 0)
    );

    function handleSearch(e: Event) {
        searchTerm = (e.target as HTMLInputElement).value;
        if (searchTerm) firePixel('faq_search', 'FAQ search: ' + searchTerm, 5, 'research');
    }

    function submitStillQuestion() {
      if (!stillQuestion.trim()) return;
      captureIdentity('faq_question_submit', 'FAQ: question submitted — ContentRadar signal', 10, 'research', { phone: stillPhone });
      submitToContentRadar(stillQuestion, 'still_have_question');
      stillQuestion = '';
      stillPhone = '';
      alert('Question sent ✓');
    }
</script>

<svelte:head>
  <title>Plumbing FAQ Timmins — RightFlush Plumbing | Common Questions Answered</title>
  <meta name="description" content="Answers to the most common plumbing questions from Timmins homeowners. Pricing, emergency response, permits, water heaters, drains, and more from RightFlush Plumbing.">
</svelte:head>

<section class="faq-hero">
    <div class="faq-hero-bg"></div>
    <div class="faq-hero-grid"></div>
    <div class="faq-hero-inner">
      <div class="reveal visible">
        <div class="faq-hero-label">Frequently Asked Questions</div>
        <h1 class="faq-hero-headline">Questions Timmins<br>homeowners<br><em>actually ask.</em></h1>
        <p class="faq-hero-sub">Answers about pricing, emergency response, licensing, permits, and how RightFlush works — written directly from the questions we hear most often.</p>
      </div>
      <div class="faq-hero-nav reveal reveal-delay-1 visible">
        {#each categories as cat (cat.id)}
          <a class="faq-cat-link" href="#{cat.id}">
            <div class="faq-cat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d={cat.icon}/></svg></div>
            <div><div class="faq-cat-name">{cat.title}</div></div>
            <span class="faq-cat-count">{cat.faqs.length} questions</span>
          </a>
        {/each}
      </div>
    </div>
</section>

<div class="faq-search">
    <div class="faq-search-inner">
      <div class="faq-search-wrap">
        <div class="faq-search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <input class="faq-search-input" type="text" placeholder="Search questions…" bind:value={searchTerm} oninput={handleSearch}>
      </div>
      {#if filteredCats.length === 0 && searchTerm}
        <span class="faq-no-result">No questions match that search.</span>
      {/if}
    </div>
</div>

<div class="faq-main">
    <div class="faq-main-inner">
      <div class="faq-categories">
        {#each filteredCats as cat (cat.id)}
          <div class="faq-cat reveal visible" id={cat.id}>
            <div class="faq-cat-header">
              <div class="faq-cat-icon-lg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d={cat.icon}/></svg></div>
              <div><div class="faq-cat-title">{cat.title}</div><div class="faq-cat-subtitle">{cat.subtitle}</div></div>
            </div>
            <div class="faq-items">
              {#each cat.faqs as faq (faq.q)}
                <div class="faq-item" class:open={openItems.has(faq.q)}>
                  <button class="faq-q" onclick={() => toggleFAQ(faq.q)}>
                    <span class="faq-q-text">{faq.q}</span>
                    <div class="faq-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg></div>
                  </button>
                  <div class="faq-a">{faq.a}</div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <div class="faq-sidebar">
        <div class="faq-sidebar-nav">
          <div class="faq-sidebar-nav-title">Jump to category</div>
          <div class="faq-sidebar-nav-links">
            {#each categories as cat (cat.id)}
              <a class="faq-sidebar-nav-link" href="#{cat.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>{cat.title}</a>
            {/each}
          </div>
        </div>
        <div class="faq-cta-card">
          <div class="faq-cta-title">Ready to book?</div>
          <div class="faq-cta-sub">Free estimate · Flat-rate pricing · Confirmed within 2 hours</div>
          <a href="/marketing-automation/contact" class="faq-cta-primary">Get a free quote</a>
          <a href="tel:7057001234" class="faq-cta-secondary">Call (705) 700-1234</a>
        </div>
        <div class="faq-still-card">
          <div class="faq-still-title">Still have a question?</div>
          <div class="faq-still-sub">Send it and we'll answer it in the FAQ.</div>
          <input
            class="faq-still-input"
            type="text"
            placeholder="Your question"
            bind:value={stillQuestion}
            onfocus={() => firePixel('faq_still_focus', 'FAQ: still question focused', 6, 'research')}
          >
          <input
            class="faq-still-input"
            type="tel"
            placeholder="Phone (optional)"
            bind:value={stillPhone}
          >
          <button class="faq-still-submit" onclick={submitStillQuestion}>Send question</button>
        </div>
      </div>
    </div>
</div>

<style>
.faq-hero{background:var(--ink);padding:72px 24px 64px;position:relative;overflow:hidden;}
.faq-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(27,94,59,0.15) 0%,transparent 55%);}
.faq-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);background-size:60px 60px;}
.faq-hero-inner{position:relative;z-index:2;max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.faq-hero-label{font-size:11px; font-weight:700; color:rgba(255,255,255,0.35); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:8px;}
.faq-hero-label::before{content:''; display:block; width:20px; height:2px; background:rgba(255,255,255,0.25);}
.faq-hero-headline{font-family:var(--cond); font-weight:900; font-size:clamp(44px,6vw,80px); line-height:0.9; text-transform:uppercase; color:#fff; margin-bottom:20px;}
.faq-hero-headline em{font-style:normal; color:var(--gold);}
.faq-hero-sub{font-size:17px; font-weight:300; color:rgba(255,255,255,0.6); line-height:1.65;}

.faq-hero-nav{display:flex;flex-direction:column;gap:10px;}
.faq-cat-link{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius);padding:14px 16px;cursor:pointer;transition:all 0.2s;text-decoration:none;}
.faq-cat-link:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.15);padding-left:20px;}
.faq-cat-icon{width:32px;height:32px;border-radius:8px;background:rgba(27,94,59,0.3);border:1px solid rgba(27,94,59,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.faq-cat-icon svg{width:16px;height:16px;stroke:#4ade80;}
.faq-cat-name{font-family:var(--cond);font-size:14px;font-weight:700;color:#fff;text-transform:uppercase;}
.faq-cat-count{font-size:12px;color:rgba(255,255,255,0.35);margin-left:auto;}

.faq-search{background:var(--surface);padding:20px 24px;border-bottom:1px solid var(--border);}
.faq-search-inner{max-width:var(--col);margin:0 auto;display:flex;align-items:center;gap:12px;}
.faq-search-wrap{flex:1;position:relative;}
.faq-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;}
.faq-search-icon svg{width:16px;height:16px;stroke:var(--text3);}
.faq-search-input{width:100%;border:1px solid var(--border);border-radius:var(--radius);padding:11px 14px 11px 42px;font-size:14px;font-family:inherit;outline:none;background:var(--white);}
.faq-no-result{font-size:13px;color:var(--text3);}

.faq-main{padding:56px 24px 80px;}
.faq-main-inner{max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 300px;gap:48px;align-items:start;}

.faq-categories{display:flex;flex-direction:column;gap:40px;}
.faq-cat{scroll-margin-top:140px;}
.faq-cat-header{display:flex;align-items:center;gap:14px;margin-bottom:16px;}
.faq-cat-icon-lg{width:44px;height:44px;border-radius:10px;background:var(--green-lt);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.faq-cat-icon-lg svg{width:24px;height:24px;stroke:var(--green);}
.faq-cat-title{font-family:var(--cond);font-weight:800;font-size:24px;color:var(--ink);text-transform:uppercase;}
.faq-cat-subtitle{font-size:13px;color:var(--text3);}

.faq-items{display:flex;flex-direction:column;gap:0;}
.faq-item{border-bottom:1px solid var(--border);}
.faq-item:first-child{border-top:1px solid var(--border);}
.faq-q{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0;cursor:pointer;width:100%;background:none;border:none;text-align:left;}
.faq-q-text{font-size:15px;font-weight:500;color:var(--text);line-height:1.4;}
.faq-chevron{width:24px;height:24px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;transition:all 0.25s;}
.faq-chevron svg{width:12px;height:12px;stroke:var(--text3);}
.faq-item.open .faq-chevron{background:var(--green);transform:rotate(180deg);}
.faq-item.open .faq-chevron svg{stroke:#fff;}
.faq-a{display:none;padding-bottom:20px;font-size:14px;color:var(--text2);line-height:1.75;}
.faq-item.open .faq-a{display:block;}

.faq-sidebar{position:sticky;top:140px;display:flex;flex-direction:column;gap:16px;}
.faq-sidebar-nav{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;}
.faq-sidebar-nav-title{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:14px;}
.faq-sidebar-nav-links{display:flex;flex-direction:column;gap:6px;}
.faq-sidebar-nav-link{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);text-decoration:none;padding:6px 0;border-bottom:1px solid var(--border);transition:color 0.2s;}
.faq-sidebar-nav-link svg{width:11px;height:11px;stroke:var(--green);}
.faq-cta-card{background:var(--green);border-radius:var(--radius);padding:24px;}
.faq-cta-title{font-family:var(--cond);font-size:18px;font-weight:700;color:#fff;text-transform:uppercase;margin-bottom:8px;}
.faq-cta-sub{font-size:13px;color:rgba(255,255,255,0.65);margin-bottom:16px;line-height:1.5;}
.faq-cta-primary{display:block;text-align:center;background:#fff;color:var(--green);font-family:var(--cond);font-weight:700;font-size:14px;text-transform:uppercase;padding:12px;border-radius:var(--radius);text-decoration:none;margin-bottom:8px;}
.faq-cta-secondary{display:block;text-align:center;background:rgba(255,255,255,0.15);color:#fff;font-size:13px;padding:10px;border-radius:var(--radius);text-decoration:none;}

.faq-still-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;}
.faq-still-title{font-family:var(--cond);font-size:14px;font-weight:700;color:var(--ink);text-transform:uppercase;margin-bottom:8px;}
.faq-still-sub{font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.5;}
.faq-still-input{width:100%;border:1px solid var(--border);border-radius:var(--radius);padding:9px 12px;font-size:13px;font-family:inherit;outline:none;margin-bottom:8px;}
.faq-still-input:focus{border-color:var(--green);}
.faq-still-submit{width:100%;background:var(--ink);color:#fff;border:none;border-radius:var(--radius);padding:11px;font-family:var(--cond);font-weight:700;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;}
.faq-still-submit:hover{background:var(--green);}

@media (max-width: 1024px) {
    .faq-hero-inner { grid-template-columns: 1fr; }
    .faq-main-inner { grid-template-columns: 1fr; }
    .faq-sidebar { position: static; }
}
</style>
