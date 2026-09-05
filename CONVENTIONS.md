# Next.js Frontend Conventions

> **Purpose.** This document defines *how* code is written in our Next.js projects, so that
> every contributor — human or AI — produces code that looks like it was written by one person.
>
> **Scope.** Applies to any new Next.js repository where Next.js acts as a Backend-for-Frontend
> in front of a separate API. It does not apply to full-stack Next.js projects that own a
> database directly; those need a different document.
>
> **Status.** This is a standing rule set, not a spec. It is rewritten in place. It never
> describes a particular feature.

---

## 0. How to use this document

Two files ship with every repository:

| File | Audience | Content |
|------|----------|---------|
| `CONVENTIONS.md` | Humans, and agents that are told to read it | This document, in full |
| `AGENTS.md` | Every agent, automatically | The subset that is violated most often |

`AGENTS.md` is a summary. When the two disagree, **this document wins**.

Rules are written as **must** / **must not**. There are no soft preferences here. A rule that
allows judgement is a rule that produces two codebases.

Where a rule can be enforced by a machine, §14 gives the configuration. Rules that cannot be
enforced mechanically are marked 👁️ **review-only** — they are the ones that need a human eye
on the diff.

---

## 1. Architecture baseline

These are the assumptions everything else in this document rests on. If a project does not
match them, stop — this document does not apply to it.

1. **Next.js is a Backend-for-Frontend, and nothing else.** It owns no database, no ORM, no
   migrations, and no business rules. A separate API service owns all of those.
2. **The browser never calls the upstream API directly.** Every browser request goes to a
   Next.js route, which attaches a service credential the browser never sees and forwards the
   request upstream.
3. **The application is client-first.** Screens are Client Components. Server state is read
   through TanStack Query against our own `/api/*` routes. React Server Components are used for
   layout and shell, not for fetching feature data.
4. **The exception:** a *public* page whose first paint must not wait on client JavaScript
   (a receipt, a share link, a landing page) may server-render by calling the upstream API
   directly through `lib/upstream.ts`. This is an exception, and it must be justified in the
   feature's spec. Everything else is client-first.

**Why client-first rather than RSC-first.** Every request already has to pass through our own
route layer to pick up the service credential. Fetching from a Server Component would bypass
that layer and create a second path to the upstream API. One path is easier to secure, log,
and reason about than two.

---

## 2. Project structure

Code is organised by **feature**, not by file type.

```
src/
├── app/                              # Routes only. No logic.
│   ├── (shop)/
│   │   └── sale/page.tsx
│   ├── api/
│   │   ├── bff/[...path]/route.ts    # Generic upstream proxy
│   │   └── checkout/route.ts         # Hand-written, only when §4 allows it
│   ├── layout.tsx
│   └── providers.tsx
├── features/
│   ├── sale/
│   │   ├── components/
│   │   │   ├── sale-form.tsx
│   │   │   └── product-grid.tsx
│   │   ├── hooks/
│   │   │   ├── use-products.ts       # useQuery lives here, never in a component
│   │   │   └── use-create-sale.ts    # useMutation lives here
│   │   ├── api.ts                    # fetch functions hitting /api/*
│   │   ├── query-keys.ts
│   │   ├── schemas.ts                # zod
│   │   ├── utils.ts                  # pure functions, no React
│   │   └── types.ts
│   └── expense/
│       └── ...
├── components/
│   ├── ui/                           # shadcn/ui only
│   └── shared/                       # used by 2+ features, and only then
├── hooks/                            # used by 2+ features, and only then
└── lib/                              # see §10
```

### 2.1 `app/` must contain no logic

A file in `app/` may read route params and search params, render feature components, and set
metadata. That is the complete list.

It must not: call `useQuery`, transform data, hold business conditionals, or define components
that are used anywhere else.

👁️ A `page.tsx` longer than about 50 lines is a signal that logic has leaked into the routing
layer. Move it into the feature.

```tsx
// src/app/(shop)/sale/page.tsx — correct
import { SaleScreen } from "@/features/sale/components/sale-screen";

export default function SalePage() {
  return <SaleScreen />;
}
```

### 2.2 A feature must not import another feature

`features/sale` must not import anything from `features/expense`, at any depth. There is no
exception.

