'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Clock, AlertCircle, DollarSign,
  FileText, LogOut, Menu, X, Sun, Moon, Settings,
  ChevronRight, Briefcase, Wallet,
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
  const { user, logout } = useAuth();

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5f7] dark:bg-[#0c0e13]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-[220px] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto select-none',
        'bg-[#0f1117] border-r border-white/[0.04]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.05] flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 12px rgb(59 130 246 / 0.6)' }}>
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-[13px] leading-none">RH System</p>
            <p className="text-[10px] text-blue-400/70 mt-0.5 font-medium">Enterprise</p>
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
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2.5 mb-1.5">
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
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                      )}
                      style={active ? { boxShadow: '0 2px 8px rgb(37 99 235 / 0.45)' } : {}}>
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
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate leading-none">{user?.nome}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
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
        <header className="h-14 flex items-center gap-3 px-4 sm:px-6 flex-shrink-0 bg-white dark:bg-[#13181f] border-b border-gray-100 dark:border-white/[0.05]"
          style={{ boxShadow: '0 1px 0 rgb(0 0 0 / 0.04)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-400 dark:text-gray-600 text-xs">RH System</span>
            <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-700" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{currentPage}</span>
          </div>

          <div className="flex-1" />

          {hora && (
            <span className="hidden sm:block text-xs font-mono text-gray-400 dark:text-gray-500 tabular-nums">
              {hora}
            </span>
          )}

          <button onClick={toggleDark}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo escuro'}>
            {darkMode
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100 dark:border-white/[0.06]">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-none">{user?.nome}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{user?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-9 flex items-center justify-center border-t border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#13181f] flex-shrink-0">
          <p className="text-[11px] text-gray-400 dark:text-gray-600">
            RH System · Dev{' '}
            <a href="https://instagram.com/dev.matheuss" target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
              Matheus Augusto
            </a>
            {' '}· (43) 999555-144
          </p>
        </footer>
      </div>
    </div>
  );
}
