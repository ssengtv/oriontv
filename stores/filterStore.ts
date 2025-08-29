
import { create } from "zustand";
import type { SearchResult } from "@/services/api";

export type SortOrder = "relevance" | "year_desc" | "year_asc" | "title_asc" | "title_desc";

export interface Filters {
  type?: string;     // 类型 (class or type_name)
  region?: string;   // 地区 (type_name fallback)
  year?: string;     // 年代 e.g., "2025"
  platform?: string; // 平台 source_name
  sort?: SortOrder;  // 排序
}

interface FilterState {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value?: Filters[K]) => void;
  clearFilters: () => void;
  filterResults: (results: SearchResult[]) => SearchResult[];
  computeFacetOptions: (results: SearchResult[]) => {
    years: string[];
    types: string[];
    regions: string[];
    platforms: string[];
  };
}

const norm = (s?: string) => (s || "").trim().toLowerCase();

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: { sort: "relevance" },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: { sort: "relevance" } }),
  filterResults: (results) => {
    const { filters } = get();
    const by = results.filter((r) => {
      const type = r.class || r.type_name || "";
      const region = r.type_name || "";
      const year = r.year || "";
      const platform = r.source_name || r.source || "";

      if (filters.type && norm(type) !== norm(filters.type)) return false;
      if (filters.region && norm(region) !== norm(filters.region)) return false;
      if (filters.year && norm(year) !== norm(filters.year)) return false;
      if (filters.platform && norm(platform) !== norm(filters.platform)) return false;
      return true;
    });

    const sort = filters.sort || "relevance";
    const toNum = (y: string) => parseInt((y || "").replace(/\D/g, "")) || 0;
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    switch (sort) {
      case "year_desc":
        return [...by].sort((a, b) => toNum(b.year) - toNum(a.year));
      case "year_asc":
        return [...by].sort((a, b) => toNum(a.year) - toNum(b.year));
      case "title_asc":
        return [...by].sort((a, b) => collator.compare(a.title, b.title));
      case "title_desc":
        return [...by].sort((a, b) => collator.compare(b.title, a.title));
      default:
        return by;
    }
  },
  computeFacetOptions: (results) => {
    const setYears = new Set<string>();
    const setTypes = new Set<string>();
    const setRegions = new Set<string>();
    const setPlatforms = new Set<string>();
    for (const r of results) {
      if (r.year) setYears.add(r.year);
      if (r.class) setTypes.add(r.class);
      if (r.type_name) setRegions.add(r.type_name);
      if (r.source_name) setPlatforms.add(r.source_name);
      else if (r.source) setPlatforms.add(r.source);
    }
    const sortDesc = (arr: string[]) => arr.sort((a,b) => (parseInt(b)||0)-(parseInt(a)||0));
    return {
      years: sortDesc(Array.from(setYears)),
      types: Array.from(setTypes).sort(),
      regions: Array.from(setRegions).sort(),
      platforms: Array.from(setPlatforms).sort(),
    };
  },
}));
