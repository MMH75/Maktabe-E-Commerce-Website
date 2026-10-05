// Sort options for book lists (no db imports: used by the client-side sort menu too).

export const SORTS = [
  { value: "default", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export function toSort(value: string | string[] | undefined): SortValue {
  return SORTS.some((s) => s.value === value) ? (value as SortValue) : "default";
}