When two features genuinely need the same thing, **promote** it:

- a component → `components/shared/`
- a hook → `hooks/`
- a pure function or client → `lib/`

### 2.3 Promotion is earned, never predicted

New code is born inside a feature. It moves to `shared/`, `hooks/`, or `lib/` **only when a
second feature actually needs it** — not when it looks like it might.

This is the rule that keeps `shared/` from becoming a graveyard of components nobody
remembers, which in turn is what makes an agent build a duplicate.

### 2.4 Import paths

- **Inside your own feature: relative imports.** `./components/sale-form`, `../api`
- **Outside your own feature: the `@/` alias.** `@/components/ui/button`, `@/lib/format`

This is not cosmetic. It is what makes rule 2.2 enforceable: any `@/features/...` import found
inside `src/features/` is by definition a cross-feature import, and ESLint can reject it.

---

## 3. File naming and exports

### 3.1 Naming

| Thing | Rule | Example |
|-------|------|---------|
| All files and folders | `kebab-case` | `product-card.tsx`, `features/sale/` |
| Next.js special files | As Next.js requires | `page.tsx`, `layout.tsx`, `route.ts` |
| Dynamic route folders | As Next.js requires | `[id]`, `[...path]` |
| Component name | `PascalCase` — the file stays kebab-case | `product-card.tsx` → `ProductCard` |
| Hook file | `use-<thing>.ts` | `use-cart.ts` → `useCart()` |
| Types and interfaces | `PascalCase`, no `I` prefix | `Sale`, `SaleLineItem` |
| Component props type | `<Component>Props`, in the same file | `ProductCardProps` |
| Query keys | `<feature>Keys` in `query-keys.ts` | `saleKeys.list()` |
| Boolean props and variables | `is` / `has` / `can` prefix | `isLoading`, `canRefund` |
| Function props | `on<Event>`; the handler inside is `handle<Event>` | `onSubmit` ↔ `handleSubmit` |
| True constants | `SCREAMING_SNAKE_CASE` | `MAX_CART_ITEMS` |

### 3.2 Named exports only

Every export is a **named export**, except in files where Next.js requires a default export:
`page`, `layout`, `template`, `loading`, `error`, `global-error`, `not-found`, `default`,
`middleware`, metadata files, and config files at the repository root.

A default export can be renamed at the import site, so `import Foo from "./product-card"` type
checks perfectly while being completely wrong. Named exports make that a compile error, and
they make editor auto-import reliable.

### 3.3 One component per file

One exported component per file. A small sub-component used only within that file, and not
exported, is fine.

### 3.4 No barrel files

Do not create `index.ts` files that re-export a folder's contents. Import from the full path
instead:

```ts
import { ProductCard } from "@/features/sale/components/product-card";  // yes
import { ProductCard } from "@/features/sale/components";               // no
```

Barrels break tree-shaking, invite circular imports, and hide where code actually lives — which
makes an agent unable to tell whether something already exists.

---

## 4. The BFF layer: `app/api/`

Every browser request to the upstream API passes through here. The default is a **single
generic proxy guarded by an allowlist**.

### 4.1 The proxy

```
src/app/api/bff/[...path]/route.ts    # forwards to upstream with the service credential
src/lib/bff-allowlist.ts              # one line per path the browser may reach
```

Adding a new upstream endpoint to the frontend is **one line in the allowlist**. Nothing else.

### 4.2 Why an allowlist and not a bare catch-all

A bare catch-all proxy attaches the service credential to *anything* the browser asks for. That
makes every upstream endpoint — including the ones intended to be internal — reachable from the
browser's devtools by anyone with a session. The credential stops being a boundary.

The allowlist restores the boundary at a cost of one line per endpoint.

### 4.3 When a hand-written route handler is allowed

Write a dedicated route handler **only** when the BFF must do one of these:

1. Combine two or more upstream calls into one response
2. Reshape a payload the client cannot reasonably consume as-is
3. Handle a file upload or a streamed response
4. Read or write a cookie other than the session cookie

Anything outside that list goes through the proxy. "It felt cleaner" is not on the list.

### 4.4 Route handler rules

