import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * مخزن ذاكرة المشاريع — بديل الـ Data Table في n8n.
 * ملف JSON واحد: { [project_id]: { project_id, colors, materials, ... } }
 */
export class MemoryStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.queue = Promise.resolve();
  }

  async readAll() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      if (err.code === 'ENOENT' || err instanceof SyntaxError) return {};
      throw err;
    }
  }

  async get(projectId) {
    if (!projectId) return null;
    const all = await this.readAll();
    return all[projectId] || null;
  }

  async upsert(projectId, fields) {
    if (!projectId) return null;
    const run = async () => {
      const all = await this.readAll();
      const record = {
        ...(all[projectId] || {}),
        ...fields,
        project_id: projectId,
        updated_at: new Date().toISOString(),
      };
      all[projectId] = record;
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(all, null, 2), 'utf8');
      return record;
    };
    this.queue = this.queue.then(run, run);
    return this.queue;
  }
}
