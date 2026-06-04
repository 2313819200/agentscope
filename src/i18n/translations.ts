export type Lang = 'zh' | 'en';
export type TranslationKey = string;

type TranslationMap = Record<string, { zh: string; en: string }>;

export const T: TranslationMap = {
  // ──── 导航 ────
  'nav.chat':        { zh: '对话', en: 'Chat' },
  'nav.monitor':     { zh: '监控', en: 'Monitor' },
  'nav.graph':       { zh: '图谱', en: 'Graph' },
  'nav.settings':    { zh: '设置', en: 'Settings' },
  'nav.models':      { zh: '模型', en: 'Models' },
  'nav.navigation':  { zh: '导航', en: 'Navigation' },
  'nav.actions':     { zh: '操作', en: 'Actions' },

  // ──── 模型 ────
  'model.select_hint': { zh: '请选择一个模型开始对话', en: 'Select a model to start' },
  'model.setup_hint':  { zh: '先在设置中配置 API Key', en: 'Configure API Key in Settings first' },
  'model.configure':   { zh: '配置 API Key', en: 'Configure API Keys' },

  // ──── 聊天 ────
  'chat.placeholder':  { zh: '输入消息… (Ctrl+Enter 发送)', en: 'Message… (Ctrl+Enter to send)' },
  'chat.no_key':       { zh: '⚠️ 先在设置中配置 API Key', en: '⚠️ Set API Key in Settings first' },
  'chat.send':         { zh: '发送', en: 'Send' },
  'chat.generating':   { zh: '生成中', en: 'generating' },
  'chat.you':          { zh: '你', en: 'You' },
  'chat.tokens':       { zh: 'token', en: 'tokens' },
  'chat.shortcut_hint':{ zh: 'Ctrl+Enter 发送 · Token 实时统计', en: 'Ctrl+Enter to send · Live token count' },
  'chat.clear':        { zh: '清空对话', en: 'Clear Chat' },
  'chat.new_chat':     { zh: '新建对话', en: 'New Chat' },
  'chat.thinking':     { zh: '思考中', en: 'Thinking' },

  // ──── 监控 ────
  'monitor.title':         { zh: 'Agent 监控', en: 'Agent Monitor' },
  'monitor.connected':     { zh: '已连接', en: 'Connected' },
  'monitor.disconnected':  { zh: '监控未连接', en: 'Monitoring Disconnected' },
  'monitor.connect_hint':  { zh: '点击侧边栏「Connect Monitor」连接 OpenClaw', en: 'Click "Connect Monitor" in sidebar' },
  'monitor.no_sessions':   { zh: '暂无活跃会话', en: 'No active sessions' },
  'monitor.waiting':       { zh: '等待事件推送…', en: 'Waiting for events...' },
  'monitor.sessions':      { zh: '会话', en: 'sessions' },
  'monitor.tool_calls':    { zh: '工具调用', en: 'Tool Calls' },
  'monitor.started':       { zh: '开始于', en: 'Started' },
  'monitor.input':         { zh: '输入', en: 'in' },
  'monitor.output':        { zh: '输出', en: 'out' },
  'monitor.in':            { zh: '入', en: 'in' },
  'monitor.out':           { zh: '出', en: 'out' },
  'monitor.total':         { zh: '合计', en: 'total' },

  // ──── 图谱 ────
  'graph.no_data':         { zh: '暂无图谱数据', en: 'No Graph Data' },
  'graph.hint':            { zh: '连接 Agent 监控后运行会话即可看到图谱', en: 'Connect monitor and run sessions to see the graph' },
  'graph.token_usage':     { zh: 'Token 用量', en: 'Token Usage' },
  'graph.hub':             { zh: '观星台中枢', en: 'AgentScope Hub' },

  // ──── 设置 ────
  'settings.api_keys':     { zh: 'API 密钥', en: 'API Keys' },
  'settings.key_hint':     { zh: '密钥仅存储在浏览器本地，绝不外传', en: 'Keys stored in your browser\'s localStorage only' },
  'settings.valid':        { zh: '有效', en: 'Valid' },
  'settings.not_tested':   { zh: '未验证', en: 'Not tested' },
  'settings.not_set':      { zh: '未设置', en: 'Not set' },
  'settings.save':         { zh: '保存', en: 'Save' },
  'settings.show_keys':    { zh: '显示密钥', en: 'Show keys' },
  'settings.hide_keys':    { zh: '隐藏密钥', en: 'Hide keys' },
  'settings.general':      { zh: '通用设置', en: 'General Settings' },
  'settings.temperature':  { zh: '温度', en: 'Temperature' },
  'settings.max_tokens':   { zh: '最大 Token', en: 'Max Tokens' },
  'settings.auto_scroll':  { zh: '自动滚动', en: 'Auto-scroll' },
  'settings.system_prompt':{ zh: '系统提示词', en: 'System Prompt' },
  'settings.system_hint':  { zh: '可选：设置全局系统提示词', en: 'Optional: global system prompt' },
  'settings.language':     { zh: '语言', en: 'Language' },
  'settings.theme':        { zh: '主题', en: 'Theme' },
  'settings.dark':         { zh: '深色', en: 'Dark' },
  'settings.light':        { zh: '浅色', en: 'Light' },
  'settings.openclaw':     { zh: 'OpenClaw 网关', en: 'OpenClaw Gateway' },
  'settings.endpoint':     { zh: '接口地址', en: 'Endpoint' },
  'settings.endpoint_hint':{ zh: '默认本地 OpenClaw 网关地址', en: 'Default local OpenClaw endpoint' },
  'settings.supported':    { zh: '支持的模型', en: 'Supported' },

  // ──── 侧边栏 ────
  'sidebar.connect':       { zh: '连接监控', en: 'Connect Monitor' },
  'sidebar.disconnect':    { zh: '断开连接', en: 'Disconnect' },
  'sidebar.connected':     { zh: '已连接', en: 'Connected' },
  'sidebar.live':          { zh: '实时', en: 'Live' },

  // ──── Token 统计条 ────
  'token.input':           { zh: '输入 Token', en: 'Input Tokens' },
  'token.output':          { zh: '输出 Token', en: 'Output Tokens' },
  'token.total':           { zh: '总计 Token', en: 'Total Tokens' },
  'token.cost':            { zh: '花费', en: 'Cost' },
  'token.hint':            { zh: '所有数据仅存本地，不经过任何服务器', en: 'All data stays local, never leaves your browser' },

  // ──── 通用 ────
  'common.footer':         { zh: 'AgentScope · 观星台 · 数据仅存本地', en: 'AgentScope · All data stays in your browser' },
  'common.github':         { zh: 'GitHub 仓库', en: 'GitHub Repository' },
};
