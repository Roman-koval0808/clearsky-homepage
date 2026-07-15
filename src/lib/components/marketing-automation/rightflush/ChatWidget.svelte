<script lang="ts">
    import { firePixel } from './pixelStore.svelte';

    let isOpen = $state(false);
    let messages = $state([
        { type: 'bot', text: "Hi — I'm the RightFlush assistant. What can I help you with today?" }
    ]);
    let input = $state('');

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) firePixel('chat_open', 'AI Chat opened', 6, 'research');
    }

    function sendChat() {
        if (!input.trim()) return;
        messages = [...messages, { type: 'user', text: input }];
        firePixel('chat_question', 'AI question asked', 10, 'research');
        const q = input;
        input = '';
        
        setTimeout(() => {
            messages = [...messages, { type: 'bot', text: 'Our team will get back to you shortly. For urgent matters call (705) 700-1234.' }];
        }, 800);
    }

    function quickAsk(q: string) {
        messages = [...messages, { type: 'user', text: q }];
        firePixel('chat_question', 'AI question: ' + q.substring(0, 30), 10, 'research');
        setTimeout(() => {
            messages = [...messages, { type: 'bot', text: 'Thanks for your question. A RightFlush plumber will follow up shortly. For urgent matters call (705) 700-1234.' }];
        }, 800);
    }
</script>

<div class="chat-widget">
  {#if isOpen}
    <div class="chat-panel open">
      <div class="chat-panel-header">
        <div class="chat-header-info">
          <div class="chat-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div>
            <div class="chat-name">RightFlush Assistant</div>
            <div class="chat-status">Online now · typically replies instantly</div>
          </div>
        </div>
        <button class="chat-close" onclick={toggleChat} aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="chat-messages">
        {#each messages as msg, i (i)}
            <div class="chat-msg" class:bot={msg.type === 'bot'} class:user={msg.type === 'user'}>
                {msg.text}
            </div>
        {/each}
      </div>
      <div class="chat-quick">
        <button class="chat-quick-btn" onclick={() => quickAsk('How much does a water heater replacement cost?')}>Water heater cost</button>
        <button class="chat-quick-btn" onclick={() => quickAsk('Do you serve Cochrane?')}>Service areas</button>
        <button class="chat-quick-btn" onclick={() => quickAsk('I have a burst pipe — what do I do?')}>Emergency</button>
      </div>
      <div class="chat-input-row">
        <input class="chat-input" type="text" placeholder="Ask a question…" bind:value={input} onkeydown={(e) => e.key === 'Enter' && sendChat()}>
        <button class="chat-send" onclick={sendChat} aria-label="Send message"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </div>
    </div>
  {/if}
  <button class="chat-bubble" onclick={toggleChat} aria-label="Open chat">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </button>
</div>

<style>
.chat-widget {
  position: fixed; bottom: 24px; right: 24px; z-index: 500;
  display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
}
.chat-bubble {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--green); color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(27,94,59,0.4);
  cursor: pointer; transition: all 0.2s;
}
.chat-bubble:hover { background: var(--green-mid); transform: scale(1.05); }
.chat-bubble svg { width: 26px; height: 26px; stroke: #fff; }
.chat-panel {
  width: 320px; background: var(--white);
  border: 1px solid var(--border); border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  overflow: hidden;
}
.chat-panel.open { display: flex; flex-direction: column; animation: slideUp 0.3s ease; }
@keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.chat-panel-header {
  background: var(--green); padding: 16px 18px;
  display: flex; align-items: center; justify-content: space-between;
}
.chat-header-info { display: flex; align-items: center; gap: 10px; }
.chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.chat-avatar svg { width: 20px; height: 20px; stroke: #fff; }
.chat-name { font-size: 14px; font-weight: 600; color: #fff; }
.chat-status { font-size: 11px; color: rgba(255,255,255,0.65); }
.chat-close { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; }
.chat-close svg { width: 18px; height: 18px; stroke: currentColor; }
.chat-messages { padding: 16px; min-height: 120px; max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
.chat-msg.bot { background: var(--surface); color: var(--text); border-bottom-left-radius: 4px; align-self: flex-start; }
.chat-msg.user { background: var(--green); color: #fff; border-bottom-right-radius: 4px; align-self: flex-end; }
.chat-quick { padding: 0 16px 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.chat-quick-btn { background: var(--green-lt); border: 1px solid rgba(27,94,59,0.2); border-radius: 100px; padding: 5px 12px; font-size: 12px; color: var(--green); font-weight: 500; cursor: pointer; transition: all 0.2s; }
.chat-quick-btn:hover { background: var(--green); color: #fff; }
.chat-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); }
.chat-input { flex: 1; border: 1px solid var(--border); border-radius: 100px; padding: 8px 14px; font-size: 13px; font-family: inherit; outline: none; }
.chat-input:focus { border-color: var(--green); }
.chat-send { width: 36px; height: 36px; border-radius: 50%; background: var(--green); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
.chat-send:hover { background: var(--green-mid); }
.chat-send svg { width: 16px; height: 16px; stroke: #fff; }
</style>