- A route handler must not contain business rules. It forwards, reshapes, and returns.
- It must not import from `features/`.
- Upstream errors are translated once, in `lib/errors.ts`, into our own error shape. Never leak
  a raw upstream error body to the browser.

---

## 5. Data fetching and state

### 5.1 Three kinds of state

| Kind | Where it lives | Examples |
|------|----------------|----------|
| **Server state** — owned by the API | TanStack Query, and nowhere else | product list, today's sales |
| **URL state** — should survive refresh and be shareable | `searchParams` (use `nuqs`) | filters, date range, page, active tab |
| **Client state** — what the user is doing right now | `useState` / `useReducer` locally; Zustand only when it must cross routes | is the dialog open, the cart |

### 5.2 Never copy server state into client state

```tsx
// forbidden, always, with no exception
const { data } = useProducts();
const [products, setProducts] = useState([]);
useEffect(() => setProducts(data ?? []), [data]);
```

This creates two copies of the same data: the one TanStack Query knows about, and the one on
screen. When a refetch succeeds, the screen does not change. There is no error, no warning, and
no failing test — just stale numbers in front of a user.

Derive at render time, or use the query's `select` option.

### 5.3 Query configuration

- Defaults (`staleTime`, `retry`, `refetchOnWindowFocus`) are set once in `lib/query-client.ts`.
  Do not re-specify them per query unless that query genuinely differs, and say why in a comment.
- Query keys are built by the feature's `query-keys.ts`. Never write a key inline.
- Invalidation targets a key factory, never a hand-typed array.

```ts
// src/features/sale/query-keys.ts
export const saleKeys = {
  all: ["sale"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters: SaleFilters) => [...saleKeys.lists(), filters] as const,
  detail: (id: string) => [...saleKeys.all, "detail", id] as const,
};
```

---

## 6. Custom hooks

### 6.1 You must extract a hook when

1. **You are calling `useQuery`, `useMutation`, or `useInfiniteQuery`.** A component never calls
   these directly. Every one lives in `features/<feature>/hooks/use-*.ts` — *from the first use,
   even if there is only one caller.*
2. **A `useEffect` synchronises with something outside React**: a timer, an event listener,
   `matchMedia`, `localStorage`, focus, an imperative third-party instance.
3. **Three or more pieces of related state move together**, along with the functions that change
   them — a cart, a multi-step wizard, a selection model.
4. **A second component needs the same logic.**

Rule 1 is the one that matters most. If the first component writes
`useQuery({ queryKey: ["products"] })` and a later one writes
`useQuery({ queryKey: ["product-list"] })`, both type check, both pass their tests, and they
hold two separate caches. Invalidating one leaves the other showing old data. Wrapping the call
in a hook from day one closes that hole permanently.

### 6.2 You must not extract a hook when

1. **The function calls no other hook.** Then it is not a hook — it is a function. Put it in
   `features/<feature>/utils.ts` or `lib/`. Quick check: if the body contains no `use*` call, it
   does not belong in `hooks/`.
2. **It only wraps a single `useState`** with no added behaviour. `useIsOpen()` adds a file and
   nothing else.
3. **You are extracting to shorten a component.** 👁️ Moving state away from the JSX that owns it
   makes the code harder to follow, not easier. A long component is not a problem; a component
   doing several unrelated jobs is.

### 6.3 Shape

- Return an object (`{ data, isLoading, refetch }`), not an array — except a two-element tuple
  that deliberately mirrors `useState`.
- One hook per file.
- A hook never returns JSX.

---

## 7. Forms

The stack is **react-hook-form + zod + `zodResolver` + the shadcn `<Form>` components**.

### 7.1 The form owns its own submission

By default, the form component holds both `useForm` and the mutation hook. The page just
renders it.

```tsx
export function SaleForm() {
  const form = useForm<SaleInput>({ resolver: zodResolver(saleSchema) });
  const { mutate, isPending } = useCreateSale();
  // ...
}
```

Switch to a presentational form — one that receives `defaultValues`, `onSubmit`, and
`isSubmitting` as props — **only when the same form submits to more than one destination**
(typically create and edit). That is the single condition.

### 7.2 Client-side zod validates shape, never business rules

The API owns every business rule. Client-side zod exists for immediate feedback, and may check
only:

