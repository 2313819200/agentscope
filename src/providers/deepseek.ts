import type { ModelProvider } from './index';
import type { StreamChunk, ChatRequest } from '../types';
import { AVAILABLE_MODELS } from './index';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const deepseekProvider: ModelProvider = {
  id: 'deepseek',
  config: AVAILABLE_MODELS.find((m) => m.id === 'deepseek')!,

  validateKey(key: string) {
    return key.length > 8;
  },

  estimateCost(usage: { input: number; output: number }) {
    // DeepSeek Chat: $0.27/M input, $1.10/M output
    const inputCost = (usage.input / 1_000_000) * 0.27;
    const outputCost = (usage.output / 1_000_000) * 1.1;
    return {
      inputCost: +inputCost.toFixed(6),
      outputCost: +outputCost.toFixed(6),
      totalCost: +(inputCost + outputCost).toFixed(6),
    };
  },

  async *chat(req: ChatRequest, apiKey: string) {
    const body = {
      model: req.model,
      messages: req.messages,
      stream: true,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 4096,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      yield { type: 'error', content: `DeepSeek Error (${response.status}): ${err}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) return;

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
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          yield { type: 'done', content: '' };
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            yield { type: 'text', content: delta.content };
          }
          // DeepSeek reasoning content
          if (delta?.reasoning_content) {
            yield { type: 'thinking', content: delta.reasoning_content };
          }
          if (parsed.usage) {
            yield { type: 'done', content: '', metadata: { usage: parsed.usage } };
          }
        } catch {
          // skip parse errors
        }
      }
    }
  },
};
