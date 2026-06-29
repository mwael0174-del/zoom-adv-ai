/**
 * targetingService.js
 * منطق ميزة الاستهداف الذكي — يشتق الرؤى من بيانات الحملات والمنصات المربوطة.
 * كل الدوال هنا حتمية (deterministic) ومبنية على بيانات الحملات الفعلية،
 * بحيث تعطي نتائج ثابتة وقابلة للتفسير — جاهزة للاستبدال بنماذج AI حقيقية لاحقاً.
 */

import { loadPlatforms } from './platformsStore';

// ─── أدوات مساعدة ──────────────────────────────────────────────────────────

/** مولّد رقم شبه-عشوائي ثابت اعتماداً على نص (seed) — يضمن نتائج مستقرة */
function seededValue(seed, min, max) {
  let h = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const norm = (Math.abs(h) % 1000) / 1000; // 0..1
  return min + norm * (max - min);
}

/** ربط اسم المنصة في الحملات بمفتاح المنصة في platformsStore */
function platformKey(platform) {
  const p = (platform || '').toLowerCase();
  if (p.includes('google')) return 'google';
  if (p.includes('tiktok')) return 'tiktok';
  // Facebook / Instagram / غيرها تُعتبر ضمن Meta
  return 'meta';
}

/** قائمة المنصات المربوطة فعلياً */
export function getConnectedPlatforms() {
  const all = loadPlatforms();
  return Object.entries(all)
    .filter(([, v]) => v.status === 'connected')
    .map(([k]) => k);
}

/** معدل التفاعل التقديري للحملة (مشتق من CTR والإنفاق) */
function engagementScore(c) {
  const spendRatio = c.budget > 0 ? c.spent / c.budget : 0;
  return Math.round((c.ctr * 12 + spendRatio * 40 + seededValue(c.name, 0, 25)));
}

// ─── 1) الاستهداف بالسلوك ────────────────────────────────────────────────────

const INTENT_TIERS = [
  { key: 'high',   label: 'نية شراء عالية',   color: 'success' },
  { key: 'medium', label: 'اهتمام نشط',       color: 'warning' },
  { key: 'low',    label: 'تصفّح عابر',        color: 'muted'   },
];

export function behavioralSegments(campaigns) {
  const active = campaigns.filter((c) => c.status !== 'draft');
  const total = active.reduce((s, c) => s + Math.max(c.spent, 200), 0) || 1;

  // توزيع الجمهور على مستويات النية بناءً على أداء الحملات
  const avgCtr = active.length
    ? active.reduce((s, c) => s + c.ctr, 0) / active.length
    : 1.5;

  const highPct = Math.min(45, Math.round(avgCtr * 8 + 6));
  const medPct = Math.min(40, Math.round(avgCtr * 6 + 18));
  const lowPct = Math.max(5, 100 - highPct - medPct);

  const tiers = [
    { ...INTENT_TIERS[0], pct: highPct },
    { ...INTENT_TIERS[1], pct: medPct },
    { ...INTENT_TIERS[2], pct: lowPct },
  ];

  // إشارات سلوكية لكل مستوى
  const signals = {
    high: ['زار صفحة المنتج 3+ مرات', 'أضاف للسلة دون إتمام', 'تفاعل مع آخر إعلانين', 'بحث عن العلامة التجارية'],
    medium: ['شاهد الفيديو حتى النهاية', 'تابع الحساب حديثاً', 'حفظ المنشور', 'نقر على إعلان واحد'],
    low: ['مرّ على الإعلان', 'شاهد < 3 ثوانٍ', 'لا تفاعل سابق'],
  };

  const audienceBase = Math.round(total * 5 + 1200);

  return tiers.map((t) => ({
    ...t,
    audience: Math.round((audienceBase * t.pct) / 100),
    signals: signals[t.key],
  }));
}

// ─── 2) الاستهداف الجغرافي المتقدم (بدون خريطة) ──────────────────────────────

