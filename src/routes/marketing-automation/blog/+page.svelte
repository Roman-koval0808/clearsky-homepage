<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, captureIdentity, submitToContentRadar } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let searchTerm = $state('');
    let activeFilter = $state('all');
    let expandedPostId = $state<number | null>(null);
    let heroQuestion = $state('');
    let postQuestion = $state('');
    let postPhone = $state('');
    let sidebarQuestion = $state('');

    type PostBlock =
      | { type: 'h3'; text: string }
      | { type: 'p'; text: string }
      | { type: 'ul'; items: { label: string; text: string }[] };

    type Post = {
      id: number;
      cat: string;
      tag: string;
      date: string;
      read: string;
      title: string;
      excerpt: string;
      body: PostBlock[];
    };

    const posts: Post[] = [
        {
            id: 0,
            cat: 'winter',
            tag: 'Winter & Cold',
            date: 'March 2026',
            read: '5 min read',
            title: 'How to prevent frozen pipes in Timmins',
            excerpt: 'Northern Ontario cold snaps can drop to −40°C. Pipes in exterior walls, crawl spaces, and garages are most at risk. Here\'s what we\'ve learned from 6 years of freeze-related calls in Timmins.',
        body: [
          { type: 'h3', text: 'Why Timmins pipes freeze' },
          {
            type: 'p',
            text: 'The housing stock in Timmins is predominantly 1950s–1980s construction. Many homes have supply lines running through exterior walls with minimal insulation — designed to a standard that did not account for decades of climate stress.'
          },
          { type: 'h3', text: 'The three most vulnerable locations' },
          {
            type: 'ul',
            items: [
              { label: 'Exterior walls.', text: 'Supply lines running through walls facing north or west are most exposed.' },
              { label: 'Under kitchen sinks on exterior walls.', text: 'Open cabinet doors on cold nights.' },
              { label: 'Crawl spaces and basements near the foundation.', text: 'Cold air infiltration is a common cause.' }
            ]
          },
          {
            type: 'p',
            text: 'Allow cold taps on exterior walls to drip slightly overnight during sustained −30°C periods. It wastes a small amount of water but costs far less than a burst pipe repair.'
          }
        ]
        },
        {
            id: 1,
            cat: 'hotwater',
            tag: 'Hot Water',
            date: 'February 2026',
            read: '4 min read',
            title: 'Tank vs tankless: which is right for a Timmins home?',
            excerpt: 'Tankless water heaters are more efficient — but they\'re not right for every situation. We break down the real cost difference and what we actually recommend.',
        body: [
          { type: 'h3', text: 'The honest comparison' },
          {
            type: 'p',
            text: 'A conventional 40–60 gallon natural gas tank costs roughly $1,200–$1,800 installed. A condensing tankless unit costs $3,200–$4,800 installed.'
          },
          {
            type: 'p',
            text: 'For a household of 2 or fewer, a tank is often the smarter choice. For a family of 3 or more, tankless delivers real long-term savings.'
          }
        ]
        },
        {
            id: 2,
            cat: 'costs',
            tag: 'Costs & Pricing',
            date: 'January 2026',
            read: '6 min read',
            title: 'What does plumbing actually cost in Timmins in 2026?',
            excerpt: 'Plumbing costs vary widely and most contractors don\'t publish pricing. We do. Real ranges for the most common jobs in Timmins.',
        body: [
          { type: 'h3', text: 'Why we publish pricing' },
          {
            type: 'p',
            text: 'Homeowners who understand what things cost make better decisions. These are real ranges based on our jobs in Timmins over the past 12 months.'
          },
          {
            type: 'ul',
            items: [
              { label: 'Dripping tap:', text: '$95–$250' },
              { label: 'Blocked drain:', text: '$150–$400' },
              { label: 'Hot water tank:', text: '$1,200–$1,800' },
              { label: 'Emergency callout:', text: '$400–$1,200+' }
            ]
          }
        ]
        }
    ];

    onMount(() => {
        firePixel('page_load', 'Page Visited - Blog', 3, 'research');
    });

    const filteredPosts = $derived(
        posts.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = activeFilter === 'all' || p.cat === activeFilter;
            return matchesSearch && matchesFilter;
        })
    );

    function openPost(id: number) {
        expandedPostId = id;
        firePixel('blog_post_open', 'Blog post opened: ' + posts[id].title.substring(0, 30), 10, 'research');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closePost() {
        expandedPostId = null;
    }

    function submitHeroQuestion() {
      if (!heroQuestion.trim()) return;
      firePixel('blog_question_submit', 'Blog question submitted — ContentRadar signal', 12, 'research');
      submitToContentRadar(heroQuestion, 'hero');
      heroQuestion = '';
      alert('Question received ✓');
    }

    function submitPostQuestion() {
      if (!postQuestion.trim()) return;
      captureIdentity('post_question_submit', 'Post follow-up question — ContentRadar signal', 12, 'research', { phone: postPhone });
      submitToContentRadar(postQuestion, 'per_post');
      postQuestion = '';
      postPhone = '';
      alert('Sent ✓');
    }

    function submitSidebarQuestion() {
      if (!sidebarQuestion.trim()) return;
      firePixel('sidebar_question_submit', 'Sidebar question submitted — ContentRadar signal', 10, 'research');
      submitToContentRadar(sidebarQuestion, 'sidebar');
      sidebarQuestion = '';
      alert('Sent ✓');
    }
</script>

<svelte:head>
  <title>Plumbing Tips &amp; Blog — RightFlush Plumbing Timmins</title>
  <meta name="description" content="Practical plumbing advice for Timmins homeowners from RightFlush Plumbing. Seasonal tips, maintenance guides, and answers to common plumbing questions in Northern Ontario.">
</svelte:head>

<div class="blog-hero">
    <div class="blog-hero-inner">
      <div>
        <div class="blog-hero-label">Plumbing Tips &amp; Blog</div>
        <h1 class="blog-hero-headline">Real answers<br>from <em>Timmins</em><br>plumbers.</h1>
        <p class="blog-hero-sub">Practical advice about the plumbing in your home — written by licensed plumbers who know the housing stock in Timmins and surrounding area.</p>
      </div>
      <div class="blog-hero-right">
        <div class="blog-hero-right-title">Have a question? Ask it.</div>
        <div class="blog-hero-right-sub">Submit your plumbing question and we'll answer it in a future post.</div>
        <textarea
          class="blog-q-textarea"
          rows="3"
          placeholder="What's your plumbing question?"
          bind:value={heroQuestion}
          onfocus={() => firePixel('blog_q_focus', 'Blog: question field focused', 6, 'research')}
        ></textarea>
        <button class="blog-q-submit" onclick={submitHeroQuestion}>Submit question</button>
      </div>
    </div>
</div>

<div class="blog-filter">
    <div class="blog-filter-inner">
      <span class="blog-filter-label">Topic</span>
      {#each [
        { id: 'all', label: 'All posts' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'winter', label: 'Winter & Cold' },
        { id: 'hotwater', label: 'Hot Water' },
        { id: 'drains', label: 'Drains' },
        { id: 'costs', label: 'Costs' }
      ] as filter (filter.id)}
        <button 
            class="blog-filter-btn" 
            class:active={activeFilter === filter.id}
            onclick={() => { activeFilter = filter.id; closePost(); firePixel('blog_filter', 'Blog: filter — ' + filter.id, 5, 'research'); }}
        >{filter.label}</button>
      {/each}
    </div>
