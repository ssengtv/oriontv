import { create } from 'zustand';
import { SearchResult } from '@/services/api';

// 标准化地区关键词映射
const REGION_MAP: Record<string, string> = {
  '中国大陆': '中国大陆',
  '内地': '中国大陆',
  '大陆': '中国大陆',
  '香港': '香港',
  '港': '香港',
  '台湾': '台湾',
  '台': '台湾',
  '日本': '日本',
  '韩国': '韩国',
  '欧美': '欧美',
  '美国': '美国',
  '英国': '英国',
  '泰国': '泰国',
  '印度': '印度',
  '新加坡': '新加坡',
  '马来西亚': '马来西亚',
  '西班牙': '西班牙',
  '法国': '法国',
  '德国': '德国',
};

export type SortOption = '默认' | '最新' | '标题';

export interface Filters {
  type?: string | null;
  region?: string | null;
  year?: string | null;
  platform?: string | null; // source or source_name
  sort?: SortOption;
}

interface FilterState extends Filters {
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  // 根据当前筛选器筛选结果
  filterResults: (list: SearchResult[]) => SearchResult[];
}

// 解析年份（支持 '2025' 或 '2025-xx' 等）
const parseYear = (raw?: string | null): number => {
  if (!raw) return 0;
  const m = /\d{4}/.exec(String(raw));
  if (!m) return 0;
  return parseInt(m[0], 10);
};

// 检测地区（从 type_name / class / desc / title 中尽量识别）
const detectRegion = (item: SearchResult): string | null => {
  const haystack = `${item.type_name ?? ''} ${item.class ?? ''} ${item.desc ?? ''} ${item.title ?? ''}`;
  // 优先匹配完整词，再匹配简称
  for (const [k, v] of Object.entries(REGION_MAP)) {
    if (k.length > 1 && haystack.includes(k)) return v;
  }
  for (const [k, v] of Object.entries(REGION_MAP)) {
    if (k.length === 1 && haystack.includes(k)) return v;
  }
  return null;
};

// 归一化类型文本
const normalizeType = (item: SearchResult): string => {
  const raw = (item.type_name || item.class || '').toLowerCase();
  return raw;
};

// 归一化平台文本
const normalizePlatform = (item: SearchResult): string => {
  return (item.source_name || item.source || '').toLowerCase();
};

export const useFilterStore = create<FilterState>((set, get) => ({
  type: null,
  region: null,
  year: null,
  platform: null,
  sort: '默认',

  setFilter: (key, value) => set({ [key]: value } as Partial<FilterState>),

  resetFilters: () => set({
    type: null,
    region: null,
    year: null,
    platform: null,
    sort: '默认',
  }),

  filterResults: (list: SearchResult[]) => {
    const { type, region, year, platform, sort } = get();

    let filtered = list.map((item) => ({
      ...item,
      __year: parseYear(item.year),
      __region: detectRegion(item),
      __type: normalizeType(item),
      __platform: normalizePlatform(item),
    })) as (SearchResult & { __year: number; __region: string | null; __type: string; __platform: string; })[];

    if (type && type !== '全部') {
      const t = type.toLowerCase();
      filtered = filtered.filter(i => i.__type.includes(t));
    }

    if (region && region !== '全部') {
      filtered = filtered.filter(i => i.__region === region);
    }

    if (year && year !== '全部') {
      const y = parseInt(year, 10);
      filtered = filtered.filter(i => i.__year === y);
    }

    if (platform && platform !== '全部') {
      const p = platform.toLowerCase();
      filtered = filtered.filter(i => i.__platform.includes(p));
    }

    if (sort === '最新') {
      filtered = filtered.sort((a, b) => b.__year - a.__year || Number(b.id) - Number(a.id));
    } else if (sort === '标题') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
    }
    // 默认：保持原顺序
    return filtered;
  },
}));