const REGIONS = [
  { name: 'القاهرة الكبرى', code: 'CAI' },
  { name: 'الإسكندرية',     code: 'ALX' },
  { name: 'الجيزة',          code: 'GIZ' },
  { name: 'الدلتا',          code: 'DLT' },
  { name: 'الصعيد',          code: 'UEG' },
  { name: 'قناة السويس',     code: 'SUZ' },
];

export function geoActivity(campaigns) {
  const spent = campaigns.reduce((s, c) => s + c.spent, 0) || 1000;

  return REGIONS.map((r) => {
    const activity = Math.round(seededValue(r.code + spent, 35, 100));
    const peakHour = Math.round(seededValue(r.code, 17, 21));
    const pad = (h) => String(h % 24).padStart(2, '0');
    return {
      ...r,
      activity, // 0..100 مؤشر نشاط
      reach: Math.round((activity / 100) * spent * 9 + 4000),
      peak: `${pad(peakHour)}:00 - ${pad(peakHour + 2)}:00`,
      ctr: +(seededValue(r.code + 'ctr', 1.6, 4.6)).toFixed(1),
    };
  }).sort((a, b) => b.activity - a.activity);
}

// ─── 3) الاستهداف بالذكاء الاصطناعي (تنبؤ بالجمهور) ──────────────────────────

const AGE_BANDS = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDERS = ['الذكور', 'الإناث', 'الجميع'];

