# Cloudflare Pages 部署与迭代指南

本教程将你的网络拓扑学习平台部署到 Cloudflare Pages 并绑定自定义域名。

---

## 一、准备工作

项目已就绪，无需额外配置。构建产物位于 `dist/` 目录，`public/_redirects` 已配置好 SPA 路由规则。

```bash
# 本地构建验证
npm install
npm run build
# 产物在 dist/ 目录
```

---

## 二、部署方式对比

| 方式 | 适合场景 | 更新速度 |
|------|----------|----------|
| **Git 集成**（推荐） | 正式部署 | `git push` 后自动构建，约 1-2 分钟 |
| **Wrangler CLI** | 快速迭代测试 | 一条命令，约 5-10 秒 |
| **直接上传** | 一次性部署 | 手动拖拽上传 |

---

## 三、方式一：Git 集成自动部署（推荐）

这是最常用的方式，推送代码后 Cloudflare 自动构建并部署。

### 3.1 将项目推送到 GitHub/GitLab

```bash
cd /claude/web-studio

# 初始化 Git 仓库
git init
git add .
git commit -m "初始化网络拓扑学习平台"

# 推送到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/network-lab.git
git branch -M main
git push -u origin main
```

### 3.2 在 Cloudflare Pages 创建项目

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单进入 **Workers & Pages** → 点击 **创建** → **Pages**
3. 选择 **连接到 Git**，授权你的 GitHub/GitLab 账号
4. 选择你刚才推送的仓库

### 3.3 配置构建设置

| 配置项 | 值 |
|--------|-----|
| **生产分支** | `main` |
| **构建命令** | `npm install && npm run build` |
| **构建输出目录** | `dist` |
| **Node.js 版本** | `18.x` 或更高 |

点击 **保存并部署**，Cloudflare 会立即开始首次构建。

### 3.4 绑定自定义域名

1. 部署完成后，进入项目 → **自定义域**
2. 点击 **设置自定义域**
3. 输入你的域名（如 `network-lab.你的域名.com`）
4. Cloudflare 会自动配置 DNS 记录（如果域名也在 Cloudflare 管理）

如果域名不在 Cloudflare 管理：
- 添加 CNAME 记录指向 `你的项目名.pages.dev`

---

## 四、方式二：Wrangler CLI 快速部署

适合快速迭代测试，秒级部署。

### 4.1 安装 Wrangler

```bash
npm install -g wrangler
```

### 4.2 登录 Cloudflare

```bash
wrangler login
```

浏览器会自动打开，授权即可。

### 4.3 部署

```bash
# 先构建
npm run build

# 部署 dist 目录
wrangler pages deploy dist --project-name=network-lab
```

首次部署需要指定项目名，后续只需：

```bash
npm run build && wrangler pages deploy dist --project-name=network-lab
```

### 4.4 绑定自定义域名

```bash
# 查看已有项目
wrangler pages project list

# 添加自定义域
wrangler pages project add-custom-domain network-lab 你的域名.com
```

---

## 五、快速迭代工作流

### 推荐流程：Git + 预览部署

Cloudflare Pages 支持**预览部署**，每个分支/PR 自动生成预览 URL。

```
日常开发流程：

1. 本地开发      npm run dev           → localhost:5173
2. 提交代码      git add . && git commit && git push
3. 自动部署      Cloudflare 检测到 push → 自动构建部署到生产
```

### 预览分支（可选）

```bash
# 创建功能分支
git checkout -b feature/vlan-config

# 推送后 Cloudflare 自动生成预览 URL
git push -u origin feature/vlan-config
# 预览地址：https://feature-vlan-config.network-lab-xxx.pages.dev
```

### 快捷脚本

在 `package.json` 中添加快捷命令：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "deploy": "npm run build && wrangler pages deploy dist --project-name=network-lab"
  }
}
```

之后只需：

```bash
npm run deploy   # 构建 + 部署，一条命令
```

---

## 六、生产环境优化建议

### 6.1 环境变量

如果有 API 地址等环境变量，在 Cloudflare Pages → **设置** → **环境变量** 中添加。

在代码中使用：
```ts
const API_URL = import.meta.env.VITE_API_URL;
```

### 6.2 缓存策略

Cloudflare Pages 自动缓存静态资源，无需额外配置。`dist/assets/` 下的 JS/CSS 文件带有内容哈希（如 `index-qpbvkcH9.js`），天然支持长期缓存。

### 6.3 自定义 Headers

如需配置安全头，在 `public/_headers` 中添加：

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 七、常见问题

### Q: 构建失败？
- 检查 Node.js 版本 ≥ 18
- 确保 `package-lock.json` 已提交到 Git
- 在 Cloudflare Pages 设置中查看构建日志

### Q: 页面刷新后 404？
- 确认 `public/_redirects` 文件存在且内容为 `/* /index.html 200`

### Q: 自定义域名无法访问？
- 确认 DNS 记录已生效（可能需要几分钟到几小时）
- Cloudflare 托管的域名会自动配置，非 Cloudflare 域名需手动添加 CNAME

### Q: 如何回滚？
- Git 方式：`git revert` 并 push，或 Cloudflare 部署历史中一键回滚到之前的部署
- Wrangler 方式：`wrangler pages deployment list --project-name=network-lab` 查看历史，然后用 `wrangler pages deploy` 重新部署旧版本
