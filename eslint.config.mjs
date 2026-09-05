import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import checkFile from "eslint-plugin-check-file";

const noDirectQuery = { name: "@tanstack/react-query", importNames: ["useQuery", "useMutation", "useInfiniteQuery", "useSuspenseQuery"], message: "TanStack Query ต้องอยู่ใน features/<feature>/hooks/ เท่านั้น" };

export default defineConfig([
  ...nextVitals, ...nextTs, globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  { files: ["src/**/*.{ts,tsx}"], plugins: { "check-file": checkFile, import: importPlugin }, rules: {
    "check-file/filename-naming-convention": ["error", { "src/**/*.{ts,tsx}": "KEBAB_CASE" }, { ignoreMiddleExtensions: true }],
    "check-file/folder-naming-convention": ["error", { "src/**/!(\\[*\\])/": "KEBAB_CASE" }],
    "check-file/filename-blocklist": ["error", { "src/**/index.{ts,tsx}": "*.{ts,tsx}" }],
    "import/no-default-export": "error", "@typescript-eslint/no-explicit-any": "error", "@typescript-eslint/no-non-null-assertion": "error", "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "no-restricted-syntax": ["error", { selector: "TSEnumDeclaration", message: "ใช้ const object แทน enum" }],
  } },
  { files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/app/**/route.ts", "src/app/**/error.tsx"], rules: { "import/no-default-export": "off" } },
  { files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"], rules: { "no-restricted-imports": ["error", { paths: [noDirectQuery] }] } },
  { files: ["src/features/**/*.{ts,tsx}"], ignores: ["src/features/*/hooks/**/*.{ts,tsx}"], rules: { "no-restricted-imports": ["error", { paths: [noDirectQuery], patterns: ["@/features/*", "@/features/*/**"] }] } },
  { files: ["src/lib/**/*.{ts,tsx}"], rules: { "no-restricted-imports": ["error", { patterns: ["@/features/*", "@/features/*/**", "@/app/*", "@/app/*/**", "@/components/*", "@/components/*/**"] }] } },
  { files: ["src/**/*.{ts,tsx}"], ignores: ["src/lib/env.ts"], rules: { "no-restricted-properties": ["error", { object: "process", property: "env", message: "อ่าน environment ผ่าน src/lib/env.ts เท่านั้น" }] } },
]);
