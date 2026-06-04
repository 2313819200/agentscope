import type { ModelProvider } from './index';
import type { StreamChunk, ChatRequest } from '../types';
import { AVAILABLE_MODELS } from './index';

const API_URL = 'https://api.anthropic.com/v1/messages';

export const claudeProvider: ModelProvider = {
  id: 'claude',
  config: AVAILABLE_MODELS.find((m) => m.id === 'claude')!,

  validateKey(key: string) {
    return key.startsWith('sk-ant-') && key.length > 20;
  },

  estimateCost(usage: { input: number; output: number }) {
    // Claude Sonnet 4: $3/M input, $15/M output
    const inputCost = (usage.input / 1_000_000) * 3;
    const outputCost = (usage.output / 1_000_000) * 15;
    return {
      inputCost: +inputCost.toFixed(6),
      outputCost: +outputCost.toFixed(6),
      totalCost: +(inputCost + outputCost).toFixed(6),
    };
  },

  async *chat(req: ChatRequest, apiKey: string) {
    const body = {
      model: req.model,
      max_tokens: req.maxTokens ?? 4096,
      system: req.system,
      messages: req.messages.filter((m) => m.role !== 'system'),
      stream: true,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      yield { type: 'error', content: `Claude API Error (${response.status}): ${err}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', content: 'No response stream' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield { type: 'text', content: parsed.delta.text };
            } else if (parsed.type === 'thinking_delta' && parsed.delta?.thinking) {
              yield { type: 'thinking', content: parsed.delta.thinking };
            } else if (parsed.type === 'message_delta') {
              if (parsed.usage) {
                yield {
                  type: 'done',
                  content: '',
                  metadata: { usage: parsed.usage },
                };
              }
            }
          } catch {
            // parse error, skip malformed json
          }
        }
      }
    }

    yield { type: 'done', content: '' };
  },
};
