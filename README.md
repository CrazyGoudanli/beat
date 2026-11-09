# 影迹 · YingJi 介绍页

**网站作者：呆胶布**

这是一个静态介绍站，用来按公开资料说明 Android 应用「影迹」。应用由卜文旭 / Eames（GitHub：`b2913336346-code`）开发，仓库许可为 MIT。呆胶布编写本网站，没有开发该应用，也没有做版本验证、安装测试或模型调用。

原介绍页：<https://b2913336346-code.github.io/project/yingji/>

原应用仓库：<https://github.com/b2913336346-code/YingJi>

本页是独立实现。原介绍页仓库在 2026-11-09 查看时没有公开许可，因此没有复制它的代码、截图、视频和站点图标。差别写在站内「来源」页和 [NOTICE.md](NOTICE.md)。

发布仓库是 [CrazyGoudanli/beat](https://github.com/CrazyGoudanli/beat)。GitHub Pages 地址是 <https://crazygoudanli.github.io/beat/>。构建用的资源前缀是 `/beat/`。本地打开的地址只是预览，不是正式部署。说明见 [docs/deploy.md](docs/deploy.md)。

## 本地运行

需要 Node.js 22。

```bash
npm install
npm run check
npm run dev
```

本地开发服务器在 <http://127.0.0.1:4731/beat/>，因为页面资源前缀是 `/beat/`。

页面包括：

- `/beat/` 项目介绍：目录、概述、功能、推荐流程、示意图、日志入口
- `/beat/journal/` 以及三篇阶段记录
- `/beat/source/` 来源与许可
- `/beat/about/` 关于本站

介绍页的目录可以展开并跳到对应章节。手机导航、明暗切换和示意图放大不依赖后端。关闭 JavaScript 时，正文、目录和链接仍可阅读；窄屏导航会改为直接展开。

## 构建

```bash
npm run build
npm run preview
```

`dist/` 是可部署的静态文件。Vite `base` 为 `/beat/`，对应 GitHub Pages 项目站点 `https://crazygoudanli.github.io/beat/`。

## 许可

介绍页源码见 [LICENSE](LICENSE)（MIT，版权人：呆胶布）。应用版权和原介绍页素材的边界见 [NOTICE.md](NOTICE.md)。
