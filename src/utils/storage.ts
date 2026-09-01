/**
 * Storage Utility
 * أداة إدارة التخزين المحلي (LocalStorage)
 */

export interface StorageOptions {
  prefix?: string;
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

class StorageManager {
  private prefix: string;
  private serialize: (value: unknown) => string;
  private deserialize: (value: string) => unknown;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'zoom-adv-ai:';
    this.serialize = options.serialize || JSON.stringify;
    this.deserialize = options.deserialize || JSON.parse;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set(key: string, value: unknown): void {
    try {
      const serialized = this.serialize(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`Storage error (set ${key}):`, error);
    }
  }

  get<T = unknown>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue || null;
      return this.deserialize(item) as T;
    } catch (error) {
      console.error(`Storage error (get ${key}):`, error);
      return defaultValue || null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Storage error (remove ${key}):`, error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage error (clear):', error);
    }
  }
}

export const storage = new StorageManager();
