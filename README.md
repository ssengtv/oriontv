# OrionTV (Clean Minimal Build)

一个最小可运行的 Expo Router 项目，包含首页“年份筛选”功能（位于首页顶部）。
已针对你的 GitHub Actions 工作流：`yarn prebuild` + `yarn build` 进行配置。

## 本地运行
```bash
yarn
yarn prebuild
yarn build   # 产出 android/app/build/outputs/apk/release/app-release.apk
```

> 注意：此仓库为“可构建演示骨架”，不包含你之前仓库中的播放/搜索等复杂逻辑。
你可以在此基础上逐步迁移原有功能。
