import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  Sparkles,
  Search,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { ViewSection } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  currentView: ViewSection;
  onViewChange: (view: ViewSection) => void;
}

const navItems = [
  { id: 'dashboard' as ViewSection, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads' as ViewSection, label: 'Leads', icon: Users },
  { id: 'finance' as ViewSection, label: 'Financeiro', icon: Wallet },
  { id: 'finder' as ViewSection, label: 'Buscar Leads', icon: Search },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (view: ViewSection) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials or email first letter
  const getUserInitials = () => {
    if (!user) return 'U';
    const email = user.email || '';
    return email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'Usuário';
    return user.email?.split('@')[0] || 'Usuário';
  };

  return (
    <>
      {/* Mobile Header - Premium */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-[72px] bg-white/90 backdrop-blur-xl border-b border-slate-200/50 z-50 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight">ClientOps</h1>
            <p className="text-xs text-slate-400 font-medium">Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 active:scale-95 transition-all duration-200"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <Menu className="w-6 h-6 text-slate-700" />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay - Premium */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-out",
          isMobileMenuOpen
            ? "bg-slate-950/60 backdrop-blur-xl opacity-100"
            : "bg-slate-950/0 backdrop-blur-none opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar - Desktop: Fixed, Mobile: Slide-out */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white/98 backdrop-blur-2xl border-r border-slate-200/60 flex flex-col z-50",
          "lg:w-72 lg:translate-x-0",
          "transform-gpu will-change-transform",
          "transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isMobile ? (isMobileMenuOpen ? 'translate-x-0 w-[300px]' : '-translate-x-full w-[300px]') : ''
        )}
      >
        {/* Logo - Hidden on mobile (shown in header) */}
        <div className="hidden lg:block p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-xl tracking-tight">ClientOps</h1>
              <p className="text-sm text-slate-400 font-medium">CRM Dashboard</p>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <div className="lg:hidden p-5 border-b border-slate-100 flex justify-between items-center">
          <span className="font-semibold text-slate-900 text-lg">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 active:scale-95 transition-all"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto scrollbar-smooth">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold",
                      "min-h-[52px] touch-manipulation no-select tap-transparent",
                      "transform-gpu transition-all duration-200 ease-out",
                      "active:scale-[0.98]",
                      isActive
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                    )}>
                      <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-white" : "text-slate-500")} />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Premium User Card with Sign Out */}
        <div className="p-3 lg:p-4 border-t border-slate-100 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-50/80 min-h-[56px]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
              <span className="text-white text-sm font-bold">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold",
              "min-h-[48px] touch-manipulation no-select tap-transparent",
              "transform-gpu transition-all duration-200 ease-out",
              "text-rose-600 hover:bg-rose-50 active:scale-[0.98]"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-[18px] h-[18px] text-rose-600" />
            </div>
            <span className="truncate">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
