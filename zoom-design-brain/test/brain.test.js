import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { MemoryStore } from '../src/memory.js';
import { validateRequest, normalizeInput } from '../src/validate.js';
import { buildPrompts, mergeMemory } from '../src/prompt.js';

const config = { apiKey: 'test-key', model: 'gpt-4o-mini', maxTokens: 100, timeoutMs: 1000 };

async function withServer(t, { ai, memory }) {
  const app = createApp({ memory, ai, config });
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

async function tmpStore(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zdb-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return new MemoryStore(path.join(dir, 'memory.json'));
}

const post = (base, body, headers = {}) =>
  fetch(`${base}/zoom-design/brain`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

test('rejects request without action or message', async (t) => {
  const base = await withServer(t, { memory: await tmpStore(t), ai: async () => 'x' });
  const res = await post(base, { message: 'hi' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).errorCode, 'INVALID_REQUEST');
});

test('rejects unsupported action', async (t) => {
  const base = await withServer(t, { memory: await tmpStore(t), ai: async () => 'x' });
  const res = await post(base, { action: 'nope', message: 'hi' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).errorCode, 'UNSUPPORTED_ACTION');
});

test('returns structured success payload', async (t) => {
  const base = await withServer(t, { memory: await tmpStore(t), ai: async () => 'رد تجريبي' });
  const res = await post(base, { action: 'chat', message: 'ازيك', requestId: 'r1' });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    success: true,
    requestId: 'r1',
    action: 'chat',
    result: { type: 'text', content: 'رد تجريبي' },
    meta: { language: 'ar-EG', source: 'zoom-design-brain' },
  });
});

test('maps AI timeout to 504 and other failures to 500', async (t) => {
  const memory = await tmpStore(t);
  const timeoutBase = await withServer(t, {
    memory,
    ai: async () => {
      throw Object.assign(new Error('request timed out'), { timeout: true });
    },
  });
  const timeoutRes = await post(timeoutBase, { action: 'chat', message: 'hi' });
  assert.equal(timeoutRes.status, 504);
  assert.equal((await timeoutRes.json()).errorCode, 'AI_TIMEOUT');

  const errorBase = await withServer(t, {
    memory,
    ai: async () => {
      throw new Error('boom');
    },
  });
  const errorRes = await post(errorBase, { action: 'chat', message: 'hi' });
  assert.equal(errorRes.status, 500);
  assert.equal((await errorRes.json()).errorCode, 'AI_ERROR');
});

test('persists project memory and feeds it into the next prompt', async (t) => {
  const memory = await tmpStore(t);
  const prompts = [];
  const base = await withServer(t, {
    memory,
    ai: async ({ userPrompt }) => {
      prompts.push(userPrompt);
      return 'ملخص الرد';
    },
  });

  await post(base, {
    action: 'design_brief',
    message: 'واجهة محل',
    context: { projectId: 'p1', colors: ['أسود'], materials: ['ACP'], style: 'Modern' },
  });

  const stored = await memory.get('p1');
  assert.equal(stored.colors, 'أسود');
  assert.equal(stored.materials, 'ACP');
  assert.equal(stored.last_action, 'design_brief');
  assert.equal(stored.summary, 'ملخص الرد');

  await post(base, { action: 'chat', message: 'كمل', context: { projectId: 'p1' } });

  assert.match(prompts[1], /ذاكرة المشروع السابقة/);
  assert.match(prompts[1], /أسود/);

  const other = await post(base, { action: 'chat', message: 'مشروع تاني', context: { projectId: 'p2' } });
  assert.equal(other.status, 200);
  assert.match(prompts[2], /لا توجد ذاكرة سابقة/);
});

test('concurrent requests for one project keep both updates', async (t) => {
  const memory = await tmpStore(t);
  const release = {};
  const gate = (id) => new Promise((resolve) => (release[id] = resolve));
  const base = await withServer(t, {
    memory,
    ai: async ({ userPrompt }) => {
      await gate(userPrompt.includes('أحمر') ? 'a' : 'b');
      return 'رد';
    },
  });

  const first = post(base, { action: 'chat', message: 'x', context: { projectId: 'p', colors: ['أحمر'] } });
  const second = post(base, { action: 'chat', message: 'y', context: { projectId: 'p', materials: ['ACP'] } });
  await new Promise((resolve) => setTimeout(resolve, 20));
  release.a();
  release.b();
  await Promise.all([first, second]);

  const stored = await memory.get('p');
  assert.equal(stored.colors, 'أحمر');
  assert.equal(stored.materials, 'ACP');
});

test('a corrupted memory file is never silently overwritten', async (t) => {
  const memory = await tmpStore(t);
  await memory.update('p1', () => ({ colors: 'أزرق' }));
  await fs.writeFile(memory.filePath, '{"p1": {', 'utf8');

  const base = await withServer(t, { memory, ai: async () => 'رد' });
  const memRes = await fetch(`${base}/zoom-design/memory/p1`);
  assert.equal(memRes.status, 500);
  assert.equal((await memRes.json()).errorCode, 'MEMORY_ERROR');

  const res = await post(base, { action: 'chat', message: 'hi', context: { projectId: 'p1' } });
  assert.equal(res.status, 200); // الرد بيكمل، والملف التالف بيفضل زي ما هو
  assert.equal(await fs.readFile(memory.filePath, 'utf8'), '{"p1": {');
});

test('a __proto__ project id does not pollute stored records', async (t) => {
  const memory = await tmpStore(t);
  await memory.update('__proto__', () => ({ colors: 'أسود' }));
  assert.equal(await memory.get('polluted'), null);
  assert.equal({}.colors, undefined);
  assert.equal((await memory.get('__proto__')).colors, 'أسود');
});

test('requests are rejected without the configured token', async (t) => {
  const memory = await tmpStore(t);
  const app = createApp({ memory, ai: async () => 'رد', config: { ...config, authToken: 'secret' } });
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  assert.equal((await post(base, { action: 'chat', message: 'hi' })).status, 401);
  assert.equal((await post(base, { action: 'chat', message: 'hi' }, { authorization: 'Bearer secret' })).status, 200);
});

test('memory keeps previous values when new context is empty', () => {
  const merged = mergeMemory({ colors: [], materials: ['ACP'] }, { colors: 'أحمر', materials: 'Acrylic' }, 'نص');
  assert.equal(merged.colors, 'أحمر');
  assert.equal(merged.materials, 'ACP');
  assert.equal(merged.summary, 'نص');
});

test('normalizes scalar context values into arrays and defaults language', () => {
  const normalized = normalizeInput(validateRequest({ action: 'chat', message: 'hi', context: { materials: 'ACP' } }));
  assert.deepEqual(normalized.context.materials, ['ACP']);
  assert.equal(normalized.context.language, 'ar-EG');
});

test('prompt marks missing context fields as غير محدد and includes action instruction', () => {
  const normalized = normalizeInput(validateRequest({ action: 'signage_idea', message: 'لافتة' }));
  const { userPrompt, systemPrompt } = buildPrompts(normalized, null);
  assert.match(userPrompt, /اسم المشروع: غير محدد/);
  assert.match(userPrompt, /Sign Type, Materials/);
  assert.match(systemPrompt, /ZOOM DESIGN BRAIN/);
});
