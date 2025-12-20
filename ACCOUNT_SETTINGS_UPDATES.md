# Account Settings Updates

## التغييرات التي تم إجراؤها

### 1. تبسيط صفحة الإعدادات

- تمت إزالة التبويبات التالية:
  - ✅ Billing & Plans
  - ✅ Notifications
  - ✅ Connections
- تم الاحتفاظ بالتبويبات التالية فقط:
  - Account
  - Security

### 2. تحديث AccountDetails.jsx

#### التعديلات الرئيسية:

- **صورة البروفايل**: تم استبدال نظام رفع الصور بصورة ثابتة من `/images/logos/user.png`
- **الحقول المحدثة**:
  - Username (اسم المستخدم)
  - Email (البريد الإلكتروني)
  - Full Name (الاسم الكامل)
  - Country (البلد - مع قائمة شاملة بجميع الدول)
- **إزالة الحقول القديمة**:
  - First Name / Last Name
  - Organization
  - Phone Number
  - Address
  - State
  - Zip Code
  - Language (multi-select)
  - Timezone
  - Currency

#### دمج API:

- **GET /api/users/me**: جلب بيانات المستخدم عند تحميل الصفحة
- **PUT /api/users/{userId}**: حفظ التعديلات على بيانات المستخدم
- تمت إضافة:
  - Loading state أثناء جلب البيانات (CircularProgress)
  - Saving state أثناء الحفظ
  - معالجة الأخطاء مع رسائل بالعربية

### 3. تحديث AccountDelete.jsx

#### التعديلات:

- **دمج DELETE API**: `/api/users/{userId}`
- **الحصول على User ID**: من خلال GET /api/users/me
- **Dialog مخصص**: استبدال ConfirmationDialog بـ Dialog مخصص للتأكيد
- **تنظيف البيانات**: استخدام `localStorage.clear()` عند حذف الحساب
- **إعادة توجيه**: إلى صفحة تسجيل الدخول بعد الحذف

### 4. إعدادات API

```javascript
API_BASE_URL: https://onebby-api.onrender.com
API_KEY: X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE
Authorization: Bearer {accessToken}
```

### 5. قائمة الدول المضافة

تم إضافة قائمة شاملة تحتوي على 80+ دولة، منها:

- دول الخليج العربي: السعودية، الإمارات، قطر، الكويت، البحرين، عمان
- دول عربية: مصر، الأردن، لبنان، العراق، سوريا، المغرب، تونس، فلسطين، اليمن
- دول أوروبية: ألمانيا، فرنسا، المملكة المتحدة، إيطاليا، إسبانيا، وغيرها
- دول آسيوية: الصين، اليابان، الهند، ماليزيا، سنغافورة، وغيرها
- دول أخرى: الولايات المتحدة، كندا، أستراليا، البرازيل، وغيرها

## الملفات المعدلة

1. **src/views/pages/account-settings/index.jsx**
   - إزالة 3 تبويبات (Billing & Plans, Notifications, Connections)

2. **src/views/pages/account-settings/account/AccountDetails.jsx**
   - تحديث كامل للنموذج
   - دمج GET و PUT APIs
   - تغيير صورة البروفايل إلى صورة ثابتة
   - إضافة قائمة دول شاملة

3. **src/views/pages/account-settings/account/AccountDelete.jsx**
   - دمج DELETE API
   - إضافة dialog مخصص للتأكيد
   - تحسين معالجة الأخطاء

## كيفية الاختبار

1. **تسجيل الدخول**: تأكد من وجود `accessToken` في localStorage
2. **Account Details**:
   - تحقق من جلب البيانات تلقائياً
   - عدّل البيانات واضغط "Save Changes"
   - تأكد من ظهور الرسائل بالعربية
3. **Delete Account**:
   - اختر checkbox "I confirm my account deactivation"
   - اضغط "Deactivate Account"
   - تأكد من ظهور dialog التأكيد
   - تأكد من حذف الحساب وإعادة التوجيه

## الملاحظات

- جميع طلبات API تتطلب headers:
  - `X-API-Key`
  - `Authorization: Bearer {accessToken}`
  - `Content-Type: application/json`
- التوكن يُخزن في localStorage باسم `accessToken`
- الرسائل الخاصة بالحفظ والحذف بالعربية
- صورة البروفايل موجودة في: `public/images/logos/user.png`

## الخطوة التالية

✅ جاهز للرفع على GitHub
