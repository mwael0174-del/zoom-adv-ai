import fs from 'node:fs/promises';
import path from 'node:path';

export class MemoryCorruptedError extends Error {
  constructor(filePath) {
    super(`memory file is not valid JSON: ${filePath}`);
    this.name = 'MemoryCorruptedError';
  }
}

/**
 * مخزن ذاكرة المشاريع — بديل الـ Data Table في n8n.
 * ملف JSON واحد: { [project_id]: { project_id, colors, materials, ... } }
 */
export class MemoryStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
    this.tmpCounter = 0;
  }

  async readAll() {
    let raw;
    try {
      raw = await fs.readFile(this.filePath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') return {};
      throw err;
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      // لا نعتبر الملف التالف فاضي، عشان الكتابة اللي بعدها ما تمسحش السجلات.
      throw new MemoryCorruptedError(this.filePath);
    }
  }

  async get(projectId) {
    if (!projectId) return null;
    const all = await this.readAll();
    return Object.hasOwn(all, projectId) ? all[projectId] : null;
  }

  /**
   * دورة read-modify-write كاملة متسلسلة على مستوى الملف المشترك،
   * فمفيش تحديث بيمسح تحديث مشروع تاني. نداءات الـ AI بتفضل برّه القفل.
   * @param {string} projectId
   * @param {(current: object|null) => object|Promise<object>} buildFields
   */
  async update(projectId, buildFields) {
    if (!projectId) return null;
    const run = this.writeQueue.catch(() => {}).then(() => this.#applyUpdate(projectId, buildFields));
    this.writeQueue = run.catch(() => {});
    return run;
  }

  async #applyUpdate(projectId, buildFields) {
    const all = await this.readAll();
    const current = Object.hasOwn(all, projectId) ? all[projectId] : null;
    const record = {
      ...(current || {}),
      ...(await buildFields(current)),
      project_id: projectId,
      updated_at: new Date().toISOString(),
    };

    const next = { ...all };
    Object.defineProperty(next, projectId, { value: record, enumerable: true, writable: true, configurable: true });

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.${process.pid}.${this.tmpCounter++}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(next, null, 2), 'utf8');
    await fs.rename(tmpPath, this.filePath); // كتابة ذرية: الملف الأصلي يفضل سليم لو حصل انقطاع
    return record;
  }
}
