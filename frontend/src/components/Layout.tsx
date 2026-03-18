'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Clock, AlertCircle, DollarSign,
  FileText, LogOut, Menu, X, Sun, Moon, Settings,
  ChevronRight, Briefcase, Wallet, Loader2,
} from 'lucide-react';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Visão Geral',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Pessoas',
    items: [
      { href: '/funcionarios', label: 'Funcionários', icon: Users },
      { href: '/ponto', label: 'Controle de Ponto', icon: Clock },
      { href: '/faltas', label: 'Faltas', icon: AlertCircle },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/folha', label: 'Folha de Pagamento', icon: DollarSign },
      { href: '/financeiro', label: 'Contas & Receitas', icon: Wallet },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/relatorios', label: 'Relatórios', icon: FileText },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hora, setHora] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const allItems = navGroups.flatMap(g => g.items);
  const currentPage = allItems.find(n => pathname.startsWith(n.href))?.label || '';

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center animate-scale-in">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Carregando ambiente</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Estamos validando suas permissoes.</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden app-shell-bg">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-[220px] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto select-none',
        'border-r border-[var(--panel-border)]/70',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
        style={{ background: 'linear-gradient(180deg, #0b2239 0%, #0f2f4a 30%, #132335 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #2dd4bf)', boxShadow: '0 0 18px rgb(34 211 238 / 0.45)' }}>
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-[13px] leading-none">RH System</p>
            <p className="text-[10px] text-cyan-200/80 mt-0.5 font-medium">Painel Operacional</p>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-400 p-1 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-sky-200/45 uppercase tracking-widest px-2.5 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150',
                        active
                          ? 'text-white'
                          : 'text-sky-100/70 hover:bg-white/10 hover:text-white'
                      )}
                      style={active ? {
                        background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                        boxShadow: '0 3px 14px rgb(14 165 233 / 0.4)',
                      } : {}}>
                      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {active && <ChevronRight className="w-3 h-3 opacity-50 flex-shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-2.5 border-t border-white/[0.05] flex-shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #2dd4bf)' }}>
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate leading-none">{user?.nome}</p>
              <p className="text-[10px] text-sky-100/55 mt-0.5">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}
              </p>
            </div>
            <button onClick={logout} title="Sair"
              className="text-gray-700 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center gap-3 px-4 sm:px-6 flex-shrink-0 bg-[var(--panel)]/95 border-b border-[var(--panel-border)] backdrop-blur-xl"
          style={{ boxShadow: '0 8px 22px rgb(15 23 42 / 0.05)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)] text-xs">RH System</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-soft)]" />
            <span className="font-semibold text-[var(--text-primary)]">{currentPage}</span>
          </div>

          <div className="flex-1" />

          {hora && (
            <span className="hidden sm:block text-xs font-mono text-[var(--text-muted)] tabular-nums bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--panel-border)]">
              {hora}
            </span>
          )}

          <button onClick={toggleDark}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo escuro'}>
            {darkMode
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--panel-border)]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-bold text-[var(--text-primary)] leading-none">{user?.nome}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{user?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-9 flex items-center justify-center border-t border-[var(--panel-border)] bg-[var(--panel)]/95 backdrop-blur-xl flex-shrink-0">
          <p className="text-[11px] text-[var(--text-muted)]">
            RH System · Painel profissional de RH
          </p>
        </footer>
      </div>
    </div>
  );
}
