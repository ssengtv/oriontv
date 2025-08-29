import { create } from "zustand";
import { api, SearchResult, PlayRecord } from "@/services/api";
import { PlayRecordManager } from "@/services/storage";
import useAuthStore from "./authStore";
import { useSettingsStore } from "./settingsStore";

export type RowItem = (SearchResult | PlayRecord) & {
  id: string;
  source: string;
  title: string;
  poster: string;
  progress?: number;
  play_time?: number;
  lastPlayed?: number;
  episodeIndex?: number;
  sourceName?: string;
  totalEpisodes?: number;
  year?: string;
  rate?: string;
};

export interface Category {
  title: string;
  type?: "movie" | "tv" | "record";
  tag?: string;
  tags?: string[];
}

const initialCategories: Category[] = [
  { title: "最近播放", type: "record" },
  { title: "热门剧集", type: "tv", tag: "热门" },
  { title: "电视剧", type: "tv", tags: ["国产剧", "美剧", "英剧", "韩剧", "日剧", "港剧", "日本动画", "动画"] },
  {
    title: "电影",
    type: "movie",
    tags: [
      "热门",
      "最新",
      "经典",
      "豆瓣高分",
      "冷门佳片",
      "华语",
      "欧美",
      "韩国",
      "日本",
      "动作",
      "喜剧",
      "爱情",
      "科幻",
      "悬疑",
      "恐怖",
    ],
  },
  { title: "综艺", type: "tv", tag: "综艺" },
  { title: "豆瓣 Top250", type: "movie", tag: "top250" },
];

interface HomeState {
  selectedYear: string | null;
  categories: Category[];
  selectedCategory: Category;
  contentData: RowItem[];
  loading: boolean;
  loadingMore: boolean;
  pageStart: number;
  hasMore: boolean;
  error: string | null;
  fetchInitialData: () => Promise<void>;
  loadMoreData: () => Promise<void>;
  selectCategory: (category: Category) => void;
  refreshPlayRecords: () => Promise<void>;
  clearError: () => void;
  setSelectedYear: (year: string | null) => void;
}

// 内存缓存，应用生命周期内有效
const dataCache = new Map<string, RowItem[]>();

const useHomeStore = create<HomeState>((set, get) => ({
  categories: initialCategories,
  selectedCategory: initialCategories[0],
    selectedYear: null,
  contentData: [],
  loading: true,
  loadingMore: false,
  pageStart: 0,
  hasMore: true,
  error: null,

  fetchInitialData: async () => {
    try {
      const { selectedCategory, selectedYear, selectedTag } = get();
      // Year-selected mode: use search API once (no pagination)
      if (selectedYear) {
        const queryParts: string[] = [];
        if (selectedTag) queryParts.push(selectedTag);
        else if (selectedCategory?.title) queryParts.push(selectedCategory.title);
        queryParts.push(selectedYear);
        const query = queryParts.join(" ");
        const res = await api.searchVideos(query);
        const list: RowItem[] = res.results.map((item) => ({
          id: String(item.id),
          title: item.title,
          poster: item.poster,
          rate: item.rate,
          source: item.source,
          sourceName: item.source_name,
          year: item.year,
          episodes: item.episodes,
          episodes_max: item.episodes_max,
        }));
        set({
          contentData: list,
          pageStart: 0,
          hasMore: false,
          loading: false,
          error: null,
          currentCacheKey: query,
        });
        return;
      }

      const cacheKey = `${selectedCategory.title}-${selectedCategory.tag || ''}`;
      // 如果缓存中已有数据则直接使用
      if (dataCache.has(cacheKey)) {
        set({ 
          contentData: dataCache.get(cacheKey)!,
          pageStart: dataCache.get(cacheKey)!.length, 
          hasMore: false, 
          error: null 
        });
        return;
      }
      
      set({ loading: true, contentData: [], pageStart: 0, hasMore: true, error: null });
      await get().loadMoreData();
    } catch (error) {
      console.error('fetchInitialData error:', error);
      // 尝试回退到缓存或空数据
      set({ loading: false, hasMore: false, error: '加载失败' });
    }
  },

  loadMoreData: async () => {
    const { selectedCategory, selectedTag, selectedYear, pageStart, contentData } = get();
    // Year-selected mode: no pagination; already loaded in fetchInitialData
    if (selectedYear) {
      set({ hasMore: false, loading: false });
      return;
    }
    try {
      set({ loading: true, error: null });
      
      if (selectedCategory.title === '最近播放') {
        // 获取播放记录
        const { records, hasMore } = await useRecordStore.getState().fetchRecords({ start: pageStart, limit: 20 });
        const list: RowItem[] = records.map(item => ({
          id: item.id,
          title: item.title,
          poster: item.poster,
          rate: item.rate,
          source: item.source,
          sourceName: item.sourceName,
          url: item.url,
          episodes: item.episodes,
          episodes_max: item.episodes_max,
        }));
        
        const newContent = [...contentData, ...list];
        set({
          contentData: newContent,
          pageStart: pageStart + records.length,
          hasMore,
          loading: false,
        });
        return;
      }

      // 根据选择的标签获取数据
      const tagToUse = selectedTag || selectedCategory.tag;
      const list = await api.getDoubanData(tagToUse as any, pageStart);
      const mapped: RowItem[] = list.map(item => ({
        id: item.title,
        title: item.title,
        poster: item.poster,
        rate: item.rate,
        source: 'douban',
        sourceName: '豆瓣',
      }));
      
      const merged = [...contentData, ...mapped];
      const cacheKey = `${selectedCategory.title}-${selectedCategory.tag || ''}`;
      dataCache.set(cacheKey, merged);
      
      set({
        contentData: merged,
        pageStart: pageStart + list.length,
        hasMore: list.length > 0,
        loading: false,
        currentCacheKey: cacheKey,
      });
    } catch (error) {
      console.error('loadMoreData error:', error);
      set({ loading: false, hasMore: false, error: '加载失败' });
    }
  },
setSelectedYear: (year) => set({ selectedYear: year }),
    
