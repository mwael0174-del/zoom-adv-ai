export const SYSTEM_PROMPT = [
  'أنت ZOOM DESIGN BRAIN.',
  'أنت العقل الاصطناعي المركزي المتخصص في مجال التصميم والإعلانات واللافتات وواجهات المحلات.',
  'أنت مساعد ذكي عملي يعمل لصاحب مشروع Zoom Design.',
  'تحدث دائمًا بالعربي المصري الطبيعي عندما تكون اللغة ar-EG.',
  'افهم طلب المستخدم قبل الإجابة.',
  'استخدم Project Context المتاح.',
  'استخدم Memory المتاحة.',
  'لا تخلط بين المشاريع.',
  'لا تخمن بيانات غير موجودة. إذا كانت معلومة غير موجودة قل: غير محدد.',
  'تخصصك: Graphic Design, Advertising, Branding, Shopfront Design, Signage, 3D Letters, Acrylic, ACP, LED, Large Format Printing, Outdoor Advertising, Creative Direction, Design Brief, Client Brief, Prompt Engineering, Materials, Production Considerations.',
  'عندما يعطيك المستخدم فكرة، طورها. وعندما يطلب تصميمًا قدّم Concept واضحًا.',
  'عندما يطلب خامات اقترح خامات مناسبة مع سبب الاختيار. وعندما يطلب Prompt اكتب Prompt احترافيًا. وعندما يطلب Brief نظمه بشكل احترافي.',
  'لا تدّعي أنك نفذت شيئًا خارج التطبيق، ولا تدّعي أنك عدلت ملفات أو شغلت برنامجًا إلا إذا كانت هناك Tool فعلية نفذت ذلك.',
  'اجعل الإجابة عملية ومباشرة وحافظ على سياق المشروع الحالي.',
  'إذا غيّر المستخدم قرارًا سابقًا اعتبر القرار الجديد هو القرار الحالي.',
].join('\n');

export const ACTION_INSTRUCTIONS = {
  chat: 'محادثة ذكية عامة مع استخدام Project Context.',
  design_brief:
    'أنشئ Design Brief منظم يحتوي على العناوين: Project Overview, Objective, Target Audience, Creative Direction, Visual Style, Colors, Materials, Typography, Lighting, Production Notes, Requirements.',
  creative_direction:
    'أنشئ Creative Direction يحتوي على: Creative Concept, Visual Direction, Color Direction, Typography, Materials, Lighting, Composition, Brand Impression.',
  generate_prompt: 'أنشئ Prompt احترافي غني بالتفاصيل البصرية يصلح لتوليد صورة تصميم.',
  shopfront_idea:
    'ركز على: Facade, Signage, 3D Letters, Materials, Lighting, Colors, Composition, Visibility, Brand Impact.',
  signage_idea: 'ركز على: Sign Type, Materials, Letters, Lighting, Colors, Layout, Visibility, Production.',
  material_suggestions:
    'اقترح الخامات المناسبة حسب: Design, Location, Budget, Durability, Lighting, Outdoor/Indoor, Brand Style. إذا الميزانية غير معروفة لا تخمنها.',
  client_brief: 'حوّل كلام العميل إلى Brief احترافي ومنظم.',
};

const valOrNA = (v) => (v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : 'غير محدد');
const listOrNA = (a) => (Array.isArray(a) && a.length ? a.join(', ') : 'غير محدد');

export function buildPrompts(normalized, memory) {
  const ctx = normalized.context || {};
  const instr = ACTION_INSTRUCTIONS[normalized.action] || ACTION_INSTRUCTIONS.chat;

  const contextBlock = [
    'سياق المشروع الحالي:',
    '- Project ID: ' + valOrNA(ctx.projectId),
    '- اسم المشروع: ' + valOrNA(ctx.projectName),
    '- العميل: ' + valOrNA(ctx.clientName),
    '- التصنيف: ' + valOrNA(ctx.category),
    '- الأبعاد: ' + valOrNA(ctx.dimensions),
    '- الخامات: ' + listOrNA(ctx.materials),
    '- الألوان: ' + listOrNA(ctx.colors),
    '- الاستايل: ' + valOrNA(ctx.style),
    '- المتطلبات: ' + listOrNA(ctx.requirements),
    '- ملاحظات: ' + listOrNA(ctx.notes),
    '- اللغة: ' + valOrNA(ctx.language),
  ].join('\n');

  let memoryBlock = 'لا توجد ذاكرة سابقة لهذا المشروع.';
  if (memory && memory.project_id) {
    memoryBlock = [
      'ذاكرة المشروع السابقة (استخدمها واعتبر أحدث قرار هو الساري):',
      '- ألوان: ' + valOrNA(memory.colors),
      '- خامات: ' + valOrNA(memory.materials),
      '- أبعاد: ' + valOrNA(memory.dimensions),
      '- استايل: ' + valOrNA(memory.style),
      '- قرارات: ' + valOrNA(memory.decisions),
      '- ملخص: ' + valOrNA(memory.summary),
      '- آخر إجراء: ' + valOrNA(memory.last_action),
    ].join('\n');
  }

  const userPrompt = [
    contextBlock,
    memoryBlock,
    'الإجراء المطلوب (' + normalized.action + '):',
    instr,
    'طلب المستخدم:',
    normalized.message,
  ].join('\n\n');

  return {
    requestId: normalized.requestId,
    action: normalized.action,
    language: ctx.language || 'ar-EG',
    projectId: ctx.projectId || '',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    context: ctx,
    memory: memory && memory.project_id ? memory : null,
  };
}

export function mergeMemory(context, memory, aiText) {
  const mem = memory || {};
  const joinOr = (arr, prev) => (Array.isArray(arr) && arr.length ? arr.join(', ') : prev || '');
  const valOr = (v, prev) => (v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : prev || '');

  return {
    colors: joinOr(context.colors, mem.colors),
    materials: joinOr(context.materials, mem.materials),
    dimensions: valOr(context.dimensions, mem.dimensions),
    style: valOr(context.style, mem.style),
    decisions: joinOr(context.requirements, mem.decisions),
    summary: (aiText || '').slice(0, 500) || mem.summary || '',
  };
}
