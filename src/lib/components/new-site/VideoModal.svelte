<script lang="ts">
  import { browser } from '$app/environment';

  interface Props {
    open: boolean;
    videoId: string;
  }

  let { open = $bindable(false), videoId }: Props = $props();

  function closeDialog() {
    open = false;
  }

  $effect(() => {
    if (open && browser) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeDialog();
      };
      window.addEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.documentElement.style.overflow = '';
      };
    }
  });

  // Portal action — moves node directly into <body> to bypass any parent overflow/transform
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    };
  }

  const embedUrl = $derived(
    open ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : ''
  );
</script>

{#if open && browser}
  <div use:portal>
    <!-- Backdrop -->
    <div
      onclick={closeDialog}
      style="
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.75);
        
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <!-- Video panel — stop click propagation so clicking it doesn't close the modal -->
      <div
        onclick={(e) => e.stopPropagation()}
        style="
          position: relative;
          width: min(88vw, 960px);
          aspect-ratio: 16 / 9;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08);
          animation: modalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        "
      >
        <!-- Close button -->
        <button
          onclick={closeDialog}
          aria-label="Close video"
          style="
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.12);
            border: none;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            transition: background 0.2s ease;
          "
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- YouTube iframe -->
        <iframe
          src={embedUrl}
          title="ClearSky Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: none;
            display: block;
          "
        ></iframe>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(12px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
