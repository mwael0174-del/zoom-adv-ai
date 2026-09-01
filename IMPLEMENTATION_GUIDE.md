# 📝 IMPLEMENTATION GUIDE
# دليل التطبيق والاستخدام

## الخطوات الأولى | Getting Started

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إعداد متغيرات البيئة
```bash
cp .env.example .env
```

ثم أضف مفاتيح API الخاصة بك:
```env
VITE_META_API_KEY=your_key_here
VITE_GOOGLE_API_KEY=your_key_here
VITE_TIKTOK_API_KEY=your_key_here
```

### 3. تشغيل التطبيق
```bash
npm start
```

---

## استخدام الحالة الجديدة | Using New State Management

### قبل (الطريقة القديمة):
```javascript
// context/CampaignsContext.jsx
const [campaigns, setCampaigns] = useState(() => getCampaigns());

const refresh = useCallback(() => {
  setCampaigns(getCampaigns());
}, []);
```

### بعد (مع Zustand):
```typescript
// store/useCampaignsStore.ts
import { useCampaignsStore } from '@/store/useCampaignsStore';

function MyComponent() {
  const { campaigns, addCampaign, updateStatus } = useCampaignsStore();
  
  // Auto-persist to localStorage
  // Re-renders optimized
}
```

**المزايا:**
- ✅ تخزين تلقائي في localStorage
- ✅ تقليل عدد re-renders
- ✅ DevTools للتتبع
- ✅ Middleware مدعوم

---

## استخدام الـ Validation | Using Validation

### قبل:
```javascript
const handleSubmit = (e) => {
  if (!form.name.trim() || !form.budget) return;
  addCampaign({ name: form.name, ... });
};
```

### بعد:
```typescript
import { campaignFormSchema } from '@/schemas/campaign.schema';
import { safeParse } from '@/utils/validation';

const handleSubmit = (e) => {
  const validation = safeParse(campaignFormSchema, formData);
  
  if (!validation.success) {
    setErrors(validation.errors); // رسائل خطأ عربية واضحة
    return;
  }
  
  addCampaign(validation.data);
};
```

---

## استخدام HTTP Client | Using HTTP Client

### قبل (في الملفات المنفصلة):
```javascript
// services/metaApi.js
export async function getCampaigns() {
  const response = await fetch('...');
  // بدون معالجة أخطاء موحدة
}
```

### بعد (HTTP Client موحد):
```typescript
import { MetaService } from '@/services/api/metaService';

// مع retry logic و timeout handling
const campaigns = await MetaService.getCampaigns();

// أو استخدم Hook
const { status, data, error } = useAsync(
  () => MetaService.getCampaigns()
);
```

---

## استخدام الـ Hooks الجديدة | Using New Hooks

### useCampaigns Hook:
```typescript
function Campaigns() {
  const {
    campaigns,
    loading,
    error,
    handleAddCampaign,
    handleDeleteCampaign,
    handleUpdateStatus,
  } = useCampaigns();

  return (
    // كل شيء مدير من الـ Hook
  );
}
```

### useNotification Hook:
```typescript
import { useNotification } from '@/hooks/useNotification';

function MyComponent() {
  const notification = useNotification();
  // Auto-close بعد 5 ثواني
  
  return <div>{notification?.message}</div>;
}
```

### useAsync Hook:
```typescript
const { status, data, error, refetch } = useAsync(
  () => fetchData(),
  true // immediate
);

if (status === 'pending') return <Loading />;
if (status === 'error') return <Error>{error.message}</Error>;
return <div>{data}</div>;
```

---

## التخزين الآمن | Storage

```typescript
import { storage } from '@/utils/storage';

// حفظ البيانات
storage.set('user-preferences', { theme: 'dark' });

// استرجاع البيانات
const prefs = storage.get('user-preferences');

// حذف بيانات محددة
storage.remove('user-preferences');

// حذف جميع البيانات
storage.clear();
```

---

## الأداء | Performance

```typescript
import { debounce, throttle, memoizeAsync } from '@/utils/performance';

// Debounce للبحث
const handleSearch = debounce((query) => {
  fetchCampaigns(query);
}, 300);

// Throttle للـ scroll
const handleScroll = throttle(() => {
  loadMore();
}, 200);

// Memoize for API calls
const getCampaignsWithCache = memoizeAsync(
  () => fetchCampaigns(),
  60000 // cache for 60 seconds
);
```

---

## الخطوات التالية | Next Steps

### Phase 2: تقسيم المكونات
- [ ] تقسيم `Targeting.jsx` إلى مكونات أصغر
- [ ] تقسيم `Quotation.jsx` إلى مكونات أصغر
- [ ] إنشاء مكتبة مكونات UI موحدة

### Phase 3: الاختبارات
- [ ] Unit Tests (Vitest)
- [ ] Component Tests (React Testing Library)
- [ ] E2E Tests (Playwright)

### Phase 4: الأداء المتقدم
- [ ] Code Splitting
- [ ] Lazy Loading للصفحات
- [ ] Image Optimization
- [ ] Bundle Analysis

---

## المراجع | References

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Zod Validation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React Hooks Patterns](https://react.dev/reference/react/hooks)
- [Vite Documentation](https://vitejs.dev/)
