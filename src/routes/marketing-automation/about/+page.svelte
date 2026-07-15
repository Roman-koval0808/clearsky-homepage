<script lang="ts">
  import { onMount } from 'svelte';
  import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

  onMount(() => {
    firePixel('page_load', 'Page Visited - About', 4, 'comparison');
  });
</script>

<svelte:head>
  <title>About RightFlush Plumbing — Timmins, Ontario | Owner-Operated Since 2018</title>
  <meta name="description" content="RightFlush Plumbing has been serving Timmins and Northern Ontario since 2018. Owner-operated, licensed, TSSA certified. Two plumbers who know this community and this housing stock personally.">
</svelte:head>

<section class="about-hero">
  <div class="about-hero-bg"></div>
  <div class="about-hero-grid"></div>
  <div class="about-hero-inner">
    <div class="reveal">
      <div class="about-hero-label">Owner-Operated</div>
      <h1 class="about-hero-headline">Timmins Locals<br>Serving <em>Locals</em></h1>
      <p class="about-hero-sub">RightFlush isn't a massive franchise. We're a tight-knit team of licensed plumbers who live, work, and raise families right here in Timmins.</p>
      <div class="about-hero-actions">
        <a href="/marketing-automation/contact" class="about-hero-cta" onclick={() => firePixel('about_cta_contact', 'About: Contact', 5, 'active')}>Work with us</a>
        <a href="/marketing-automation/reviews" class="about-hero-cta secondary" onclick={() => firePixel('about_cta_reviews', 'About: Reviews', 5, 'comparison')}>See our reviews</a>
      </div>
    </div>
    
    <div class="about-owner-card reveal reveal-delay-2">
      <div class="about-owner-photo">
        <div class="about-owner-photo-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <div class="about-owner-photo-note">Photo coming soon</div>
        </div>
        <div class="about-owner-photo-badge">Licensed Plumber</div>
      </div>
      <div class="about-owner-body">
        <div class="about-owner-name">Dave &amp; Mike</div>
        <div class="about-owner-title">Founders &amp; Master Plumbers</div>
        <p style="font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5;">Serving Timmins, Cochrane, and Iroquois Falls since 2018.</p>
      </div>
    </div>
  </div>
</section>

<section class="section reveal reveal-delay-3">
  <div class="section-inner">
    <div class="about-inner">
      <div>
        <div class="section-label">Our Story</div>
        <h2 class="section-headline">Why we started<br>RightFlush</h2>
        <div class="about-body">
          <p>We saw a gap in the local market for a plumbing company that combined modern technology with old-school reliability. Too often, homeowners were waiting days for a callback or dealing with "surge pricing" from out-of-town companies.</p>
          <p>We built RightFlush on three simple rules: answer the phone, show up on time, and do the job right the first time. Six years and thousands of happy customers later, those rules still guide every job we take.</p>
        </div>
        <div class="about-creds">
          <div class="cred-item"><div class="cred-dot"></div>Red Seal Licensed &amp; Insured</div>
          <div class="cred-item"><div class="cred-dot"></div>TSSA Certified for Gas Work</div>
          <div class="cred-item"><div class="cred-dot"></div>100% Satisfaction Guarantee</div>
        </div>
      </div>
      <div class="about-image-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>Locally owned &amp; operated</span>
      </div>
    </div>
  </div>
</section>

<style>
/* HERO */
.about-hero{background: var(--ink); padding:80px 24px 72px; position:relative; overflow:hidden;}
.about-hero-bg{position:absolute; inset:0; background:radial-gradient(ellipse at 60% 40%,rgba(47,89,152,0.18) 0%,transparent 55%),radial-gradient(ellipse at 5% 80%,rgba(245,124,34,0.06) 0%,transparent 40%);}
.about-hero-grid{position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px); background-size:60px 60px;}
.about-hero-inner{position:relative; z-index:2; max-width:var(--col); margin:0 auto; display:grid; grid-template-columns:1fr 420px; gap:64px; align-items:center;}
.about-hero-label{font-size:11px; font-weight:700; color:rgba(255,255,255,0.35); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:8px;}
.about-hero-label::before{content:''; display:block; width:20px; height:2px; background:rgba(255,255,255,0.25);}
.about-hero-headline{font-family:var(--cond); font-weight:900; font-size:clamp(44px,6vw,80px); line-height:0.9; text-transform:uppercase; color:#fff; margin-bottom:24px;}
.about-hero-headline em{font-style:normal; color:var(--gold);}
.about-hero-sub{font-size:17px; font-weight:300; color:rgba(255,255,255,0.6); line-height:1.65; margin-bottom:36px;}
.about-hero-actions{display:flex; gap:12px; flex-wrap:wrap;}
.about-hero-cta{display:inline-flex; align-items:center; gap:8px; background:var(--green); color:#fff; font-family:var(--cond); font-weight:700; font-size:15px; letter-spacing:0.05em; text-transform:uppercase; padding:13px 24px; border-radius:var(--radius); text-decoration:none; transition:background 0.2s;}
.about-hero-cta:hover{background:var(--green-mid);}
.about-hero-cta.secondary{background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:rgba(255,255,255,0.8);}
.about-hero-cta.secondary:hover{background:rgba(255,255,255,0.14);}

/* Owner card */
.about-owner-card{background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius); overflow:hidden;}
.about-owner-photo{width:100%; aspect-ratio:4/3; background:linear-gradient(135deg,#1a3a28 0%,#2D7A52 50%,#1B5E3B 100%); display:flex; align-items:center; justify-content:center; position:relative;}
.about-owner-photo-placeholder{text-align:center;}
.about-owner-photo-placeholder svg{width:64px; height:64px; stroke:rgba(255,255,255,0.2); margin:0 auto 12px;}
.about-owner-photo-note{font-size:11px; color:rgba(255,255,255,0.2); letter-spacing:0.06em; text-transform:uppercase;}
.about-owner-photo-badge{position:absolute; bottom:14px; left:14px; background:var(--green); color:#fff; font-family:var(--cond); font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:5px 12px; border-radius:100px;}
.about-owner-body{padding:20px;}
.about-owner-name{font-family:var(--cond); font-size:22px; font-weight:800; color:#fff; text-transform:uppercase; margin-bottom:4px;}
.about-owner-title{font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:14px;}

.about-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.about-body { font-size: 17px; font-weight: 300; color: var(--text2); line-height: 1.8; margin-bottom: 32px; }
.about-body p { margin-bottom: 1.5rem; }
.about-creds { display: flex; flex-direction: column; gap: 10px; }
.cred-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text); font-weight: 400; }
.cred-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
.about-image-placeholder {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); aspect-ratio: 4/3;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
}
.about-image-placeholder svg { width: 48px; height: 48px; stroke: var(--text3); stroke-width: 1; }
.about-image-placeholder span { font-size: 12px; color: var(--text3); letter-spacing: 0.06em; text-transform: uppercase; }

@media (max-width: 1024px) {
    .about-hero-inner { grid-template-columns: 1fr; }
    .about-owner-card { max-width: 420px; }
}
@media (max-width: 768px) {
    .about-inner { grid-template-columns: 1fr; gap: 40px; }
}
</style>
