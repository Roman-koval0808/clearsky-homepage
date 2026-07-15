<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, captureIdentity } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let fjNote = $state('');
    let fjName = $state('');
    let fjPhone = $state('');
    let fjHasPhoto = $state(false);
    let fjPreviewSrc = $state('');
    let selectedChips = $state(['Hot water system']);

    let formName = $state('');
    let formPhone = $state('');
    let formEmail = $state('');
    let formMessage = $state('');

    let aptName = $state('');
    let aptPhone = $state('');
    let aptDay = $state('Any weekday');
    let aptTime = $state('Any time');
    let aptAddress = $state('');

    let openFaqIndex = $state(0);

    onMount(() => {
        firePixel('page_load', 'Page Visited - Contact/Quote', 6, 'active');
    });

    function scrollToSection(id: string) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function handleFJFile(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                fjPreviewSrc = ev.target?.result as string;
                fjHasPhoto = true;
                firePixel('fj_photo_upload', 'FotoJobber: photo uploaded', 10, 'active');
            };
            reader.readAsDataURL(file);
        }
    }

    function toggleFJChip(chip: string) {
        if (selectedChips.includes(chip)) {
            selectedChips = selectedChips.filter(c => c !== chip);
        } else {
            selectedChips = [...selectedChips, chip];
        }
        firePixel('fj_service_select', 'FotoJobber: service selected', 3, 'active');
    }

    function submitFJ() {
        if (!fjName || !fjPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        captureIdentity('fj_submit', 'FotoJobber: submitted', 15, 'active', { phone: fjPhone, name: fjName });
        alert('Received — quote within 2 hours');
    }

    function submitForm() {
        if (!formName || !formPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        captureIdentity('form_submit', 'Contact form submitted', 20, 'active', { phone: formPhone, email: formEmail, name: formName });
        alert('Message sent — we\'ll call you back ✓');
    }

    function submitApt() {
        if (!aptName || !aptPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        captureIdentity('apt_submit', 'Appointment: booked', 20, 'active', { phone: aptPhone, name: aptName });
        alert('Booked — confirmed within 2 hours ✓');
    }

    function toggleFAQ(index: number) {
        openFaqIndex = openFaqIndex === index ? -1 : index;
        firePixel('faq_click', 'FAQ expanded', 3, 'research');
    }
</script>

<svelte:head>
  <title>Get a Quote — RightFlush Plumbing Timmins | Free Estimates</title>
  <meta name="description" content="Get a free quote from RightFlush Plumbing in Timmins. Send a photo for a fast estimate, book an on-site visit, or call (705) 700-1234. Flat-rate pricing — no surprises.">
</svelte:head>

<div class="cq-hero">
    <div class="cq-hero-inner">
      <div>
        <div class="cq-hero-label">Contact &amp; Quote</div>
        <h1 class="cq-hero-headline">Get a price.<br><em>Your way.</em></h1>
        <p class="cq-hero-sub">Send a photo for a fast remote quote, book an on-site estimate, call us directly, or drop a message below. Pick whichever works for you — we respond to all of them.</p>
      </div>
      <div class="cq-routes">
        <button class="cq-route primary" onclick={() => scrollToSection('fjSection')}>
          <div class="cq-route-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
          <div class="cq-route-text">
            <div class="cq-route-name">Send a photo — FotoJobber</div>
            <div class="cq-route-desc">Photo + annotation → quote within 2 hours. No visit needed.</div>
          </div>
          <div class="cq-route-tag">Fastest</div>
          <div class="cq-route-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </button>
        <button class="cq-route" onclick={() => scrollToSection('aptSection')}>
          <div class="cq-route-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="cq-route-text">
            <div class="cq-route-name">Book an on-site estimate</div>
            <div class="cq-route-desc">A licensed plumber visits and gives you a flat-rate price. Free.</div>
          </div>
          <div class="cq-route-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </button>
        <a href="tel:7057001234" class="cq-route" onclick={() => firePixel('call_click_hero', 'Call: hero route', 15, 'active')}>
          <div class="cq-route-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg></div>
          <div class="cq-route-text">
            <div class="cq-route-name">Call (705) 700-1234</div>
            <div class="cq-route-desc">We pick up. No voicemail, no call centre. 24/7 for emergencies.</div>
          </div>
          <div class="cq-route-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </a>
        <button class="cq-route" onclick={() => scrollToSection('textFormSection')}>
          <div class="cq-route-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="cq-route-text">
            <div class="cq-route-name">Send a message</div>
            <div class="cq-route-desc">Name, number, and what you need — we'll call you back.</div>
          </div>
          <div class="cq-route-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </button>
      </div>
    </div>
</div>

<div class="cq-main">
    <div class="cq-main-inner">
      <div class="cq-tools">
        <div class="cq-fj reveal visible" id="fjSection">
          <div class="cq-fj-header">
            <div class="cq-fj-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
            <div class="cq-fj-title-wrap">
              <div class="cq-fj-title">FotoJobber — Send a photo</div>
              <div class="cq-fj-subtitle">Annotated photo → accurate quote within 2 hours</div>
            </div>
            <div class="cq-fj-badge">Recommended</div>
          </div>
          <div class="cq-fj-body">
            <div class="fj-upload-area" class:has-photo={fjHasPhoto}>
              {#if !fjHasPhoto}
                <div class="fj-upload-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
                <div class="fj-upload-title">Take or upload a photo</div>
                <div class="fj-upload-sub">Show us exactly what needs attention</div>
                <div class="fj-upload-actions">
                    <label class="fj-upload-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Choose from library
                        <input type="file" class="fj-file-input" accept="image/*" onchange={handleFJFile}>
                    </label>
                    <label class="fj-camera-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        Take a photo
                        <input type="file" class="fj-file-input" accept="image/*" capture="environment" onchange={handleFJFile}>
                    </label>
                </div>
              {:else}
                <img class="fj-photo-preview" src={fjPreviewSrc} alt="Preview">
                <div class="fj-photo-overlay">
                  <div class="fj-photo-status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Photo ready</div>
                  <label class="fj-change-link">Change<input type="file" class="fj-file-input" accept="image/*" onchange={handleFJFile}></label>
                </div>
              {/if}
            </div>

            <div class="fj-annotation">
              <label class="fj-annotation-label">What do you need done?</label>
              <textarea class="fj-annotation-input" bind:value={fjNote} rows="3" placeholder="e.g. &quot;Tap dripping — cold side only, under the sink&quot;"></textarea>
            </div>

            <label class="fj-service-label">Service type</label>
            <div class="fj-service-chips">
              {#each ['Dripping tap', 'Blocked drain', 'Burst / leaking pipe', 'Hot water system', 'Bathroom renovation', 'Gas fitting', 'Water filtration', 'Other'] as chip}
                <button 
                    class="fj-chip" 
                    class:selected={selectedChips.includes(chip)} 
                    onclick={() => toggleFJChip(chip)}
                >{chip}</button>
              {/each}
            </div>

            <div class="fj-contact">
              <input class="fj-contact-input" type="text" placeholder="Your name" bind:value={fjName}>
              <input class="fj-contact-input" type="tel" placeholder="Phone — (705) 000-0000" bind:value={fjPhone}>
            </div>

            <button class="fj-submit-btn" onclick={submitFJ}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send for quote
            </button>
            <div class="fj-submit-note">We review every submission and reply within 2 hours during business hours.</div>
          </div>
        </div>

        <div class="cq-divider reveal visible">
          <div class="cq-divider-line"></div>
          <div class="cq-divider-text">Or send a message instead</div>
          <div class="cq-divider-line"></div>
        </div>

        <div class="cq-text-form reveal visible" id="textFormSection">
          <div class="cq-text-form-title">Send a message</div>
          <div class="cq-row">
            <div class="cq-field">
              <label class="cq-label">Name</label>
              <input class="cq-input" type="text" placeholder="First and last name" bind:value={formName}>
            </div>
            <div class="cq-field">
              <label class="cq-label">Phone</label>
              <input class="cq-input" type="tel" placeholder="(705) 000-0000" bind:value={formPhone}>
            </div>
          </div>
          <div class="cq-field">
            <label class="cq-label">Email (optional)</label>
            <input class="cq-input" type="email" placeholder="your@email.com" bind:value={formEmail}>
          </div>
          <div class="cq-field">
            <label class="cq-label">What do you need?</label>
            <textarea class="cq-textarea" bind:value={formMessage} rows="4" placeholder="Describe the job or issue..."></textarea>
          </div>
          <button class="cq-submit" onclick={submitForm}>Send message</button>
        </div>
      </div>

      <div class="cq-sidebar reveal reveal-delay-1 visible">
        <div class="cq-call-card">
          <div class="cq-call-label">Prefer to call?</div>
          <a href="tel:7057001234" class="cq-call-number" onclick={() => firePixel('call_click_sidebar', 'Call: sidebar', 15, 'active')}>(705) 700-1234</a>
          <div class="cq-call-sub">A licensed plumber answers — not a call centre</div>
          <a href="tel:7057001234" class="cq-call-btn">Call now</a>
          <div class="cq-call-divider"></div>
          <div class="cq-availability">
            <div class="cq-avail-dot"></div>
            Available now · 24/7 for emergencies
          </div>
        </div>

        <div class="cq-apt-card" id="aptSection">
          <div class="cq-apt-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="cq-apt-header-text">Book on-site estimate</span>
          </div>
          <div class="cq-apt-body">
            <div class="cq-apt-field">
              <label class="cq-apt-label">Name</label>
              <input class="cq-apt-input" type="text" placeholder="Your name" bind:value={aptName}>
            </div>
            <div class="cq-apt-row">
              <div class="cq-apt-field">
                <label class="cq-apt-label">Phone</label>
                <input class="cq-apt-input" type="tel" placeholder="(705) 000-0000" bind:value={aptPhone}>
              </div>
              <div class="cq-apt-field">
                <label class="cq-apt-label">Preferred day</label>
                <select class="cq-apt-select" bind:value={aptDay}>
                  <option>Any weekday</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                </select>
              </div>
            </div>
            <div class="cq-apt-field">
              <label class="cq-apt-label">Preferred time</label>
              <select class="cq-apt-select" bind:value={aptTime}>
                <option>Any time</option>
                <option>Morning (8am–12pm)</option>
                <option>Afternoon (12pm–4pm)</option>
                <option>Late afternoon (4pm–6pm)</option>
              </select>
            </div>
            <div class="cq-apt-field">
              <label class="cq-apt-label">Address</label>
              <input class="cq-apt-input" type="text" placeholder="Timmins or surrounding area" bind:value={aptAddress}>
            </div>
            <button class="cq-apt-submit" onclick={submitApt}>Book free estimate</button>
            <div class="cq-apt-note">Confirmed within 2 hours · Free · No obligation</div>
          </div>
        </div>
      </div>
    </div>
</div>

<div class="cq-promise">
    <div class="cq-promise-inner">
      <div class="cq-promise-item">
        <div class="cq-promise-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
        <div>
          <div class="cq-promise-headline">FotoJobber quote in 2 hours</div>
          <div class="cq-promise-sub">Submit a photo during business hours and a licensed plumber responds with a quote within 2 hours.</div>
        </div>
      </div>
      <div class="cq-promise-item">
        <div class="cq-promise-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div>
          <div class="cq-promise-headline">Estimate confirmed same day</div>
          <div class="cq-promise-sub">On-site estimate requests are confirmed by phone within 2 hours during business hours.</div>
        </div>
      </div>
      <div class="cq-promise-item">
        <div class="cq-promise-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg></div>
        <div>
          <div class="cq-promise-headline">15-minute emergency response</div>
          <div class="cq-promise-sub">Burst pipe, no hot water — call (705) 700-1234 and a plumber is dispatched within 15 minutes.</div>
        </div>
      </div>
    </div>
</div>

<section class="cq-faq">
    <div class="cq-faq-inner">
      <div class="reveal visible">
        <div class="cq-faq-label">FAQ</div>
        <h2 class="cq-faq-headline">Common questions<br>before contacting us.</h2>
      </div>
      <div class="cq-faq-items reveal reveal-delay-1 visible">
        {#each [
            { q: 'Do you charge for estimates?', a: 'Free estimates on all jobs over $500. For smaller jobs, we can usually quote over the phone or via FotoJobber without a visit.' },
            { q: 'How does flat-rate pricing work?', a: 'Before any work starts, we quote the full job as a single flat price. No hourly rate, no hidden add-ons.' },
            { q: 'How fast will I get a response?', a: 'FotoJobber quotes within 2 hours. Appointments confirmed same day. Emergencies dispatched within 15 minutes.' }
        ] as faq, i}
          <div class="cq-faq-item" class:open={openFaqIndex === i}>
            <button class="cq-faq-q" onclick={() => toggleFAQ(i)}>
              <span class="cq-faq-q-text">{faq.q}</span>
              <div class="cq-faq-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg></div>
            </button>
            <div class="cq-faq-a">{faq.a}</div>
          </div>
        {/each}
      </div>
    </div>
</section>

<style>
.cq-hero { background: var(--surface); border-bottom: 1px solid var(--border); padding: 56px 24px 48px; }
.cq-hero-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.cq-hero-label { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--green); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
.cq-hero-label::before { content: ''; display: block; width: 20px; height: 2px; background: var(--green); }
.cq-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(40px, 5.5vw, 72px); line-height: 0.9; text-transform: uppercase; color: var(--ink); margin-bottom: 20px; }
.cq-hero-headline em { font-style: normal; color: var(--green); }
.cq-hero-sub { font-size: 16px; font-weight: 300; color: var(--text2); line-height: 1.7; max-width: 440px; }

.cq-routes { display: flex; flex-direction: column; gap: 12px; }
.cq-route {
  display: flex; align-items: center; gap: 16px;
  background: var(--white); border: 2px solid var(--border);
  border-radius: var(--radius); padding: 18px 20px;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
  text-align: left; width: 100%;
}
.cq-route:hover { border-color: var(--green); box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }
.cq-route.primary { border-color: var(--green); background: var(--green-lt); }
.cq-route-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--surface); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s; }
.cq-route.primary .cq-route-icon { background: rgba(47,89,152,0.15); }
.cq-route-icon svg { width: 22px; height: 22px; stroke: var(--green); }
.cq-route-text { flex: 1; }
.cq-route-name { font-family: var(--cond); font-size: 17px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 3px; }
.cq-route-desc { font-size: 12px; color: var(--text3); line-height: 1.4; }
.cq-route-tag { font-size: 10px; font-weight: 700; color: var(--green); background: rgba(47,89,152,0.1); border-radius: 100px; padding: 3px 10px; letter-spacing: 0.06em; text-transform: uppercase; flex-shrink: 0; }
.cq-route-arrow svg { width: 16px; height: 16px; stroke: var(--text3); }

.cq-main { padding: 64px 24px; background: var(--white); }
.cq-main-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 380px; gap: 48px; align-items: start; }
.cq-tools { display: flex; flex-direction: column; gap: 40px; }

