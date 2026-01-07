import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSidebarStore } from '@/stores/sidebarStore';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div
      className="min-h-screen bg-background"
      style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <div className="flex overflow-hidden">
        <Sidebar />
        <div
          className={cn(
            'flex-1 transition-all duration-300 min-w-0',
            isCollapsed ? 'ml-16' : 'ml-64'
          )}
          style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
        >
          <Header />
          <main className="p-6 relative z-0" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
