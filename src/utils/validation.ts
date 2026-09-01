/**
 * Validation Utilities
 * أدوات التحقق الإضافية
 */

import { type ZodError, type ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Parse Zod Errors to Readable Format
 * تحويل أخطاء Zod إلى صيغة قابلة للقراءة
 */
export function parseZodErrors(
  error: ZodError
): Record<string, string> {
  const errors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
}

/**
 * Safe Parse with Type Guard
 * تحليل آمن مع توفر نوع
 */
export function safeParse<T>(
  schema: ZodSchema,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result as T };
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return {
        success: false,
        errors: parseZodErrors(error as ZodError),
      };
    }
    return {
      success: false,
      errors: { _error: 'Unknown validation error' },
    };
  }
}

/**
 * Email Validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone Number Validation (Egypt)
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const phoneRegex = /^(\+20|0)?1[0-2]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Currency Validation
 */
export function isValidCurrency(amount: unknown): amount is number {
  return typeof amount === 'number' && amount > 0 && !isNaN(amount);
}