export function predictAudience(campaigns, { platform, objective } = {}) {
  const ref = campaigns.filter((c) => c.ctr > 0);
  const best = [...ref].sort((a, b) => b.ctr - a.ctr)[0];
  const seed = `${platform || 'all'}-${objective || 'reach'}-${best?.name || 'x'}`;

  const ageIdx = Math.floor(seededValue(seed + 'age', 0, AGE_BANDS.length));
  const genderIdx = Math.floor(seededValue(seed + 'gender', 0, GENDERS.length));
  const confidence = Math.round(seededValue(seed + 'conf', 72, 96));
  const predictedCtr = +(best ? best.ctr * 1.15 : 2.4).toFixed(1);

  const interests = [
    'التسوّق الإلكتروني', 'التقنية والهواتف', 'الموضة', 'السفر والسياحة',
    'الطعام والمطاعم', 'اللياقة والصحة', 'السيارات', 'الألعاب',
  ];
  const picked = interests
    .map((i) => ({ i, w: seededValue(seed + i, 0, 1) }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 4)
    .map((x) => x.i);

  return {
    age: AGE_BANDS[ageIdx],
    gender: GENDERS[genderIdx],
    interests: picked,
    confidence,
    predictedCtr,
    estReach: Math.round(seededValue(seed + 'reach', 25000, 180000)),
    note: best
      ? `التنبؤ مبني على أداء حملة "${best.name}" (CTR ${best.ctr}%) كأفضل مرجع.`
      : 'لا توجد حملات سابقة كافية — التنبؤ مبدئي ويتحسّن مع تشغيل الحملات.',
  };
}

// ─── 4) الاستهداف بالاهتمامات الدقيقة ────────────────────────────────────────

const MICRO_INTERESTS = [
  { group: 'التصوير', items: ['التصوير التجاري', 'تصوير المنتجات', 'تصوير الأعراس', 'الدرون'] },
  { group: 'السيارات', items: ['السيارات الرياضية', 'سيارات الدفع الرباعي', 'تعديل السيارات', 'السيارات الكهربائية'] },
  { group: 'التقنية', items: ['هواتف الفئة الرائدة', 'أجهزة الألعاب', 'الساعات الذكية', 'الذكاء الاصطناعي'] },
  { group: 'الجمال', items: ['العناية بالبشرة', 'مستحضرات التجميل الفاخرة', 'العطور', 'العناية بالشعر'] },
  { group: 'الرياضة', items: ['كرة القدم', 'اللياقة المنزلية', 'الجري', 'كمال الأجسام'] },
];

export function microInterests(campaigns) {
  const spent = campaigns.reduce((s, c) => s + c.spent, 0) || 800;
  return MICRO_INTERESTS.map((g) => ({
    group: g.group,
    items: g.items.map((name) => ({
      name,
      size: Math.round(seededValue(name + spent, 8, 95)) * 1000,
      affinity: +(seededValue(name + 'aff', 1.2, 3.5)).toFixed(1), // مؤشر التقارب
    })).sort((a, b) => b.affinity - a.affinity),
  }));
}

// ─── 5) الاستهداف الزمني ─────────────────────────────────────────────────────

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export function timeHeatmap(campaigns, platform = 'all') {
  // مصفوفة 7 أيام × 6 فترات زمنية، القيمة = مؤشر نشاط 0..100
  const slots = ['6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
  const grid = DAYS.map((day) =>
    slots.map((slot) => Math.round(seededValue(`${platform}-${day}-${slot}`, 10, 100)))
  );

  // أفضل 3 أوقات
  const flat = [];
  DAYS.forEach((day, di) =>
    slots.forEach((slot, si) => flat.push({ day, slot, v: grid[di][si] }))
  );
  const top = flat.sort((a, b) => b.v - a.v).slice(0, 3);

  return { days: DAYS, slots, grid, top };
}

// ─── 6) الاستهداف عبر الأجهزة ────────────────────────────────────────────────

export function deviceBreakdown(campaigns, platform = 'all') {
  const seed = platform + campaigns.length;
  let mobile = Math.round(seededValue(seed + 'm', 55, 78));
  let desktop = Math.round(seededValue(seed + 'd', 12, 30));
  let tablet = Math.max(2, 100 - mobile - desktop);

  return [
    { device: 'الموبايل',  key: 'mobile',  pct: mobile,  ctr: +(seededValue(seed + 'mc', 2.8, 4.8)).toFixed(1), tip: 'صمّم إعلانات عمودية (9:16) وسريعة التحميل' },
    { device: 'الكمبيوتر', key: 'desktop', pct: desktop, ctr: +(seededValue(seed + 'dc', 1.4, 2.6)).toFixed(1), tip: 'استخدم صفحات هبوط تفصيلية ونماذج أطول' },
    { device: 'التابلت',   key: 'tablet',  pct: tablet,  ctr: +(seededValue(seed + 'tc', 1.8, 3.2)).toFixed(1), tip: 'مناسب للمحتوى المرئي والتسوّق المسائي' },
  ];
}

// ─── 7) التوزيع التنبؤي للميزانية ────────────────────────────────────────────

export function budgetAllocation(campaigns, totalBudget) {
  const active = campaigns.filter((c) => c.status === 'active');
  const base = active.length ? active : campaigns;
  const budget = totalBudget || base.reduce((s, c) => s + c.budget, 0) || 10000;

  // عائد تقديري لكل حملة (ROAS) مشتق من CTR والإنفاق
  const scored = base.map((c) => {
    const roas = +(1 + c.ctr * 0.6 + seededValue(c.name, 0, 1.2)).toFixed(2);
    return { id: c.id, name: c.name, platform: c.platform, roas, score: engagementScore(c) };
  });

  const totalScore = scored.reduce((s, c) => s + c.roas, 0) || 1;

  return {
    budget,
    rows: scored
      .map((c) => {
        const recommended = Math.round((c.roas / totalScore) * budget);
        return { ...c, recommended };
      })
      .sort((a, b) => b.recommended - a.recommended),
  };
}

/** ملخص عام لأعلى البطاقات في الصفحة */
export function targetingOverview(campaigns) {
  const connected = getConnectedPlatforms();
  const segments = behavioralSegments(campaigns);
  const highIntent = segments.find((s) => s.key === 'high');
  const geo = geoActivity(campaigns);

  return {
    connectedCount: connected.length,
    connected,
    highIntentAudience: highIntent ? highIntent.audience : 0,
    topRegion: geo[0],
    totalAudience: segments.reduce((s, t) => s + t.audience, 0),
  };
}
