import type { ModelProvider } from './index';
import type { StreamChunk, ChatRequest } from '../types';
import { AVAILABLE_MODELS } from './index';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const geminiProvider: ModelProvider = {
  id: 'gemini',
  config: AVAILABLE_MODELS.find((m) => m.id === 'gemini')!,

  validateKey(key: string) {
    return key.length > 8;
  },

  estimateCost(usage: { input: number; output: number }) {
    // Gemini 2.0 Flash: $0.10/M input, $0.40/M output
    const inputCost = (usage.input / 1_000_000) * 0.1;
    const outputCost = (usage.output / 1_000_000) * 0.4;
    return {
      inputCost: +inputCost.toFixed(6),
      outputCost: +outputCost.toFixed(6),
      totalCost: +(inputCost + outputCost).toFixed(6),
    };
  },

  async *chat(req: ChatRequest, apiKey: string) {
    const url = `${BASE}/models/${req.model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const body = {
      system_instruction: req.system
        ? { parts: [{ text: req.system }] }
        : undefined,
      contents: req.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens ?? 4096,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      yield { type: 'error', content: `Gemini Error (${response.status}): ${err}` };
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
        if (!data || data === '{}') continue;

        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            yield { type: 'text', content: text };
          }
          const usage = parsed.usageMetadata;
          if (usage) {
            yield {
              type: 'done',
              content: '',
              metadata: {
                usage: {
                  input: usage.promptTokenCount ?? 0,
                  output: usage.candidatesTokenCount ?? 0,
                  total: (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0),
                },
              },
            };
          }
        } catch {
          // skip
        }
      }
    }

    yield { type: 'done', content: '' };
  },
};
