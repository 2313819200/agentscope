import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { useI18n } from '../i18n/index';

export function ChatPanel() {
  const t = useI18n().t;
  const currentChatId = useStore((s) => s.currentChatId);
  const chats = useStore((s) => s.chats);
  const messages = currentChatId ? chats[currentChatId] ?? [] : [];
  const streaming = useStore((s) => s.streaming);
  const streamContent = useStore((s) => s.streamContent);
  const sendMessage = useStore((s) => s.sendMessage);
  const selectedModelName = useStore((s) => s.selectedModelName);
  const selectedModel = useStore((s) => s.selectedModel);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const hasKey = useStore((s) => s.hasValidKey);

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || streaming) return;
    if (!hasKey(selectedModel)) {
      setActiveTab('settings');
      return;
    }
    setInput('');
    await sendMessage(content);
  };

  // 空状态
  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center select-none" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center space-y-2">
          <div className="text-4xl">🪐</div>
          <p className="text-base">{t('model.select_hint')}</p>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{t('model.configure')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scroll">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
              style={{
                background: msg.role === 'user' ? 'color-mix(in srgb, var(--accent-blue) 10%, var(--bg-overlay))' : 'var(--bg-overlay)',
                color: 'var(--text-primary)',
                border: msg.role === 'user' ? '1px solid color-mix(in srgb, var(--accent-blue) 20%, transparent)' : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-2 mb-1 text-xs" style={{ color: 'var(--text-dim)' }}>
                <span>{msg.role === 'user' ? `🧑 ${t('chat.you')}` : `🤖 ${msg.model ?? 'AI'}`}</span>
                {msg.tokenUsage && (
                  <span style={{ color: 'var(--text-dim)' }}>
                    · {msg.tokenUsage.total} {t('chat.tokens')} · ${msg.tokenUsage.totalCost?.toFixed(4)}
                  </span>
                )}
              </div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Streaming */}
        {streaming && streamContent && (
          <div className="flex justify-start msg-enter">
            <div
              className="max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words cursor-blink"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-1 text-xs" style={{ color: 'var(--text-dim)' }}>
                <span>🤖 {selectedModelName}</span>
                <span className="animate-pulse" style={{ color: 'var(--accent-green)' }}>● {t('chat.generating')}</span>
              </div>
              <div>{streamContent}</div>
            </div>
          </div>
        )}

        {/* Loading dots */}
        {streaming && !streamContent && (
          <div className="flex justify-start msg-enter">
            <div style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }} className="rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--accent-blue)', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* 输入区 */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-raised)' }}
      >
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasKey(selectedModel) ? t('chat.placeholder') : t('chat.no_key')}
            rows={1}
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
            }}
            disabled={streaming}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-blue) 50%, transparent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="shrink-0 px-4 py-3 rounded-xl transition-all text-sm font-medium"
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
              opacity: !input.trim() || streaming ? 0.3 : 1,
            }}
          >
            {t('chat.send')}
          </button>
        </div>
        <div className="mt-1 text-center text-[10px]" style={{ color: 'var(--text-dim)' }}>
          {t('chat.shortcut_hint')}
        </div>
      </div>
    </div>
  );
}
