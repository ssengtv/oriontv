import { create } from "zustand";

export type Filters = {
  type: string;
  region: string;
  year: string;
  platform: string;
  sort: string;
  setFilter: (key: keyof Filters, value: string) => void;
};

export const useFilterStore = create<Filters>((set) => ({
  type: "全部",
  region: "全部",
  year: "全部",
  platform: "全部",
  sort: "默认",
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export function filterResults(results: any[] = [], filters: Filters) {
  return results.filter((item) => {
    const title = (item?.title ?? "").toLowerCase();
    const desc = (item?.desc ?? "").toLowerCase();
    const type = (item?.type_name ?? item?.class ?? "").toLowerCase();
    const region = title + desc + type;
    const year = (item?.year ?? item?.date ?? "").toString();
    const source = (item?.source_name ?? item?.source ?? item?.platform ?? "").toLowerCase();

    if (filters.type !== "全部" && !type.includes(filters.type.toLowerCase())) return false;
    if (filters.region !== "全部") {
      const regMap: any = {
        "香港": ["hk", "hongkong", "香港"],
        "台湾": ["tw", "taiwan", "台湾"],
        "内地": ["cn", "china", "内地", "大陆"],
        "日本": ["jp", "japan", "日本"],
        "韩国": ["kr", "korea", "韩国"],
        "欧美": ["us", "uk", "america", "europe", "欧美"]
      };
      const keys = regMap[filters.region] ?? [];
      if (!keys.some((k: string) => region.includes(k))) return false;
    }
    if (filters.year !== "全部") {
      if (!year.includes(filters.year)) return false;
    }
    if (filters.platform !== "全部" && !source.includes(filters.platform.toLowerCase())) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sort === "最新") {
      return (parseInt(b?.year) || 0) - (parseInt(a?.year) || 0);
    }
    if (filters.sort === "标题") {
      return (a?.title ?? "").localeCompare(b?.title ?? "");
    }
    return 0;
  });
}
