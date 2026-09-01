# 🏗️ معمارية المشروع المحسّنة
## Enhanced Architecture Documentation

### تحسينات رئيسية | Key Improvements

#### 1. **إدارة الحالة المركزية (State Management)**
```typescript
// استخدام Zustand بدلاً من Context API البسيط
import { useCampaignsStore } from '@/store/useCampaignsStore';

function MyComponent() {
  const { campaigns, addCampaign, updateStatus } = useCampaignsStore();
  // ...
}
```

**الفوائد:**
- ✅ حفظ تلقائي في localStorage
- ✅ أداء أفضل (re-renders أقل)
- ✅ DevTools للتتبع والـ debugging
- ✅ Middleware دعم (persist, immer, devtools)

---

#### 2. **نظام الـ HTTP موحد (Centralized HTTP Client)**
```typescript
import { metaClient, googleClient } from '@/services/api/httpClient';

// مع معالجة أخطاء تلقائية و Retry
const response = await metaClient.get('/me/campaigns');
```

**المميزات:**
- ✅ معالجة موحدة للأخطاء
- ✅ إعادة محاولة تلقائية (Retry Logic)
- ✅ Timeout إدارة
- ✅ نوعية TypeScript كاملة

---

#### 3. **التحقق من صحة البيانات (Validation)**
```typescript
import { campaignFormSchema } from '@/schemas/campaign.schema';

// التحقق من البيانات
const result = campaignFormSchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.errors);
}
```

**الفوائد:**
- ✅ رسائل أخطاء واضحة وعربية
- ✅ Type inference من schemas
- ✅ Compile-time و Runtime safety

---

#### 4. **نظام Async Hook**
```typescript
import { useAsync } from '@/hooks/useAsync';

function MyComponent() {
  const { status, data, error, refetch } = useAsync(
    () => fetchCampaigns(),
    true // immediate
  );

  if (status === 'pending') return <Loading />;
  if (status === 'error') return <Error error={error} />;
  return <div>{data}</div>;
}
```

---

#### 5. **نظام التخزين الآمن (Storage Manager)**
```typescript
import { storage } from '@/utils/storage';

// يدعم Prefix و Error handling
storage.set('user-preferences', { theme: 'dark' });
const prefs = storage.get('user-preferences');
storage.remove('user-preferences');
```

---

### هيكل المجلدات | Folder Structure

```
src/
├── types/                 # TypeScript Types
│   └── campaign.ts        # Campaign interfaces
├── store/                 # Zustand Stores
│   ├── useCampaignsStore.ts
│   └── useUIStore.ts
├── schemas/               # Zod Validation Schemas
│   └── campaign.schema.ts
├── services/              # API Services
│   ├── api/
│   │   └── httpClient.ts  # Centralized HTTP Client
│   ├── aiService.js
│   ├── metaApi.js
│   ├── googleApi.js
│   └── tiktokApi.js
├── hooks/                 # Custom React Hooks
│   ├── useAsync.ts
│   └── (more hooks)
├── utils/                 # Utility Functions
│   ├── storage.ts
│   ├── performance.ts
│   └── validation.ts
├── components/            # Reusable Components
│   ├── TitleBar/
│   ├── Sidebar/
│   └── ui/
├── pages/                 # Page Components
│   ├── Dashboard.jsx
│   ├── Campaigns.jsx
│   └── (more pages)
└── App.jsx               # Root Component
```

---

### الخطوات التالية | Next Steps

#### Phase 2: تحسينات المكونات
- [ ] تقسيم `Targeting.jsx` و `Quotation.jsx`
- [ ] إنشاء مكتبة مكونات UI موحدة
- [ ] إضافة Stories (Storybook)

#### Phase 3: الاختبارات
- [ ] Unit Tests (Vitest)
- [ ] Component Tests (React Testing Library)
- [ ] E2E Tests (Playwright)

#### Phase 4: الأداء
- [ ] Code Splitting
- [ ] Lazy Loading
- [ ] Bundle Analysis

---

### الأوامر الجديدة | New Commands

```bash
# تثبيت المتطلبات الجديدة
npm install

# تطوير عادي
npm start

# بناء الإنتاج
npm run electron:build
```

---

### المراجع | References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zod Validation](https://zod.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [React Hooks Patterns](https://react.dev/reference/react/hooks)
