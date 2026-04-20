/** AppShell.tsx — Root layout with fixed mesh gradient background */
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-slate-50">
      {/* Main app container */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        {children}
      </main>
    </div>
  );
}
