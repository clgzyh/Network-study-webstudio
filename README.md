# 网络拓扑学习平台

基于 React + TypeScript + Vite 构建的网络拓扑设计与配置学习平台，支持拖拽式拓扑搭建、多厂商设备配置生成、网络通信验证等功能。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 8
- **样式方案**: Tailwind CSS 3
- **拓扑画布**: @xyflow/react (ReactFlow) 12
- **状态管理**: Zustand 4 + Immer
- **图标库**: Lucide React
- **UI 组件**: Radix UI

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后浏览器访问终端输出的地址（默认 `http://localhost:5173`），支持热模块替换（HMR），代码修改即时生效。

### 生产构建

```bash
npm run build
```

该命令分两步执行：

1. `tsc -b` — TypeScript 类型检查，确保类型安全
2. `vite build` — Vite 打包构建，产物输出至 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

本地预览构建产物，用于在部署前验证构建结果。

### 代码检查

```bash
npm run lint
```

运行 ESLint 进行静态代码分析。

## 项目结构

```
src/
├── App.tsx                    # 应用根组件，ReactFlowProvider 包裹
├── main.tsx                   # 入口文件
├── index.css                  # 全局样式 + Tailwind 指令
├── components/
│   ├── canvas/                # 画布相关
│   │   ├── TopologyCanvas.tsx # 拓扑画布主组件（拖放、连线）
│   │   ├── ConnectionModal.tsx# 连接配置弹窗
│   │   ├── nodes/             # 自定义节点
│   │   │   └── BaseDeviceNode.tsx
│   │   └── edges/             # 自定义连线
│   │       └── CustomEdge.tsx
│   ├── palette/               # 设备面板
│   │   └── DevicePalette.tsx  # 可拖拽设备列表
│   ├── properties/            # 属性面板（右侧）
│   │   ├── PropertyPanel.tsx  # 属性面板容器
│   │   ├── DeviceSettings.tsx # 设备设置
│   │   ├── InterfaceEditor.tsx# 接口编辑器
│   │   ├── ProtocolSelector.tsx
│   │   ├── RouteTableView.tsx
│   │   └── protocol-forms/    # 各协议配置表单
│   ├── config/                # 配置输出（底部面板）
│   │   ├── ConfigOutput.tsx   # 配置命令展示
│   │   └── SyntaxHighlighter.tsx
│   ├── summary/               # 拓扑总结与验证
│   │   ├── NetworkSummary.tsx
│   │   └── TopologyValidatorView.tsx
│   ├── layout/                # 布局组件
│   │   ├── TopBar.tsx         # 顶部工具栏
│   │   └── BottomPanel.tsx    # 底部面板容器
│   └── shared/                # 通用组件
├── store/                     # Zustand 状态管理
│   ├── useTopologyStore.ts    # 拓扑数据（节点、连线、撤销重做）
│   └── useUIStore.ts          # UI 状态（面板、选中、厂商等）
├── types/                     # TypeScript 类型定义
│   ├── topology.ts            # 拓扑节点/边/设备类型
│   ├── vendor.ts              # 厂商主题类型
│   ├── protocols.ts           # 协议配置类型
│   └── ui.ts                  # UI 状态类型
├── constants/                 # 常量配置
│   ├── devices.ts             # 设备默认配置（接口、型号、前缀）
│   └── protocols.ts           # 协议相关常量
├── theme/                     # 厂商主题
│   ├── vendorThemes.ts        # 华为/H3C/思科/锐捷四套主题
│   └── useVendorTheme.ts      # 主题 Hook
├── config-generator/          # 多厂商 CLI 配置生成器
│   ├── registry.ts            # 生成器注册表
│   ├── ConfigGenerator.ts     # 生成器接口
│   ├── annotations/           # 配置注解
│   └── vendors/               # 各厂商生成器实现
├── summary/                   # 拓扑总结生成器
├── validation/                # 拓扑验证器
├── hooks/                     # 自定义 Hook
│   └── useKeyboard.ts         # 键盘快捷键
└── utils/                     # 工具函数
    ├── id.ts                  # ID 生成
    ├── ip.ts                  # IP 计算
    └── storage.ts             # 本地存储
```

## 使用指南

1. **拖入设备** — 从左侧设备面板拖拽路由器、交换机、防火墙等设备到画布
2. **连接设备** — 从设备端口拖线到另一设备，选择接口和链路类型
3. **配置属性** — 点击设备在右侧面板编辑主机名、接口 IP、协议等
4. **生成配置** — 底部面板查看自动生成的 CLI 配置命令
5. **验证拓扑** — 切换到验证标签检查拓扑设计的正确性
6. **切换厂商** — 顶部工具栏切换华为/H3C/思科/锐捷，配置命令同步切换

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` / `Ctrl+Shift+Z` | 重做 |
| `Delete` / `Backspace` | 删除选中设备/连线 |
| `Escape` | 取消选中 |
| `Shift + 点击` | 多选节点 |

## 支持的设备类型

| 设备 | 说明 |
|------|------|
| 路由器 | 支持 OSPF/BGP/RIP/NAT/DHCP |
| 交换机 | 支持 VLAN/STP/ACL |
| 防火墙 | 支持 ACL/NAT/静态路由 |
| AC 控制器 | 无线控制器 |
| AP 接入点 | 无线接入点 |
| PC | 终端设备 |
| Server | 服务器 |
| Cloud | 互联网/云端 |

## 支持的厂商

- 华为 (Huawei)
- 华三 (H3C)
- 思科 (Cisco)
- 锐捷 (Ruijie)
