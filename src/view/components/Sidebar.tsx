import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, TrendingUp, Receipt, CreditCard,
  PiggyBank, BarChart3, Menu, X, DollarSign, LogOut
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/receitas', label: 'Receitas', icon: TrendingUp },
  { path: '/despesas', label: 'Despesas', icon: Receipt },
  { path: '/dividas', label: 'Dívidas', icon: CreditCard },
  { path: '/reservas', label: 'Reservas', icon: PiggyBank },
  { path: '/planejamento', label: 'Planejamento', icon: BarChart3 },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card border border-border shadow-md"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full z-40 w-64 flex flex-col',
        'bg-sidebar border-r border-sidebar-border',
        'transition-transform duration-300',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-primary">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-sm leading-tight">FinanceAI</h1>
              <p className="text-xs text-muted-foreground">Controle Financeiro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path} to={path} onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-border/50 shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : '')} />
                {label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-subtle border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-expense-subtle text-muted-foreground hover:text-expense transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
