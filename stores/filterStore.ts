import { create } from "zustand";
import { SearchResult } from "@/services/api";

export type SortOrder = "yearDesc" | "yearAsc" | "titleAsc" | "titleDesc";

export interface FiltersState {
  // selections
  selectedTypes: Set<string>;
  selectedRegions: Set<string>;
  selectedYears: Set<string>;
  selectedSources: Set<string>; // source keys
  sortOrder: SortOrder;

  // derived filtering
  filterResults: (results: SearchResult[]) => SearchResult[];

  // actions
  toggleType: (t: string) => void;
  toggleRegion: (r: string) => void;
  toggleYear: (y: string) => void;
  toggleSource: (s: string) => void;
  setSortOrder: (o: SortOrder) => void;
  clearAll: () => void;
}

// Heuristic: derive region from available text fields
export function guessRegion(item: SearchResult): string | null {
  const hay = `${item.title}|${item.desc || ""}|${item.class || ""}|${item.type_name || ""}`;
  if (/香港|港剧|港/iu.test(hay)) return "香港";
  if (/台湾|台剧/iu.test(hay)) return "台湾";
  if (/内地|大陆|国产/iu.test(hay)) return "内地";
  if (/韩国|韩剧/iu.test(hay)) return "韩国";
  if (/日本|日剧/iu.test(hay)) return "日本";
  if (/欧美|美国|英国|英剧|美剧|欧洲/iu.test(hay)) return "欧美";
  return null;
}

export const useFilterStore = create<FiltersState>((set, get) => ({
  selectedTypes: new Set(),
  selectedRegions: new Set(),
  selectedYears: new Set(),
  selectedSources: new Set(),
  sortOrder: "yearDesc",

  filterResults: (results) => {
    const { selectedTypes, selectedRegions, selectedYears, selectedSources, sortOrder } = get();
    let filtered = results.slice();

    if (selectedTypes.size > 0) {
      filtered = filtered.filter((r) => {
        const classes = (r.class || "").split(/[,/|、\s]+/).filter(Boolean);
        return classes.some((c) => selectedTypes.has(c));
      });
    }

    if (selectedRegions.size > 0) {
      filtered = filtered.filter((r) => {
        const region = guessRegion(r);
        return region ? selectedRegions.has(region) : false;
      });
    }

    if (selectedYears.size > 0) {
      filtered = filtered.filter((r) => r.year && selectedYears.has(r.year));
    }

    if (selectedSources.size > 0) {
      filtered = filtered.filter((r) => selectedSources.has(r.source));
    }

    // sort
    filtered.sort((a, b) => {
      if (sortOrder === "yearDesc" || sortOrder === "yearAsc") {
        const ya = parseInt(a.year || "0", 10) || 0;
        const yb = parseInt(b.year || "0", 10) || 0;
        return sortOrder === "yearDesc" ? yb - ya : ya - yb;
      }
      // title
      const ta = (a.title || "").localeCompare(b.title || undefined, "zh-Hans-CN");
      return sortOrder === "titleAsc" ? ta : -ta;
    });

    return filtered;
  },

  toggleType: (t) => set((s) => {
    const next = new Set(s.selectedTypes);
    if (next.has(t)) next.delete(t); else next.add(t);
    return { selectedTypes: next };
  }),

  toggleRegion: (r) => set((s) => {
    const next = new Set(s.selectedRegions);
    if (next.has(r)) next.delete(r); else next.add(r);
    return { selectedRegions: next };
  }),

  toggleYear: (y) => set((s) => {
    const next = new Set(s.selectedYears);
    if (next.has(y)) next.delete(y); else next.add(y);
    return { selectedYears: next };
  }),

  toggleSource: (src) => set((s) => {
    const next = new Set(s.selectedSources);
    if (next.has(src)) next.delete(src); else next.add(src);
    return { selectedSources: next };
  }),

  setSortOrder: (o) => set({ sortOrder: o }),

  clearAll: () => set({
    selectedTypes: new Set(),
    selectedRegions: new Set(),
    selectedYears: new Set(),
    selectedSources: new Set(),
    sortOrder: "yearDesc",
  }),
}));
