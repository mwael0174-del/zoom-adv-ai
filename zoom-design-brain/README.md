# ZOOM DESIGN BRAIN

تنفيذ مستقل (Node/Express + واجهة ويب) لـ workflow الـ n8n «ZOOM DESIGN BRAIN V1» — من غير أي اعتماد على n8n.

## التشغيل

```bash
cd zoom-design-brain
npm install
export OPENAI_API_KEY=sk-...
npm start        # http://localhost:3000
```

| متغير | الافتراضي | الوصف |
|-------|-----------|-------|
| `OPENAI_API_KEY` | — | مفتاح OpenAI (مطلوب) |
| `OPENAI_MODEL` | `gpt-4o-mini` | الموديل |
| `OPENAI_MAX_TOKENS` | `4000` | أقصى عدد توكنز للرد |
| `OPENAI_TIMEOUT_MS` | `60000` | مهلة الطلب |
| `PORT` | `3000` | بورت السيرفر |
| `MEMORY_FILE` | `data/memory.json` | ملف ذاكرة المشاريع |
| `RATE_WINDOW_MS` | `60000` | نافذة حد الطلبات لكل IP |
| `RATE_MAX` | `30` | أقصى عدد طلبات في النافذة لكل IP |
| `BRAIN_API_TOKEN` | — | لو مضبوط، كل نداءات الـ API تتطلب `Authorization: Bearer <token>` (اكتبه في خانة API Token في الواجهة) |

## الـ API

`POST /zoom-design/brain`

```json
{
  "action": "design_brief",
  "message": "عايز واجهة محل موبيليا فخمة",
  "requestId": "req-1",
  "context": {
    "projectId": "zd-001",
    "projectName": "محل موبيليا",
    "materials": ["ACP", "Acrylic"],
    "colors": ["أسود", "ذهبي"],
    "language": "ar-EG"
  }
}
```

رد ناجح:

```json
{
  "success": true,
  "requestId": "req-1",
  "action": "design_brief",
  "result": { "type": "text", "content": "..." },
  "meta": { "language": "ar-EG", "source": "zoom-design-brain" }
}
```

الأخطاء: `INVALID_REQUEST` / `UNSUPPORTED_ACTION` (400)، `AI_ERROR` (500)، `AI_TIMEOUT` (504).

الإجراءات المدعومة: `chat`, `design_brief`, `creative_direction`, `generate_prompt`, `shopfront_idea`, `signage_idea`, `material_suggestions`, `client_brief`.

نقاط إضافية: `GET /health`، و`GET /zoom-design/memory/:projectId` لقراءة ذاكرة مشروع.

## الذاكرة

كل مشروع له سجل في ملف JSON (بديل الـ Data Table في n8n) بالحقول: `colors`, `materials`, `dimensions`, `style`, `decisions`, `summary`, `last_action`, `updated_at`. القيم الجديدة تحل محل القديمة، والفاضية تحافظ على القديم، والذاكرة بتترجع للموديل في الطلب اللي بعده.

## الاختبارات

```bash
npm test
```
