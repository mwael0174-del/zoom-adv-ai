import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { validateRequest, normalizeInput, SUPPORTED_ACTIONS } from './validate.js';
import { buildPrompts, mergeMemory } from './prompt.js';
import { callOpenAI } from './openaiClient.js';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

/**
 * @param {object} deps
 * @param {import('./memory.js').MemoryStore} deps.memory
 * @param {typeof callOpenAI} [deps.ai]
 * @param {object} deps.config
 */
export function createApp({ memory, ai = callOpenAI, config }) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(publicDir));

  app.get('/health', (req, res) => {
    res.json({ success: true, actions: SUPPORTED_ACTIONS, model: config.model, aiConfigured: !!config.apiKey });
  });

  app.get('/zoom-design/memory/:projectId', async (req, res) => {
    const record = await memory.get(req.params.projectId);
    if (!record) return res.status(404).json({ success: false, errorCode: 'NOT_FOUND', message: 'مفيش ذاكرة للمشروع ده.' });
    res.json({ success: true, memory: record });
  });

  app.post('/zoom-design/brain', async (req, res) => {
    const validated = validateRequest(req.body || {});
    if (!validated.valid) {
      return res.status(validated.httpStatus).json(validated.errorBody);
    }

    const normalized = normalizeInput(validated);
    const projectId = normalized.context.projectId;

    let stored = null;
    try {
      stored = await memory.get(projectId);
    } catch {
      stored = null; // الذاكرة اختيارية — زي onError: continueRegularOutput في n8n
    }

    const prompts = buildPrompts(normalized, stored);

    let aiText;
    try {
      aiText = await ai({
        systemPrompt: prompts.systemPrompt,
        userPrompt: prompts.userPrompt,
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens,
        timeoutMs: config.timeoutMs,
        baseUrl: config.baseUrl,
      });
    } catch (err) {
      const isTimeout = err?.timeout || /timeout|timed out|etimedout|econnreset|deadline/i.test(err?.message || '');
      return res.status(isTimeout ? 504 : 500).json({
        success: false,
        errorCode: isTimeout ? 'AI_TIMEOUT' : 'AI_ERROR',
        message: isTimeout
          ? 'الطلب أخد وقت أطول من المتوقع، جرّب تاني.'
          : 'حصلت مشكلة في الذكاء الاصطناعي، جرّب تاني.',
      });
    }

    if (projectId) {
      const merged = mergeMemory(normalized.context, stored, aiText);
      try {
        await memory.upsert(projectId, { ...merged, last_action: normalized.action });
      } catch (err) {
        console.error('memory upsert failed:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      requestId: prompts.requestId,
      action: prompts.action,
      result: { type: 'text', content: aiText },
      meta: { language: prompts.language, source: 'zoom-design-brain' },
    });
  });

  return app;
}
