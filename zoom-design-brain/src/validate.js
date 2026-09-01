export const SUPPORTED_ACTIONS = [
  'chat',
  'design_brief',
  'creative_direction',
  'generate_prompt',
  'shopfront_idea',
  'signage_idea',
  'material_suggestions',
  'client_brief',
];

export function validateRequest(body = {}) {
  const { action, message } = body;
  const requestId = body.requestId || null;
  const hasMessage = typeof message === 'string' ? message.trim().length > 0 : !!message;

  if (!action || !hasMessage) {
    return {
      valid: false,
      httpStatus: 400,
      errorBody: {
        success: false,
        errorCode: 'INVALID_REQUEST',
        message: 'الطلب ناقص، ابعتلي المطلوب وأنا أساعدك.',
      },
      requestId,
    };
  }

  if (!SUPPORTED_ACTIONS.includes(action)) {
    return {
      valid: false,
      httpStatus: 400,
      errorBody: {
        success: false,
        errorCode: 'UNSUPPORTED_ACTION',
        message: 'الوظيفة دي مش متاحة حاليًا.',
      },
      requestId,
    };
  }

  return {
    valid: true,
    httpStatus: 200,
    errorBody: null,
    requestId,
    action,
    message,
    context: body.context || {},
  };
}

const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export function normalizeInput(validated) {
  const ctx = validated.context || {};
  return {
    requestId: validated.requestId,
    action: validated.action,
    message: validated.message,
    context: {
      projectId: ctx.projectId || '',
      projectName: ctx.projectName || '',
      clientName: ctx.clientName || '',
      category: ctx.category || '',
      dimensions: ctx.dimensions || '',
      materials: toArr(ctx.materials),
      colors: toArr(ctx.colors),
      style: ctx.style || '',
      requirements: toArr(ctx.requirements),
      notes: toArr(ctx.notes),
      language: ctx.language || 'ar-EG',
    },
  };
}
