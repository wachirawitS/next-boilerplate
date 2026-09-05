# Next.js BFF Boilerplate

Boilerplate สำหรับแอป Next.js ที่ทำหน้าที่เป็น Backend-for-Frontend (BFF) หน้า browser เรียกเฉพาะ `/api/*`; route ของ Next.js จะเติม service credential แล้วส่งต่อไปยัง upstream API

## เริ่มต้น

```bash
npm install
cp .env.example .env.local
# ตั้งค่า UPSTREAM_API_URL และ UPSTREAM_SERVICE_TOKEN
npm run dev
```

ตัวอย่างหน้าแรกคือ `products` ซึ่งเรียก upstream path `/example/products` ผ่าน generic BFF proxy หากเพิ่ม endpoint ใหม่ ให้เพิ่ม path หนึ่งบรรทัดใน `src/lib/bff-allowlist.ts` ก่อนใช้งาน

## โครงสร้างสำคัญ

```text
src/
├── app/                         # routing และ shell เท่านั้น
│   └── api/bff/[...path]/       # generic allowlisted proxy
├── components/
│   ├── shared/                  # promote เมื่อมี feature ที่สองใช้จริง
│   └── ui/                      # primitives ที่ไม่มี domain logic
├── features/products/           # ตัวอย่าง feature แบบแยกตัวเอง
│   ├── components/
│   ├── hooks/                   # TanStack Query อยู่ที่นี่เท่านั้น
│   ├── api.ts
│   ├── query-keys.ts
│   └── schemas.ts
└── lib/                         # BFF, env, client, errors, query config
```

## กติกาหลัก

- อ่านกติกาเต็มใน [`CONVENTIONS.md`](./CONVENTIONS.md) และกติกาย่อใน [`AGENTS.md`](./AGENTS.md)
- เปลี่ยน UI language ใน `CONVENTIONS.md` ให้ตรงกับโปรเจกต์ใหม่ก่อนเริ่มงาน
- ห้ามให้ browser เรียก upstream โดยตรง และห้าม expose service token
- server state ใช้ TanStack Query; ห้าม copy ลง `useState`
- ทุกหน้าที่อ่านข้อมูลต้องมี loading, error + retry, empty และ content state
- `process.env` อ่านได้เฉพาะ `src/lib/env.ts`

## ตรวจสอบ

```bash
npm run typecheck
npm run lint
npm run build
```

## เริ่ม feature ใหม่

คัดลอก `src/features/products` เป็นชื่อ feature ใหม่, เปลี่ยน schema/api/query keys/components ตาม domain แล้วเพิ่ม upstream path ใน allowlist ใช้ relative import ภายใน feature และ `@/` เมื่อ import ออกจาก feature
