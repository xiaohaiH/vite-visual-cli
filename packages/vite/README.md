# @xiaohaih/vite-visual-cli

## 项目简介

@xiaohaih/vite-visual-cli 是一个基于 Vite 的可视化 CLI 工具, 旨在提升前端开发效率, 支持可视化页面管理和模块生成, 适用于 Vue3 + Element Plus 项目(需配合内置模板使用)

## 安装方法

```bash
pnpm i -D @xiaohaih/vite-visual-cli
```

## 使用说明

在 Vite 配置文件（vite.config.ts）中引入并使用插件：

```ts
import { visualPage } from '@xiaohaih/vite-visual-cli';

export default {
    plugins: [visualPage()]
};
```

启动开发服务器后, 可通过(**/\_\_visual-page\_\_**)访问可视化管理界面, 或通过 toggleOverlay 方法来打开弹窗

更多详细用法请参考[项目主页](https://github.com/xiaohaiH/vite-vue-visual-cli/tree/master)

## 贡献指南

欢迎提交 issue 和 PR！

1. Fork 本仓库
2. 新建分支 (`git checkout -b feature-xxx`)
3. 提交更改 (`git commit -am 'feat: 新功能'`)
4. 推送到分支 (`git push origin feature-xxx`)
5. 创建 Pull Request

## 许可证

MIT

---

如有建议或问题, 欢迎提 issue！