.cq-fj { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
.cq-fj-header { background: var(--ink); padding: 20px 24px; display: flex; align-items: center; gap: 14px; }
.cq-fj-icon { width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cq-fj-icon svg { width: 20px; height: 20px; stroke: #fff; }
.cq-fj-title-wrap { flex: 1; }
.cq-fj-title { font-family: var(--cond); font-size: 18px; font-weight: 700; color: #fff; text-transform: uppercase; }
.cq-fj-subtitle { font-size: 12px; color: rgba(255,255,255,0.5); }
.cq-fj-badge { background: var(--gold); color: var(--ink); font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 100px; letter-spacing: 0.06em; text-transform: uppercase; }
.cq-fj-body { padding: 28px; }

.fj-upload-area { border: 2px dashed var(--border); border-radius: var(--radius); min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px 24px; text-align: center; }
.fj-upload-area.has-photo { border-style: solid; border-color: var(--green); padding: 0; }
.fj-upload-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--surface); display: flex; align-items: center; justify-content: center; }
.fj-upload-icon svg { width: 26px; height: 26px; stroke: var(--green); }
.fj-upload-title { font-family: var(--cond); font-weight: 700; font-size: 18px; color: var(--ink); text-transform: uppercase; }
.fj-upload-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.fj-upload-btn { background: var(--green); color: #fff; font-family: var(--cond); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 10px 20px; border-radius: var(--radius); cursor: pointer; display: flex; align-items: center; gap: 6px; }
.fj-camera-btn { background: var(--surface); color: var(--text2); border: 1px solid var(--border); font-size: 13px; font-weight: 500; padding: 10px 18px; border-radius: var(--radius); cursor: pointer; display: flex; align-items: center; gap: 6px; }
.fj-file-input { display: none; }
.fj-photo-preview { width: 100%; max-height: 280px; object-fit: cover; }
.fj-photo-overlay { padding: 12px 16px; background: var(--green-lt); border-top: 1px solid rgba(47,89,152,0.15); display: flex; align-items: center; justify-content: space-between; }
.fj-photo-status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--green); font-weight: 500; }
.fj-change-link { font-size: 12px; color: var(--text3); cursor: pointer; text-decoration: underline; }

.fj-annotation { margin-bottom: 16px; }
.fj-annotation-label { font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; display: block; }
.fj-annotation-input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; font-size: 14px; font-family: inherit; outline: none; resize: none; transition: border-color 0.2s; }
.fj-service-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.fj-chip { border: 1.5px solid var(--border); border-radius: 100px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: var(--text); cursor: pointer; transition: all 0.2s; background: none; }
.fj-chip.selected { border-color: var(--green); color: var(--green); background: var(--green-lt); font-weight: 600; }
.fj-contact { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.fj-contact-input { border: 1px solid var(--border); border-radius: var(--radius); padding: 11px 14px; font-size: 14px; font-family: inherit; outline: none; }
.fj-submit-btn { width: 100%; background: var(--green); color: #fff; border: none; border-radius: var(--radius); padding: 15px; font-family: var(--cond); font-weight: 700; font-size: 17px; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

.cq-divider { display: flex; align-items: center; gap: 16px; }
.cq-divider-line { flex: 1; height: 1px; background: var(--border); }
.cq-divider-text { font-size: 12px; color: var(--text3); font-weight: 500; }

.cq-text-form { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
.cq-text-form-title { font-family: var(--cond); font-size: 18px; font-weight: 700; color: var(--ink); text-transform: uppercase; margin-bottom: 20px; }
.cq-field { margin-bottom: 14px; }
.cq-label { font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; display: block; }
.cq-input, .cq-textarea { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 11px 14px; font-size: 14px; font-family: inherit; outline: none; background: var(--white); }
.cq-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cq-submit { width: 100%; background: var(--ink); color: #fff; border: none; border-radius: var(--radius); padding: 14px; font-family: var(--cond); font-weight: 700; font-size: 16px; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; }

.cq-sidebar { position: sticky; top: calc(var(--trust-h) + var(--nav-h) + 24px); display: flex; flex-direction: column; gap: 16px; }
.cq-call-card { background: var(--ink); border-radius: 12px; padding: 24px; }
.cq-call-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
.cq-call-number { font-family: var(--cond); font-size: 32px; font-weight: 900; color: var(--gold); display: block; margin-bottom: 4px; text-decoration: none; }
.cq-call-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
.cq-call-btn { display: block; text-align: center; background: var(--rust); color: #fff; font-family: var(--cond); font-weight: 700; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase; padding: 13px; border-radius: var(--radius); text-decoration: none; }
.cq-call-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 16px 0; }
.cq-availability { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.4); }
.cq-avail-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

.cq-apt-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.cq-apt-header { background: var(--green); padding: 16px 20px; display: flex; align-items: center; gap: 10px; }
.cq-apt-header-text { font-family: var(--cond); font-size: 15px; font-weight: 700; color: #fff; text-transform: uppercase; }
.cq-apt-body { padding: 20px; }
.cq-apt-label { font-size: 10px; font-weight: 700; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 5px; display: block; }
.cq-apt-input, .cq-apt-select { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; font-size: 13px; font-family: inherit; outline: none; background: var(--surface); }
.cq-apt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.cq-apt-submit { width: 100%; background: var(--green); color: #fff; border: none; border-radius: var(--radius); padding: 12px; font-family: var(--cond); font-weight: 700; font-size: 15px; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; margin-top: 4px; }

.cq-promise { background: var(--green); padding: 36px 24px; }
.cq-promise-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.cq-promise-item { padding: 0 32px; border-right: 1px solid rgba(255,255,255,0.15); text-align: center; }
.cq-promise-item:last-child { border-right: none; }
.cq-promise-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.cq-promise-icon svg { width: 22px; height: 22px; stroke: #fff; }
.cq-promise-headline { font-family: var(--cond); font-size: 18px; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 6px; }
.cq-promise-sub { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; }

.cq-faq { background: var(--surface); padding: 72px 24px; }
.cq-faq-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
.cq-faq-label { font-size: 11px; font-weight: 700; color: var(--green); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.cq-faq-label::before { content: ''; display: block; width: 20px; height: 2px; background: var(--green); }
.cq-faq-headline { font-family: var(--cond); font-weight: 800; font-size: clamp(32px, 4vw, 48px); line-height: 0.95; text-transform: uppercase; color: var(--ink); }
.cq-faq-item { border-bottom: 1px solid var(--border); }
.cq-faq-q { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0; cursor: pointer; width: 100%; background: none; border: none; }
.cq-faq-q-text { font-family: var(--cond); font-size: 16px; font-weight: 700; color: var(--ink); text-transform: uppercase; text-align: left; }
.cq-faq-chevron { width: 20px; height: 20px; border-radius: 50%; background: var(--green-lt); display: flex; align-items: center; justify-content: center; transition: transform 0.25s; }
.cq-faq-chevron svg { width: 12px; height: 12px; stroke: var(--green); }
.cq-faq-item.open .cq-faq-chevron { transform: rotate(180deg); background: var(--green); }
.cq-faq-item.open .cq-faq-chevron svg { stroke: #fff; }
.cq-faq-a { display: none; padding-bottom: 16px; font-size: 14px; color: var(--text2); line-height: 1.7; text-align: left; }
.cq-faq-item.open .cq-faq-a { display: block; }

@media (max-width: 1024px) {
  .cq-hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .cq-main-inner { grid-template-columns: 1fr; }
  .cq-sidebar { position: static; }
  .cq-promise-inner { grid-template-columns: 1fr; gap: 24px; }
  .cq-promise-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.15); padding: 0 0 24px; text-align: left; display: flex; align-items: flex-start; gap: 16px; }
  .cq-faq-inner { grid-template-columns: 1fr; }
}
</style>
