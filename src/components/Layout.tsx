import { type ReactNode } from 'react';

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  topBar?: ReactNode;
}

export function Layout({ sidebar, children, topBar }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-surface text-gray-100">
      {topBar && <div className="shrink-0">{topBar}</div>}
      <div className="flex-1 flex overflow-hidden">
        <div className="shrink-0">{sidebar}</div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
