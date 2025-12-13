# Onebby Dashboard - دليل النشر على Netlify 🚀

## خطوات النشر على Netlify

### 1. تجهيز المشروع

✅ تم إنشاء ملف `netlify.toml` مع الإعدادات المطلوبة  
✅ تم إنشاء ملف `.env.production` كنموذج

### 2. إنشاء حساب على Netlify

1. اذهب إلى [netlify.com](https://netlify.com)
2. سجل دخول باستخدام GitHub

### 3. ربط المشروع

1. اضغط على **"Add new site"** → **"Import an existing project"**
2. اختر **GitHub**
3. اختر مستودع `Onebby-Dashboard`
4. سيتم اكتشاف إعدادات Next.js تلقائياً

### 4. إعداد المتغيرات البيئية (Environment Variables)

في لوحة تحكم Netlify:

- انتقل إلى **Site settings** → **Environment variables**
- أضف المتغيرات التالية:

```
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://your-site-name.netlify.app/api/auth
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_API_URL=https://onebby-api.onrender.com
NEXT_PUBLIC_API_KEY=X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE
```

**ملاحظة:** لتوليد `NEXTAUTH_SECRET` استخدم:

```bash
openssl rand -base64 32
```

### 5. إعدادات البناء (Build Settings)

في Netlify، تأكد من:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20`

### 6. نشر الموقع

اضغط **"Deploy site"** وانتظر حتى يكتمل البناء

---

## المميزات المضافة للنشر

### ✅ ملف `netlify.toml`

يحتوي على:

- إعدادات البناء
- إضافة Next.js Plugin
- إعدادات Node.js
- إعادة التوجيه للمسارات

### ✅ ملف `.env.production`

نموذج للمتغيرات البيئية في بيئة الإنتاج

### ✅ تحديث `.gitignore`

إضافة ملفات Netlify وقواعد البيانات المحلية

---

## المشاكل الشائعة وحلولها

### ❌ خطأ في البناء (Build Error)

**الحل:** تأكد من:

1. تثبيت جميع المكتبات: `npm install`
2. البناء محلياً أولاً: `npm run build`
3. التحقق من وجود جميع المتغيرات البيئية

### ❌ خطأ 404 في المسارات

**الحل:** ملف `netlify.toml` يحتوي على redirects تلقائياً

### ❌ خطأ في API

**الحل:** تحقق من:

- `NEXT_PUBLIC_API_URL` صحيح
- `NEXT_PUBLIC_API_KEY` موجود

---

## بعد النشر

### تحديث الموقع تلقائياً

أي `git push` إلى GitHub سيتسبب في بناء تلقائي على Netlify

### تغيير اسم الموقع

1. انتقل إلى **Site settings** → **Site details**
2. اضغط **"Change site name"**
3. اختر الاسم المناسب: `onebby-dashboard`

### ربط Domain مخصص (اختياري)

1. انتقل إلى **Domain settings**
2. اضغط **"Add custom domain"**
3. اتبع التعليمات لربط نطاقك

---

## معلومات إضافية

- **Framework**: Next.js 16.0.3
- **Package Manager**: pnpm
- **API Backend**: https://onebby-api.onrender.com
- **GitHub Repo**: https://github.com/M-Torsson/Onebby-Dashboard

---

## ملاحظات مهمة ⚠️

1. **لا ترفع ملف `.env` إلى GitHub** - استخدم Netlify Environment Variables
2. **غير `NEXTAUTH_SECRET`** - يجب أن يكون فريداً وسرياً
3. **حدّث URLs** - استبدل `your-site-name` باسم موقعك الفعلي
4. **Database**: إذا كنت تستخدم Prisma، ستحتاج قاعدة بيانات خارجية (مثل PlanetScale أو Supabase)

---

تم إعداده بواسطة GitHub Copilot 🤖
