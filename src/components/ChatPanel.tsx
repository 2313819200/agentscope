import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { generateId } from '../providers/index';

export function ChatPanel() {
  const currentChatId = useStore((s) => s.currentChatId);
  const chats = useStore((s) => s.chats);
  const messages = currentChatId ? chats[currentChatId] ?? [] : [];
  const streaming = useStore((s) => s.streaming);
  const streamContent = useStore((s) => s.streamContent);
  const sendMessage = useStore((s) => s.sendMessage);
  const selectedModelName = useStore((s) => s.selectedModelName);
  const selectedModel = useStore((s) => s.selectedModel);
  const apiKeys = useStore((s) => s.apiKeys);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const hasKey = useStore((s) => s.hasValidKey);

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  // Ctrl+Enter / Cmd+Enter 发送
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
      <div className="flex-1 flex items-center justify-center text-gray-500 select-none">
        <div className="text-center space-y-3">
          <div className="text-4xl">🪐</div>
          <p className="text-lg">Select a model to start</p>
          <p className="text-sm">Choose from the sidebar or press Settings to configure API keys</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scroll">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`msg-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-accent-blue/10 text-gray-100 border border-accent-blue/20'
                  : 'bg-surface-overlay text-gray-200 border border-gray-800/50'
              }`}
            >
              {/* 角色标签 */}
              <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500">
                <span>{msg.role === 'user' ? '🧑 You' : `🤖 ${msg.model ?? 'AI'}`}</span>
                {msg.tokenUsage && (
                  <span className="text-gray-600">
                    · {msg.tokenUsage.total} tokens · ${msg.tokenUsage.totalCost?.toFixed(4)}
                  </span>
                )}
              </div>

              {/* 内容 */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* 当前正在 streaming 的消息 */}
        {streaming && streamContent && (
          <div className="flex justify-start msg-enter">
            <div className="max-w-[75%] rounded-xl px-4 py-3 bg-surface-overlay text-gray-200 border border-gray-800/50">
              <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500">
                <span>🤖 {selectedModelName}</span>
                <span className="text-accent-green animate-pulse">● generating</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words cursor-blink">
                {streamContent}
              </div>
            </div>
          </div>
        )}

        {/* 空白占位 */}
        {streaming && !streamContent && (
          <div className="flex justify-start msg-enter">
            <div className="bg-surface-overlay border border-gray-800/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* 输入区 */}
      <div className="shrink-0 border-t border-gray-800/50 bg-surface-raised px-4 py-3">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasKey(selectedModel)
                ? `Message ${selectedModelName}... (Ctrl+Enter to send)`
                : '⚠️ Set API key in Settings first'
            }
            rows={1}
            className="flex-1 bg-surface-overlay border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-accent-blue/50 resize-none transition-colors"
            disabled={streaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="shrink-0 px-4 py-3 bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all text-sm font-medium"
          >
            {streaming ? '...' : 'Send'}
          </button>
        </div>
        <div className="mt-1 text-center text-[10px] text-gray-600">
          Ctrl+Enter to send · Tokens are counted live
        </div>
      </div>
    </div>
  );
}