</div>

<div class="blog-main">
    <div class="blog-main-inner">
      <div>
        {#if expandedPostId !== null}
            {@const post = posts.find(p => p.id === expandedPostId)}
            {#if post}
                <div class="blog-post-view open">
                  <button class="blog-post-back" onclick={closePost}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Back to all posts</button>
                  <div class="blog-post-tag">{post.tag}</div>
                  <h2 class="blog-post-title">{post.title}</h2>
                  <div class="blog-post-meta"><span>{post.date}</span><span>·</span><span>{post.read}</span><span>·</span><span>RightFlush Plumbing</span></div>
                  <div class="blog-post-body">
                    {#each post.body as block, i (i)}
                      {#if block.type === 'h3'}
                        <h3>{block.text}</h3>
                      {:else if block.type === 'p'}
                        <p>{block.text}</p>
                      {:else if block.type === 'ul'}
                        <ul>
                          {#each block.items as item, j (j)}
                            <li><strong>{item.label}</strong> {item.text}</li>
                          {/each}
                        </ul>
                      {/if}
                    {/each}
                  </div>
                  <div class="blog-post-footer">
                    <div class="blog-post-footer-title">Have a follow-up question?</div>
                    <div class="blog-post-q">
                      <input
                        class="blog-post-q-input"
                        type="text"
                        placeholder="Ask a question about this post"
                        bind:value={postQuestion}
                        onfocus={() => firePixel('post_q_focus', 'Post: question field focused', 6, 'research')}
                      >
                      <input
                        class="blog-post-q-input"
                        type="tel"
                        placeholder="Phone (optional)"
                        bind:value={postPhone}
                      >
                      <button class="blog-post-q-submit" onclick={submitPostQuestion}>Send question</button>
                    </div>
                  </div>
                </div>
            {/if}
        {:else}
            <div class="blog-grid">
              {#each filteredPosts as post (post.id)}
                <button type="button" class="blog-card reveal visible" onclick={() => openPost(post.id)}>
                  <div class="blog-card-img"><div class="blog-card-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div></div>
                  <div class="blog-card-body">
                    <div class="blog-card-meta"><span class="blog-card-tag">{post.tag}</span><span class="blog-card-date">{post.date}</span></div>
                    <div class="blog-card-title">{post.title}</div>
                    <p class="blog-card-excerpt">{post.excerpt}</p>
                    <div class="blog-card-cta">Read post<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
                  </div>
                </button>
              {/each}
            </div>
        {/if}
      </div>

      <div class="blog-sidebar">
        <div class="blog-cta-card">
          <div class="blog-cta-title">Need a plumber?</div>
          <div class="blog-cta-sub">Get a quote — send a photo and we'll respond within 2 hours.</div>
          <a href="/marketing-automation/contact" class="blog-cta-btn">Get a free quote</a>
        </div>
        <div class="blog-sidebar-card">
          <div class="blog-sidebar-title">Popular topics</div>
          <div class="blog-sidebar-links">
            {#each ['Winter & frozen pipes', 'Hot water systems', 'Home maintenance'] as topic (topic)}
                <div class="blog-sidebar-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{topic}</div>
            {/each}
          </div>
        </div>
        <div class="blog-sidebar-card">
          <div class="blog-sidebar-title">Ask a question</div>
          <textarea
            class="blog-q-textarea"
            rows="3"
            placeholder="What's your question?"
            bind:value={sidebarQuestion}
            onfocus={() => firePixel('sidebar_q_focus', 'Sidebar: question field focused', 6, 'research')}
          ></textarea>
          <button class="blog-q-submit" onclick={submitSidebarQuestion}>Ask</button>
        </div>
      </div>
    </div>
</div>

<style>
.blog-hero{background:var(--surface);border-bottom:1px solid var(--border);padding:64px 24px 56px;}
.blog-hero-inner{max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.blog-hero-label{font-size:11px;font-weight:700;color:var(--green);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.blog-hero-label::before{content:'';display:block;width:20px;height:2px;background:var(--green);}
.blog-hero-headline{font-family:var(--cond);font-weight:900;font-size:clamp(40px,5.5vw,70px);line-height:0.9;text-transform:uppercase;color:var(--ink);margin-bottom:20px;}
.blog-hero-headline em{font-style:normal;color:var(--green);}
.blog-hero-sub{font-size:16px;font-weight:300;color:var(--text2);line-height:1.7;}
.blog-hero-right{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:28px;}
.blog-hero-right-title{font-family:var(--cond);font-size:16px;font-weight:700;color:var(--ink);text-transform:uppercase;margin-bottom:6px;}
.blog-hero-right-sub{font-size:13px;color:var(--text3);margin-bottom:20px;line-height:1.5;}
.blog-q-textarea{width:100%;border:1px solid var(--border);border-radius:var(--radius);padding:11px 14px;font-size:14px;font-family:inherit;outline:none;resize:none;transition:border-color 0.2s;line-height:1.5;margin-bottom:8px;}
.blog-q-submit{width:100%;background:var(--green);color:#fff;border:none;border-radius:var(--radius);padding:12px;font-family:var(--cond);font-weight:700;font-size:15px;text-transform:uppercase;cursor:pointer;}

.blog-filter{background:var(--white);border-bottom:1px solid var(--border);padding:14px 24px;position:sticky;top:calc(var(--trust-h) + var(--nav-h));z-index:100;}
.blog-filter-inner{max-width:var(--col);margin:0 auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.blog-filter-label{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-right:8px;}
.blog-filter-btn{border:1.5px solid var(--border);border-radius:100px;padding:5px 14px;font-size:12px;font-weight:500;color:var(--text2);background:var(--white);cursor:pointer;transition:all 0.2s;font-family:inherit;}
.blog-filter-btn.active{border-color:var(--green);background:var(--green);color:#fff;font-weight:600;}

.blog-main{padding:56px 24px 80px;background:var(--white);}
.blog-main-inner{max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 320px;gap:48px;align-items:start;}

.blog-grid{display:flex;flex-direction:column;gap:24px;}
.blog-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:all 0.2s;cursor:pointer;display:flex;width:100%;padding:0;text-align:left;font-family:inherit;}
.blog-card:hover{border-color:var(--green);box-shadow:0 4px 20px rgba(0,0,0,0.07);transform:translateY(-2px);}
.blog-card-img{width:200px;flex-shrink:0;background:var(--surface);display:flex;align-items:center;justify-content:center;}
.blog-card-img-placeholder svg{width:28px;height:28px;stroke:var(--green);}
.blog-card-body{padding:24px;flex:1;}
.blog-card-meta{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.blog-card-tag{font-size:10px;font-weight:700;color:var(--green);background:var(--green-lt);border-radius:100px;padding:3px 10px;text-transform:uppercase;}
.blog-card-date{font-size:11px;color:var(--text3);}
.blog-card-title{font-family:var(--cond);font-size:21px;font-weight:700;color:var(--ink);text-transform:uppercase;margin-bottom:8px;}
.blog-card-excerpt{font-size:13px;color:var(--text2);line-height:1.65;margin-bottom:14px;}
.blog-card-cta{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--green);}
.blog-card-cta svg{width:14px;height:14px;stroke:currentColor;}

.blog-post-view{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:40px;}
.blog-post-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--text3);cursor:pointer;margin-bottom:24px;background:none;border:none;padding:0;font-family:inherit;}
.blog-post-tag{font-size:10px;font-weight:700;color:var(--green);background:var(--green-lt);border-radius:100px;padding:4px 12px;text-transform:uppercase;margin-bottom:14px;display:inline-block;}
.blog-post-title{font-family:var(--cond);font-weight:800;font-size:clamp(28px,3.5vw,44px);color:var(--ink);text-transform:uppercase;margin-bottom:16px;}
.blog-post-meta{display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text3);padding-bottom:20px;border-bottom:1px solid var(--border);margin-bottom:24px;}
.blog-post-body{font-size:15px;color:var(--text2);line-height:1.8;}
:global(.blog-post-body h3){font-family:var(--cond);font-size:20px;font-weight:700;color:var(--ink);text-transform:uppercase;margin:24px 0 10px;}
:global(.blog-post-body p){margin-bottom:14px;}
:global(.blog-post-body ul){padding-left:20px;margin-bottom:14px;}
:global(.blog-post-body li){margin-bottom:6px;}

.blog-sidebar{position:sticky;top:140px;display:flex;flex-direction:column;gap:20px;}
.blog-sidebar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;}
.blog-sidebar-title{font-family:var(--cond);font-size:14px;font-weight:700;color:var(--ink);text-transform:uppercase;margin-bottom:16px;}
.blog-sidebar-links{display:flex;flex-direction:column;gap:8px;}
.blog-sidebar-link{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);cursor:pointer;}
.blog-sidebar-link svg{width:12px;height:12px;stroke:var(--green);}
.blog-cta-card{background:var(--ink);border-radius:var(--radius);padding:24px;}
.blog-cta-title{font-family:var(--cond);font-size:18px;font-weight:700;color:#fff;text-transform:uppercase;margin-bottom:8px;}
.blog-cta-sub{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:16px;line-height:1.5;}
.blog-cta-btn{display:block;text-align:center;background:var(--green);color:#fff;font-family:var(--cond);font-weight:700;font-size:14px;text-transform:uppercase;padding:12px;border-radius:var(--radius);text-decoration:none;}

@media (max-width: 1024px) {
    .blog-hero-inner { grid-template-columns: 1fr; }
    .blog-main-inner { grid-template-columns: 1fr; }
    .blog-sidebar { position: static; }
}
@media (max-width: 768px) {
    .blog-card { flex-direction: column; }
    .blog-card-img { width: 100%; height: 160px; }
}
</style>