- required fields, types, lengths
- formats: email, phone, postcode
- ranges that are physically true: quantity must be greater than zero

It must **not** check anything that depends on data the client does not own:

- "is there enough stock"
- "is this order still refundable"
- "does this discount exceed the cap"

Those rules live in the API. Duplicating one here means it will eventually disagree with the
real rule, and the wrong answer is the one the user sees. Let the request fail and render the
API's answer.

### 7.3 Field errors must land on fields

When the API rejects a submission with field-level errors, `onError` maps them back onto the
form with `setError`. A toast alone is not acceptable — the user cannot tell which field to fix.

Errors that belong to no field go to a toast.

Both paths go through **one shared helper in `lib/errors.ts`**. Do not write this mapping again
in each form.

```ts
onError: (error) => applyApiErrorToForm(error, form),
```

---

## 8. UI components (shadcn/ui)

Baseline: **shadcn/ui, Tailwind, CSS variables for tokens, `lucide-react` as the only icon set,
and `cn()` from `lib/utils.ts`.**

### 8.1 What you may change in `components/ui/`

| Allowed | Not allowed — wrap it instead |
|---------|------------------------------|
| Add or edit a variant inside the `cva` block (`variant`, `size`) | Add a prop shadcn does not have |
| Change classes to match design tokens | Change behaviour, add state, add `useEffect` |
| Adjust hit areas and sizing for the target device | Add data fetching or any domain logic |

Everything else is done by composing a new component in `components/shared/`.

shadcn's own position is that generated code is yours to edit. The narrower rule exists because
re-running `npx shadcn add <component>` overwrites the file **silently** — no error, no failing
build. Confining edits to the variants block keeps what is at risk small and obvious in a diff.

👁️ After running `shadcn add` on a component that already exists, read the `git diff` before
committing.

### 8.2 Install on demand

Add shadcn components one at a time, when a screen actually needs one. Never bulk-install the
library. Unused components are maintenance you get nothing for, and they tempt an agent into
using the wrong primitive because it was already there.

### 8.3 Check before building

Before writing any new UI primitive, check whether shadcn already provides it — `dialog`,
`sheet`, `command`, `popover`, `sonner`, `skeleton`, and so on. Hand-rolled modals and
dropdowns are the most common avoidable duplication in a Next.js codebase.

### 8.4 `components/ui/` knows nothing about the domain

No imports from `features/`. No data-fetching hooks. No domain types. If a file in `ui/`
mentions `Sale`, it is in the wrong folder.

---

## 9. TypeScript

- `strict: true` and `noUncheckedIndexedAccess: true`. Both are non-negotiable.
- **No `any`.** Use `unknown` and narrow, or parse with zod.
- **No non-null assertion (`!`).** Narrow the type, or handle the absent case.
- **`type` by default.** Use `interface` only when you need declaration merging.
- **No `enum`.** Use a const object plus a union type:
  ```ts
  export const PAYMENT_METHOD = { cash: "cash", qr: "qr" } as const;
  export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
  ```
- Prefer `satisfies` over a type annotation for configuration objects, so literal types survive.
- **API types come from zod schemas** via `z.infer<typeof schema>`. Never hand-write a type that
  duplicates a schema — the two will drift.
- No `React.FC`. Type the props parameter directly:
  ```ts
  type ProductCardProps = { product: Product; onSelect: (id: string) => void };
  export function ProductCard({ product, onSelect }: ProductCardProps) { ... }
  ```

---

## 10. `lib/`

`lib/` is a **closed list**. These files, and no others:

| File | Responsibility |
|------|----------------|
| `lib/utils.ts` | `cn()` only. Nothing else may be added here. |
| `lib/api-client.ts` | Browser-side fetch wrapper for `/api/*`. Adds headers, parses JSON, throws a typed `ApiError`. |
| `lib/upstream.ts` | Server-side client for the upstream API, carrying the service credential. First line is `import "server-only"`. |
| `lib/bff-allowlist.ts` | Paths the browser may reach through the proxy (§4). |
| `lib/errors.ts` | `ApiError`, upstream-error translation, and the field-error → `setError` helper (§7.3). |
| `lib/query-client.ts` | TanStack Query defaults, in one place. |
| `lib/env.ts` | Environment variables, validated with zod, split into server and client. |
| `lib/format.ts` | Currency, number, date and time formatting for the project's locale. |

