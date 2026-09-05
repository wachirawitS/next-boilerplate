export const BFF_ALLOWLIST = ["/example/products"] as const;

export function isAllowedBffPath(path: string) {
  return BFF_ALLOWLIST.includes(`/${path}` as (typeof BFF_ALLOWLIST)[number]);
}
