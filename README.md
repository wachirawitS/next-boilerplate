# Next.js BFF Boilerplate

Boilerplate สำหรับแอป Next.js ที่ทำหน้าที่เป็น Backend-for-Frontend (BFF) หน้า browser เรียกเฉพาะ `/api/*`; route ของ Next.js จะ forward OAuth bearer token ไปยัง NestJS API โดยไม่เปิดเผย token ให้ client

## เริ่มต้น

```bash
npm install
cp .env.example .env.local
# ตั้งค่า UPSTREAM_API_URL ให้ชี้ไปยัง NestJS เช่น http://localhost:3001
npm run dev
```

ตัวอย่างหน้าแรกคือ `tasks` ซึ่งเรียก NestJS path `/api/v1/tasks` ผ่าน generic BFF proxy หากเพิ่ม endpoint ใหม่ ให้เพิ่ม resource path หนึ่งบรรทัดใน `src/lib/bff-allowlist.ts` ก่อนใช้งาน

## โครงสร้างสำคัญ

```text
src/
├── app/                         # routing และ shell เท่านั้น
│   └── api/bff/[...path]/       # generic allowlisted proxy
├── components/
│   ├── shared/                  # promote เมื่อมี feature ที่สองใช้จริง
│   └── ui/                      # primitives ที่ไม่มี domain logic
├── features/tasks/              # ตัวอย่างที่ตรงกับ NestJS tasks module
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
- ห้ามให้ browser เรียก NestJS โดยตรง; BFF จะ forward OAuth bearer token ไปยัง NestJS
- ตัวอย่าง route รับ bearer token จาก request header เป็นจุดต่อ auth/session adapter; ในระบบจริงให้ resolve token จาก HttpOnly BFF session ก่อนเรียก NestJS
- Next client contract ต้องสะท้อน response DTO ของ NestJS และ parse ด้วย zod
- list API ใช้ `{ data, meta }`, ID เป็น UUID, timestamp เป็น ISO 8601 UTC
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

คัดลอก `src/features/tasks` เป็นชื่อ feature ใหม่, เปลี่ยน schema/api/query keys/components ตาม NestJS module แล้วเพิ่ม resource path ใน allowlist ใช้ relative import ภายใน feature และ `@/` เมื่อ import ออกจาก feature