### 10.1 Growing the list

A new file may be added to `lib/` **only when two or more features already need it** — the same
promotion rule as §2.3. Add it to the table above in the same pull request. `lib/` becoming a
forty-file drawer nobody dares delete from is the default outcome without this rule.

### 10.2 Dependencies point one way

`features/` → `lib/` is allowed. `lib/` → `features/`, `lib/` → `app/`, and
`lib/` → `components/` are not. If a file in `lib/` needs to import from a feature, it is not
library code.

### 10.3 `process.env` is read in exactly one file

Only `lib/env.ts` may touch `process.env`. Everywhere else imports the validated `env` object.

```ts
// src/lib/env.ts
const serverSchema = z.object({
  UPSTREAM_API_URL: z.string().url(),
  UPSTREAM_SERVICE_TOKEN: z.string().min(1),
});
```

A missing or malformed variable then fails at build time, in front of a developer, instead of at
runtime in front of a user.

### 10.4 The service credential must be impossible to leak

`lib/upstream.ts` starts with `import "server-only"`. If anything reachable from a Client
Component ever imports it, the build fails. The credential reaching the client bundle is not a
thing to be careful about; it is a thing that must not be able to happen.

---

## 11. Loading, error, and empty states

Because the app is client-first, `loading.tsx` and Suspense do very little here. Almost every
state comes from a query.

### 11.1 Four states, always

Any component that reads server data handles all four explicitly: **loading, error, empty,
content**. Skipping one is an incomplete component, not a shortcut.

### 11.2 The rules

- **Loading** is a skeleton shaped like the real content, built from the shadcn `<Skeleton>`
  component. Not a spinner, and never a bare `Loading...`. It lives in the component that owns
  the query.
- **Error** is rendered inline, in place of the content, with a retry button wired to the
  query's `refetch()`. A failed *read* is not a toast — the user is looking straight at the
  thing that failed.
- **Empty** uses one shared `<EmptyState>` component (icon, message, optional action) from
  `components/shared/`. Not an ad-hoc `<p>No data</p>` per screen.
- **Mutations** report through toasts (`sonner`): success and non-field errors. Field-level
  errors go to the form instead (§7.3).
- `error.tsx` at the route level is a last-resort boundary for render-time crashes. It is not
  where query errors are handled.

---

## 12. UI language

Each project **declares one UI language at kickoff** and records it here:

```
UI language for this project: <language>
```

Every user-facing string is written directly in that language, in the JSX. No i18n library, no
translation-key indirection.

- Identifiers, comments, commit messages, and this document stay in English.
- Do not mix languages in the interface. One language, everywhere the user can see.
- Do not display a raw error message from the API. Map it through `lib/errors.ts` first
  (§7.3) — upstream wording changes without warning, and can expose internal detail.

Add an i18n library **only if the project states a requirement for two or more languages at
kickoff.** Retrofitting it later is a mechanical refactor; carrying `t("sale.checkout.button")`
on every line for a second language that never arrives is a cost paid daily. It also makes the
code unreadable without a second file open, which is how duplicate keys get written.

---

## 13. When this document does not cover something

This is the most important rule here, because it is the one that keeps the others true.

1. **Stop and ask. Do not invent a pattern.** A new pattern introduced quietly is how a codebase
   ends up with three ways to do one thing.
2. **Look for the nearest existing example first** and follow it. Consistency with what is
   already in the repository beats being right in isolation.
3. **Do not add a dependency without asking.** The approved set is:
   `next`, `react`, `typescript`, `tailwindcss`, `shadcn/ui` (with its Radix packages),
   `lucide-react`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`,
   `zustand`, `nuqs`, `sonner`, `clsx`, `tailwind-merge`, `server-only`, and one date library.
   Anything else is a conversation.
4. **A feature spec outranks this document on *what* to build; this document outranks the spec
   on *how* to build it.** If a spec's instructions require breaking a rule here, that is a
   contradiction to raise, not to resolve alone.
5. **Never change a rule in this document as part of a feature pull request.** Conventions change
   in their own change, with their own discussion.

---

## 14. Enforcement

A rule no machine checks is a rule that decays. Most of this document can be enforced.

> Verify this configuration against the ESLint and plugin versions you install; plugin option
> shapes change between major versions.

### 14.1 Packages

```bash
npm i -D eslint-plugin-check-file eslint-plugin-import
npm i server-only
```

### 14.2 `eslint.config.mjs`

```js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import checkFile from "eslint-plugin-check-file";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

