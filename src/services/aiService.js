/**
 * aiService.js
 * منطق الذكاء الاصطناعي منفصل — جاهز للاتصال بـ OpenAI / Gemini لاحقاً
 */

/**
 * توليد رد من الـ AI بناءً على السؤال وبيانات الحملات
 * @param {string} prompt - سؤال المستخدم
 * @param {Array} campaigns - قائمة الحملات
 * @returns {string} - رد الـ AI
 */
export function generateAISuggestion(prompt, campaigns) {
  const lower = prompt.toLowerCase();
  const active = campaigns.filter((c) => c.status === 'active');

  if (lower.includes('ميزانية') || lower.includes('budget')) {
    const total = active.reduce((s, c) => s + c.budget, 0);
    return `إجمالي ميزانية الحملات النشطة: ${total.toLocaleString('ar-EG')} جنيه.\n\nاقتراح: خصّص 40% لـ Facebook، و35% لـ Google Ads، و25% للمنصات الأخرى لتحقيق أفضل عائد.`;
  }

  if (lower.includes('أفضل') || lower.includes('best') || lower.includes('أداء')) {
    const best = [...campaigns].sort((a, b) => b.ctr - a.ctr)[0];
    if (best && best.ctr > 0) {
      return `أفضل حملة أداءً: "${best.name}" على ${best.platform} بمعدل نقر ${best.ctr}%.\n\nاقتراح: زِد ميزانيتها بنسبة 20% وكرّر استراتيجية الاستهداف.`;
    }
    return 'لا توجد بيانات كافية بعد. شغّل الحملات لمدة 48 ساعة على الأقل.';
  }

  if (lower.includes('نص') || lower.includes('copy') || lower.includes('إعلان')) {
    return `نص إعلان مقترح:\n\n"اكتشف العرض الذي ينتظرك! خصم حصري لفترة محدودة، لا تفوّت الفرصة."\n\nCTA: "اطلب الآن"\nاستهداف: 25-45 سنة\nأفضل وقت: 7-10 مساءً`;
  }

  if (lower.includes('ctr') || lower.includes('نقر')) {
    const sorted = [...campaigns].filter((c) => c.ctr > 0).sort((a, b) => b.ctr - a.ctr);
    if (sorted.length === 0) return 'لا توجد بيانات CTR بعد. شغّل حملاتك أولاً.';
    const tips = [
      `أعلى CTR: ${sorted[0].name} بنسبة ${sorted[0].ctr}%`,
      'استخدم صوراً عالية الجودة وألواناً جذابة',
      'اجعل الـ CTA واضحاً ومباشراً',
      'استهدف جمهوراً محدداً بدلاً من الجمهور العام',
    ];
    return tips.join('\n• ');
  }

  if (lower.includes('توقف') || lower.includes('paused') || lower.includes('إيقاف')) {
    const paused = campaigns.filter((c) => c.status === 'paused');
    if (paused.length === 0) return 'لا توجد حملات متوقفة حالياً.';
    return `الحملات المتوقفة (${paused.length}):\n${paused.map((c) => `• ${c.name} على ${c.platform}`).join('\n')}\n\nاقتراح: راجع ميزانيتها وحدّث الجمهور المستهدف قبل إعادة التشغيل.`;
  }

  // رد افتراضي
  const avgCtr = campaigns.length
    ? (campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length).toFixed(1)
    : 0;

  return `بناءً على ${campaigns.length} حملة:\n\n• ${active.length} حملة نشطة\n• متوسط CTR: ${avgCtr}%\n\nاقتراح عام: ركّز على Instagram وTikTok للجمهور الشاب، وFacebook للتحويلات المباشرة.`;
}

/**
 * للاتصال بـ OpenAI مستقبلاً — اترك التعليق ده كمرجع
 *
 * export async function callOpenAI(prompt, campaigns) {
 *   const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *     method: 'POST',
 *     headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       model: 'gpt-4o',
 *       messages: [
 *         { role: 'system', content: 'أنت مساعد إعلاني خبير...' },
 *         { role: 'user', content: `${prompt}\n\nبيانات الحملات: ${JSON.stringify(campaigns)}` }
 *       ]
 *     })
 *   });
 *   const data = await response.json();
 *   return data.choices[0].message.content;
 * }
 */
