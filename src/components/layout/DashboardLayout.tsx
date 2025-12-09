import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSocket } from '@/hooks/useSocket';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useSocket();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