// Reusable restrictions. Note: several config objects below match the same files,
// and for a given rule the LAST matching object wins — so each zone repeats the
// full set of restrictions that apply to it rather than relying on inheritance.
const NO_CROSS_FEATURE = {
  group: ["@/features/*", "@/features/*/**"],
  message:
    "A feature must not import another feature (CONVENTIONS.md §2.2). Use relative imports inside your own feature; promote shared code to components/shared, hooks/, or lib/.",
};

const NO_DIRECT_QUERY = {
  name: "@tanstack/react-query",
  importNames: ["useQuery", "useMutation", "useInfiniteQuery", "useSuspenseQuery"],
  message:
    "Call TanStack Query only inside features/<feature>/hooks/ (CONVENTIONS.md §6.1).",
};

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // --- kebab-case files and folders, no barrels -----------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "src/**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "src/**/!(\\[*\\])/": "KEBAB_CASE" },
      ],
      // Barrel files are banned (§3.4)
      "check-file/filename-blocklist": [
        "error",
        { "src/**/index.{ts,tsx}": "*.{ts,tsx}" },
      ],
    },
  },

  // --- named exports only (§3.2) -------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: { "import/no-default-export": "error" },
  },
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/template.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/error.tsx",
      "src/app/**/global-error.tsx",
      "src/app/**/not-found.tsx",
      "src/app/**/default.tsx",
      "src/app/**/{icon,apple-icon,opengraph-image,twitter-image}.tsx",
      "src/app/{sitemap,robots,manifest}.ts",
      "src/middleware.ts",
      "*.config.{js,mjs,ts}",
    ],
    rules: { "import/no-default-export": "off" },
  },

  // --- layering (§2.2, §4.4, §6.1, §8.4, §10.2) ----------------------------
  {
    files: ["src/features/*/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [NO_CROSS_FEATURE] }],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    ignores: ["src/features/*/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [NO_CROSS_FEATURE], paths: [NO_DIRECT_QUERY] },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { paths: [NO_DIRECT_QUERY] }],
    },
  },
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [NO_CROSS_FEATURE], paths: [NO_DIRECT_QUERY] },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [NO_CROSS_FEATURE], paths: [NO_DIRECT_QUERY] },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            NO_CROSS_FEATURE,
            {
              group: ["@/app/*", "@/app/*/**", "@/hooks/*"],
              message:
                "components/ui must not know about the app or its domain (CONVENTIONS.md §8.4).",
            },
          ],
          paths: [NO_DIRECT_QUERY],
        },
      ],
    },
  },
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*", "@/features/*/**",
                "@/app/*", "@/app/*/**",
                "@/components/*", "@/components/*/**",
              ],
              message:
                "lib/ is the bottom layer and must not depend on features, app, or components (CONVENTIONS.md §10.2).",
            },
          ],
        },
      ],
    },
  },

  // --- process.env in one file only (§10.3) --------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/env.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Read environment variables only in src/lib/env.ts, then import { env } (CONVENTIONS.md §10.3).",
        },
      ],
    },
  },

  // --- TypeScript (§9) ------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Use a const object with a union type instead of an enum (CONVENTIONS.md §9).",
        },
      ],
    },
  },
];
```

### 14.3 `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### 14.4 CI

The pipeline must fail on any of: `tsc --noEmit`, `eslint .`, `prettier --check`, `next build`.
A convention that only fails locally is a convention that ships broken.

### 14.5 What still needs human eyes

These cannot be automated, and are what code review is actually for:

- §2.1 — has logic leaked into `app/`?
- §6.1–6.2 — was a hook extracted for the right reason, or to tidy up?
- §7.2 — has a business rule crept into a zod schema?
- §8.1 — does a `components/ui/` diff go beyond variants?
- §11.1 — are all four states handled?
- §13 — was an unlisted pattern or dependency introduced quietly?
