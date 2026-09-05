# AGENTS.md

Read this before writing any code in this repository.

This is the short form. The full rules are in **`CONVENTIONS.md`** — read it before any
non-trivial change, and whenever this file is silent. **If the two disagree,
`CONVENTIONS.md` wins.**

---

## What this app is

Next.js is a **Backend-for-Frontend only**. It owns no database, no ORM, and no business rules —
a separate API owns all of them. The browser never calls that API directly; every request goes
through our own `/api/*` routes, which resolve and forward the user's OAuth bearer token without
exposing it to client JavaScript. The companion NestJS API uses `/api/v1`, UUIDs, ISO timestamps,
`{ data, meta }` list responses, permissions such as `tasks:read`, and structured errors.

Screens are **client-first**: Client Components reading server state through TanStack Query.

---

## The rules broken most often

1. **Never call `useQuery` or `useMutation` in a component.** Every one lives in
   `src/features/<feature>/hooks/use-*.ts`, from the very first use, even with one caller.
   Query keys come from the feature's `query-keys.ts` — never write a key inline.

2. **Never copy server state into client state.** `useEffect(() => setX(data), [data])` is
   forbidden with no exception. Derive at render, or use the query's `select`.

3. **A feature must never import another feature.** `features/sale` may not touch
   `features/expense` at any depth. Promote shared code to `components/shared/`, `hooks/`, or
   `lib/` — and only once a *second* feature actually needs it, never in anticipation.

4. **`app/` contains no logic.** Read params, render a feature component, set metadata. That is
   all. If `page.tsx` passes ~50 lines, logic has leaked.

5. **Adding an upstream endpoint is one line in `src/lib/bff-allowlist.ts`.** Write a dedicated
   route handler only to combine 2+ upstream calls, reshape a payload, handle an upload/stream,
   or touch a non-session cookie. Nothing else.

6. **Client-side zod validates shape, never business rules.** Required, type, length, format,
   physically-true ranges — yes. Stock levels, refund windows, discount caps — no, those belong
   to the API. Let the request fail and show the API's answer.

7. **API field errors go onto the fields.** Map them with `setError` through the shared helper
   in `lib/errors.ts`. A toast alone is not acceptable for a form. Never show a raw upstream
   error message to a user.

8. **Check shadcn before building a UI primitive.** `dialog`, `sheet`, `command`, `popover`,
   `skeleton`, `sonner` already exist. Install them one at a time, when needed. In
   `components/ui/` you may edit `cva` variants and token classes only — never add props,
   state, or logic; wrap the component in `components/shared/` instead.

9. **Handle all four states** for anything reading server data: loading (a `<Skeleton>` shaped
   like the content — not a spinner, not `Loading...`), error (inline, with a retry calling
   `refetch()`), empty (the shared `<EmptyState>`), content.

10. **The BFF forwards the user's OAuth access token to NestJS.** Resolve it from the server-side
session; never expose it to client JavaScript. `process.env` is read only in `src/lib/env.ts`.
Import `{ env }` everywhere else.
    `lib/upstream.ts` must keep its `import "server-only"` first line.

---

## Naming and exports

- **kebab-case** for every file and folder — `product-card.tsx` exporting `ProductCard`.
- **Named exports only**, except where Next.js requires a default (`page`, `layout`, `error`,
  `not-found`, `middleware`, metadata and config files).
- **No `index.ts` barrel files.** Import from the full path.
- One exported component per file.
- Inside your own feature use **relative** imports; outside it use **`@/`**.
- Booleans `is`/`has`/`can`; function props `onX`, handlers `handleX`; props type
  `<Component>Props` in the same file.

## TypeScript

No `any`. No `!`. No `enum` (const object + union). `type` over `interface`. API types come from
`z.infer<typeof schema>` — never hand-write a duplicate. No `React.FC`.

## Custom hooks

Extract when: calling TanStack Query, syncing with something outside React, 3+ pieces of related
state moving together, or a second component needs the logic.

Do **not** extract when: the function calls no other hook (that is a plain function — put it in
`utils.ts` or `lib/`), it only wraps one `useState`, or you are just shortening a component.

Return an object, not an array. One hook per file. Never return JSX.

## UI language

This project uses one UI language, declared in `CONVENTIONS.md` §12. Write user-facing strings
directly in that language, in the JSX. No i18n library, no translation keys, no mixing.
Identifiers and comments stay in English.

---

## When this file does not cover something

**Stop and ask. Do not invent a pattern.** Look for the nearest existing example in the
repository and follow it. Do not add a dependency without asking. A feature spec decides *what*
to build; `CONVENTIONS.md` decides *how*. Never change a convention as part of a feature change.
