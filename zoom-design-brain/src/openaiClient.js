const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export class OpenAIError extends Error {
  constructor(message, { timeout = false } = {}) {
    super(message);
    this.name = 'OpenAIError';
    this.timeout = timeout;
  }
}

/**
 * ينادي Chat Completions ويرجّع نص الرد.
 */
export async function callOpenAI({ systemPrompt, userPrompt, apiKey, model, maxTokens, timeoutMs, baseUrl }) {
  if (!apiKey) throw new OpenAIError('OPENAI_API_KEY is not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl || DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    // المهلة فاضلة شغالة لحد ما الـ body يتقرأ بالكامل، عشان body واقف ما يعلّقش الطلب.
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new OpenAIError(`OpenAI responded ${res.status}: ${detail.slice(0, 300)}`, {
        timeout: res.status === 504 || res.status === 408,
      });
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  } catch (err) {
    if (err instanceof OpenAIError) throw err;
    if (err.name === 'AbortError') throw new OpenAIError('OpenAI request timed out', { timeout: true });
    throw new OpenAIError(err.message);
  } finally {
    clearTimeout(timer);
  }
}
