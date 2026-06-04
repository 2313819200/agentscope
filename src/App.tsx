import { ThemeProvider } from './theme';
import { I18nProvider } from './i18n/index';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { MonitorPanel } from './components/MonitorPanel';
import { AgentGraph } from './components/AgentGraph';
import { SettingsPanel } from './components/SettingsPanel';
import { TokenBar } from './components/TokenBar';
import { useStore } from './store';

function AppContent() {
  const activeTab = useStore((s) => s.activeTab);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
      <TokenBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
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

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
}
