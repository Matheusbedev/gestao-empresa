'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Clock, AlertCircle, DollarSign,
  FileText, LogOut, Menu, X, Sun, Moon, Bell, ChevronRight, Settings
} from 'lucide-react';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/funcionarios', label: 'Funcionários', icon: Users },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { href: '/ponto', label: 'Controle de Ponto', icon: Clock },
      { href: '/faltas', label: 'Faltas', icon: AlertCircle },
      { href: '/folha', label: 'Folha de Pagamento', icon: DollarSign },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/relatorios', label: 'Relatórios', icon: FileText },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.documentElement.classList.toggle('dark', saved);
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
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 glass lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 dark:shadow-blue-900/30 flex-shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">RH System</p>
            <p className="text-xs text-gray-400 mt-0.5">Enterprise</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={active ? 'sidebar-link-active' : 'sidebar-link-inactive'}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-sm">{label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.nome}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
            <button onClick={logout} title="Sair"
              className="text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 dark:text-gray-700 mt-2">dev.matheusaugustoo@gmail.com</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 h-16 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{currentPage}</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button onClick={toggleDark}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-100 dark:border-gray-800">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user?.nome}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-2.5 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            RH System · Desenvolvido por{' '}
            <a href="https://instagram.com/dev.matheuss" target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
              Matheus Augusto
            </a>
            {' '}· (43) 99555-144 · dev.matheusaugustoo@gmail.com
          </p>
        </footer>
      </div>
    </div>
  );
}
