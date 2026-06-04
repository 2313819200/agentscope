# AgentScope · 观星台

> **AI Agent 可视化工具** — 接入 Claude / DeepSeek / OpenAI / Gemini，实时监控 OpenClaw 等 Agent 系统。

---

## ✨ Features

| 功能 | 说明 |
|---|---|
| 🧠 **多模型聊天** | 统一界面同时使用 Claude、DeepSeek、OpenAI、Gemini |
| 📡 **Agent 监控** | 实时连接 OpenClaw Gateway，查看 Agent 会话、Token 消耗、工具调用 |
| 🕸️ **思维链图** | React Flow 可视化 Agent ↔ 工具的调用关系 |
| 📊 **Token 统计** | 实时统计输入/输出 Token，自动换算成本 |
| 🔒 **本地优先** | API Key 仅存浏览器 localStorage，不经过任何服务器 |
| 🎨 **暗色主题** | 护眼暗色 UI，专注 Agent 观测 |

---

## 🚀 快速开始

```bash
# 1. 克隆
git clone https://github.com/<your-username>/agentscope.git
cd agentscope

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问 http://localhost:3333
```

### 配置 API Key

1. 打开 Settings 面板（sidebar 底部 ⚙️）
2. 输入你的 API Key（Claude / DeepSeek / OpenAI / Gemini）
3. 点击 Save，Key 仅存储在本地浏览器

### 连接 Agent 监控

- **OpenClaw**：确保本地 OpenClaw Gateway 运行在 `localhost:1177`，点击 sidebar 的 "Connect Monitor"
- **Hermes Agent / 自定义**：可在 Settings 中配置 endpoint

---

## 🏗️ 架构

```
agentscope/
├── src/
│   ├── components/       # React 组件
│   │   ├── ChatPanel     # 聊天界面
│   │   ├── MonitorPanel  # Agent 监控
│   │   ├── AgentGraph    # 可视化图谱
│   │   ├── Sidebar       # 侧边导航
│   │   └── SettingsPanel # 配置面板
│   ├── providers/        # 模型 & 监控适配器
│   │   ├── claude.ts     # Anthropic Claude
│   │   ├── deepseek.ts   # DeepSeek
│   │   ├── openai.ts     # OpenAI
│   │   ├── gemini.ts     # Google Gemini
│   │   └── openclaw.ts   # OpenClaw Monitor
│   ├── store/            # Zustand 状态管理
│   └── types/            # TypeScript 类型
├── public/
└── vite.config.ts
```

**设计原则：**
- **轻量无后端** — 浏览器直调 API，不代理不缓存，省 Token
- **Provider 模式** — 加新模型/监视器只需写一个 adapter 文件
- **本地存储** — API Key + 设置存 localStorage，隐私安全

---

## 🔌 添加新模型

1. 在 `src/providers/` 下创建新文件，实现 `ModelProvider` 接口
2. 在 `src/providers/index.ts` 的 `AVAILABLE_MODELS` 中注册
3. 在 `src/store/index.ts` 的 `providers` 注册表中导入

```typescript
// 示例：添加 xAI Grok
export const grokProvider: ModelProvider = {
  id: 'grok',
  config: { id: 'grok', name: 'Grok', provider: 'xAI', ... },
  async *chat(req, apiKey) {
    // 实现流式对话
  },
  // ...
};
```

---

## 🐙 OpenClaw 集成

AgentScope 支持通过 WebSocket 连接 OpenClaw Gateway：
- 实时推送 Agent 会话事件
- Token 使用统计
- 工具调用追踪
- 自动重连

> 需要 OpenClaw Gateway 运行在 `localhost:1177`

---

## 🛠️ 开发

```bash
npm run dev      # 开发服务器 :3333
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

---

## 📦 构建产物

```bash
npm run build     # → dist/ 目录，纯静态文件
```

可用任何静态服务器部署，或者与 OpenClaw Gateway 同机使用。

---

## 📝 路线图

- [ ] Tauri 桌面应用打包
- [ ] Docker 一键部署
- [ ] 自定义 API Endpoint
- [ ] Hermes Agent 深度集成
- [ ] 更多模型（Mistral, Grok, Qwen...）
- [ ] 会话导出 / 分享
- [ ] 多语言支持

---

## 📄 License

MIT
