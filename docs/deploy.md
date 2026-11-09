# 部署说明

网站作者：呆胶布。

本文说明影迹介绍页如何发布到已有仓库 [CrazyGoudanli/beat](https://github.com/CrazyGoudanli/beat)。正式地址是 <https://crazygoudanli.github.io/beat/>。本地预览不是这个正式地址。不新建别的仓库，也不启用付费服务。

站点不需要环境变量、API Key、数据库或付费服务。不要把 DeepSeek、TMDB、签名文件或个人观影记录放进仓库。

## 1. 本地确认

```bash
npm install
npm run check
npm run build
```

构建成功后，`dist/` 里应有 `index.html`、`journal/`、`source/`、`about/`、`404.html` 和带哈希的静态资源。

本地查看构建结果：

```bash
npm run preview
```

然后打开 <http://127.0.0.1:4731/beat/>。这个地址只在运行命令的机器上有效。构建结果里的资源路径以 `/beat/` 开头。

核对：

- 标题、顶栏和页脚都能看到「网站作者：呆胶布」
- 正文把 Android 应用归于卜文旭 / Eames，而不是呆胶布
- 目录 12 节都能跳转
- 四张图标注为替代示意图，点击可以放大
- 「打开原站演示视频」会离开本站，指向原作者的 mp4
- 日志三篇、来源页、关于页可以打开
- 浏览器宽度约 390px 时，导航收到菜单里，作者栏仍完整可读

## 2. 仓库和路径

仓库是 <https://github.com/CrazyGoudanli/beat>。账号是 [CrazyGoudanli](https://github.com/CrazyGoudanli)（呆胶布）。

GitHub Pages 项目站点地址是 <https://crazygoudanli.github.io/beat/>。Vite `base` 固定为 `/beat/`。

`.github/workflows/pages.yml` 在 `main` 分支推送时构建并发布。

## 3. 发布结果

工作流执行 `npm install`、`npm run check` 和 `npm run build`，再上传 `dist/`。Node.js 版本是 22。

发布后的站点仍然是介绍页。不要把该 URL 描述成呆胶布开发或实测过的 Android 应用。
