# OrionTV 筛选功能补丁说明

本补丁在 Android/TV 端增加了与网页版类似的筛选功能，支持：**类型、地区（启发式识别）、年代、平台、排序**。

## 改动列表
- `components/FilterBar.tsx`：新增筛选条与弹窗 UI，可在遥控器/触摸上操作。
- `stores/filterStore.ts`：新增全局筛选状态（Zustand），并提供 filterResults() 对结果进行过滤与排序。
- `app/search.tsx`：集成 FilterBar，并对搜索结果应用筛选。
- `app/index.tsx`：在主页也集成 FilterBar（对当前播放源结果应用筛选）。

> 地区（Region）基于标题/简介/类型中的关键词进行启发式判断（如“香港”“台湾”“内地”“韩国”“日本”“欧美”）。如果后端将来提供明确的地区字段，可在 `stores/filterStore.ts` 的 `guessRegion()` 中替换为直接读取。

## 使用方法
1. 将本补丁覆盖至原项目根目录（或使用 `git apply` 应用补丁）。
2. 进入设置里确保已配置正确的 `API Base URL`（即部署的 LunaTV/moontv 地址）。
3. 重新构建 APK：
   ```bash
   npm install
   npx expo run:android
   ```
4. 打开 Android/TV 端：
   - 进入 **搜索** 页面后会在顶部看到“筛选”按钮；
   - 也在首页上方集成了筛选条；
   - 可按 **年代=2025** + **类型=港剧**，并设置“排序：最新→最旧”。

## 兼容性
- 需要项目内已存在的 `@/services/api` 与 `useResponsiveLayout`、`StyledButton`、`ThemedText` 等组件/钩子。
- 平台列表（平台=站点来源）来源于搜索结果的 `source/source_name` 字段；若后端启用了多个资源源站，筛选会一起展示。

## 代码入口
- `components/FilterBar.tsx` UI 入口；
- `stores/filterStore.ts` 维护筛选状态与过滤逻辑；
- `app/search.tsx`、`app/index.tsx` 两个页面集成。

如果你希望把“地区”切换为从后端获取，请把 `guessRegion()` 替换为读取真实字段并去掉启发式部分即可。
