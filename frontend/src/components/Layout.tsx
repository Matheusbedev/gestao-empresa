'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Briefcase,
  Users,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  Loader2,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { href: '/funcionarios', label: 'Funcionários', icon: Users },
      { href: '/ponto', label: 'Ponto', icon: Clock },
      { href: '/faltas', label: 'Faltas', icon: AlertCircle },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/folha', label: 'Folha de Pagamento', icon: DollarSign },
      { href: '/financeiro', label: 'Financeiro', icon: FileText },
    ],
  },
  {
    label: 'Relatórios',
    items: [
      { href: '/relatorios', label: 'Relatórios', icon: FileText },
    ],
  },
  {
    label: 'Administração',
    items: [
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
];

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hora, setHora] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.documentElement.setAttribute('data-theme', saved ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const allItems = navGroups.flatMap(g => g.items);
  const currentPage = allItems.find(n => pathname.startsWith(n.href))?.label || '';

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
        <div className="card max-w-sm w-full text-center p-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Carregando</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">Validando suas permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-700 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base">RH System</p>
            <p className="text-xs text-slate-400">Gestão Profissional</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-slate-700 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-8">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {active && <ChevronRight className="w-4 h-4 opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.nome}</p>
              <p className="text-xs text-slate-400">{user?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center gap-4 px-6 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-500">RH System</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{currentPage}</span>
          </div>

          <div className="flex-1" />

          {hora && (
            <span className="hidden sm:block text-xs font-mono text-slate-600 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
              {hora}
            </span>
          )}

          <button
            onClick={toggleDark}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900">{user?.nome}</p>
              <p className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Admin' : 'Gestor'}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
