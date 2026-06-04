import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { MonitorPanel } from './components/MonitorPanel';
import { AgentGraph } from './components/AgentGraph';
import { SettingsPanel } from './components/SettingsPanel';
import { TokenBar } from './components/TokenBar';
import { useStore } from './store';

export default function App() {
  const activeTab = useStore((s) => s.activeTab);

  return (
    <div className="h-screen flex flex-col bg-surface text-gray-100 overflow-hidden">
      {/* 顶部 Token 条 */}
      <TokenBar />

      {/* 主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar />

        {/* 主面板 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' && <ChatPanel />}
          {activeTab === 'monitor' && <MonitorPanel />}
          {activeTab === 'graph' && <AgentGraph />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
