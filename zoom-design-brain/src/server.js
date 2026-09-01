import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { MemoryStore } from './memory.js';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const config = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS || 4000),
  timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
  baseUrl: process.env.OPENAI_BASE_URL || undefined,
  authToken: process.env.BRAIN_API_TOKEN || '',
  rateWindowMs: Number(process.env.RATE_WINDOW_MS || 60000),
  rateMax: Number(process.env.RATE_MAX || 30),
};

const memory = new MemoryStore(process.env.MEMORY_FILE || path.join(rootDir, 'data', 'memory.json'));
const port = Number(process.env.PORT || 3000);

createApp({ memory, config }).listen(port, () => {
  console.log(`ZOOM DESIGN BRAIN على http://localhost:${port}`);
  if (!config.apiKey) console.warn('تحذير: OPENAI_API_KEY غير مضبوط — الطلبات هترجع AI_ERROR.');
  if (!config.authToken) console.warn('تحذير: BRAIN_API_TOKEN غير مضبوط — الـ API مفتوح لأي حد يوصل للسيرفر.');
});
