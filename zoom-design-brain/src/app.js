import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { validateRequest, normalizeInput, SUPPORTED_ACTIONS } from './validate.js';
import { buildPrompts, mergeMemory } from './prompt.js';
import { callOpenAI } from './openaiClient.js';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const unauthorized = (res) =>
  res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: 'مطلوب توكن صالح.' });

const memoryError = (res) =>
  res.status(500).json({ success: false, errorCode: 'MEMORY_ERROR', message: 'تعذر قراءة ذاكرة المشروع.' });

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

  // لما يكون BRAIN_API_TOKEN مضبوط، كل نداءات الـ API تتطلب التوكن ده.
  const requireToken = (req, res, next) => {
    if (!config.authToken) return next();
    const header = req.get('authorization') || '';
    const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (provided !== config.authToken) return unauthorized(res);
    next();
  };

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      actions: SUPPORTED_ACTIONS,
      model: config.model,
      aiConfigured: !!config.apiKey,
      authRequired: !!config.authToken,
    });
  });

  app.get('/zoom-design/memory/:projectId', requireToken, async (req, res) => {
    let record;
    try {
      record = await memory.get(req.params.projectId);
    } catch (err) {
      console.error('memory read failed:', err.message);
      return memoryError(res);
    }
    if (!record) {
      return res.status(404).json({ success: false, errorCode: 'NOT_FOUND', message: 'مفيش ذاكرة للمشروع ده.' });
    }
    res.json({ success: true, memory: record });
  });

  app.post('/zoom-design/brain', requireToken, async (req, res) => {
    const validated = validateRequest(req.body || {});
    if (!validated.valid) {
      return res.status(validated.httpStatus).json(validated.errorBody);
    }

    const normalized = normalizeInput(validated);
    const projectId = normalized.context.projectId;

    let stored = null;
    try {
      stored = await memory.get(projectId);
    } catch (err) {
      console.error('memory read failed:', err.message); // الذاكرة اختيارية — زي onError: continueRegularOutput
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
      try {
        // الدمج بيتم جوه القفل عشان طلبين على نفس المشروع ما يمسحوش بعض.
        await memory.update(projectId, (current) => ({
          ...mergeMemory(normalized.context, current, aiText),
          last_action: normalized.action,
        }));
      } catch (err) {
        console.error('memory update failed:', err.message);
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
