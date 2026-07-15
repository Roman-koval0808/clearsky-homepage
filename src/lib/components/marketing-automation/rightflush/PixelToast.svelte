<script lang="ts">
    import { pixelStore } from './pixelStore.svelte';
</script>

{#if pixelStore.toast.show}
    <div class="pixel-toast show">
      <div class="pixel-toast-dot"></div>
      <span>{pixelStore.toast.text}</span>
    </div>
{/if}

<style>
.pixel-toast {
  position: fixed; bottom: 24px; left: 24px; z-index: 600;
  background: var(--ink); color: #fff;
  font-family: var(--cond); font-size: 12px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 10px 16px; border-radius: var(--radius);
  display: flex; align-items: center; gap: 8px;
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none; max-width: 280px;
}
.pixel-toast.show { opacity: 1; transform: translateY(0); }
.pixel-toast-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 1.2s infinite; flex-shrink: 0; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
</style>
