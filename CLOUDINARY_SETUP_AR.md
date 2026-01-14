# 📸 إعداد Cloudinary لرفع الصور

## المشكلة السابقة

كنا نحاول رفع الصور إلى endpoint غير موجود: `/api/admin/upload/image`

## الحل الصحيح ✅

رفع الصور مباشرة إلى **Cloudinary** (خدمة خارجية)، ثم استخدام الـ URL الناتج في API الخاص بك.

---

## خطوات الإعداد

### 1️⃣ إنشاء حساب Cloudinary (مجاني)

1. اذهب إلى: https://cloudinary.com
2. اضغط "Sign Up" وأنشئ حساب مجاني
3. بعد التسجيل، ستصل إلى الـ **Dashboard**

### 2️⃣ الحصول على Cloud Name

في الـ Dashboard، ستجد:

```
Cloud Name: dxxxxxxx
```

📋 **انسخ** هذا الاسم

### 3️⃣ إنشاء Upload Preset (مهم!)

1. اذهب إلى: **Settings** ⚙️ (أعلى يمين الصفحة)
2. اختر: **Upload** من القائمة الجانبية
3. اضغط: **Add upload preset**
4. اختر: **Unsigned** (مهم جداً!)
5. **Preset name**: اختر اسم (مثل: `onebby_uploads`)
6. **اضغط Save**
7. 📋 **انسخ** الـ preset name

### 4️⃣ تحديث `.env.local`

افتح ملف `.env.local` وضع القيم:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=onebby_uploads
```

⚠️ **استبدل** القيم بالقيم الحقيقية من حسابك!

### 5️⃣ إعادة تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله من جديد:
pnpm dev
```

---

## كيف يعمل الآن؟

### قبل التعديل ❌

```
المتصفح → رفع صورة → /api/admin/upload/image (غير موجود!)
→ خطأ 403 Invalid API Key
```

### بعد التعديل ✅

```
1. المتصفح → رفع صورة → Cloudinary API
2. Cloudinary → يعيد URL: https://res.cloudinary.com/xxx/image.jpg
3. المتصفح → يحفظ الفئة مع الـ URL → PUT /api/v1/categories/{id}
4. الـ API → يحفظ الـ URL في قاعدة البيانات
```

---

## الكود المحدث

### `uploadImageToCloudinary` (تم التحديث)

```javascript
const uploadImageToCloudinary = async (file, folder) => {
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  const formDataUpload = new FormData()
  formDataUpload.append('file', file)
  formDataUpload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formDataUpload.append('folder', folder)

  // رفع مباشر إلى Cloudinary (بدون API Key!)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formDataUpload
  })

  const result = await response.json()
  return result.secure_url // URL الصورة على Cloudinary
}
```

### `handleSaveCategory` (لم يتغير - كان صحيح)

```javascript
const response = await fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY // ✅ صحيح
  },
  body: JSON.stringify({
    name: 'Category Name',
    image: 'https://res.cloudinary.com/xxx/image.jpg', // URL من Cloudinary
    icon: 'https://res.cloudinary.com/xxx/icon.svg'
  })
})
```

---

## الخلاصة

✅ **لا يوجد** endpoint لرفع الصور في API الخاص بك  
✅ **استخدم** Cloudinary لرفع الصور والحصول على URL  
✅ **احفظ** الـ URL فقط في قاعدة البيانات

---

## روابط مفيدة

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Docs - Unsigned Upload](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [Upload Presets Settings](https://cloudinary.com/console/lui/upload_presets)

---

**ملاحظة**: Cloudinary مجاني حتى 25 GB تخزين و 25 GB bandwidth شهرياً 🎉
