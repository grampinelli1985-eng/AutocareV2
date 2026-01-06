
import React from 'react';
import { Home, ClipboardList, ShieldAlert, User, Bell, Sparkles, Lock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNotificationClick?: () => void;
  hasNotifications?: boolean;
  userPlan?: 'free' | 'premium';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onNotificationClick,
  hasNotifications = false,
  userPlan = 'free'
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'maintenance', label: 'Manutenção', icon: ClipboardList },
    { id: 'chat', label: 'IA Chat', icon: Sparkles },
    { id: 'theft', label: 'Alerta Roubo', icon: ShieldAlert },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div
      className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-200 dark:border-slate-800"
      style={{ height: '100dvh' }}
    >
      {/* Header */}
      <header
        className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-lg z-20"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <h1 className="text-xl font-bold tracking-tight">AutoCare IA</h1>
        <button
          onClick={onNotificationClick}
          className="p-1 hover:bg-indigo-500 rounded-lg transition-colors relative"
          title="Notificações"
        >
          <Bell size={24} />
          {hasNotifications && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-indigo-600 dark:border-indigo-700 rounded-full animate-pulse"></span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500'
                }`}
            >
              <div className={`${isActive && tab.id === 'chat' ? 'bg-indigo-100 dark:bg-indigo-900/40 p-1 rounded-lg' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium flex items-center gap-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
