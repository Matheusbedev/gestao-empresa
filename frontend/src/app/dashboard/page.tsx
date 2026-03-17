'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Users, UserCheck, UserX, Clock, AlertCircle, DollarSign,
  TrendingUp, ArrowUpRight, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import clsx from 'clsx';

interface DashboardData {
  cards: {
    totalFuncionarios: number; funcionariosAtivos: number;
    presentesHoje: number; ausentesHoje: number;
    faltasMes: number; horasExtrasMes: number; custoFolha: number;
  };
  gastosPorMes: { mes: string; total: number }[];
  faltasPorFuncionario: { nome: string; faltas: number }[];
  ausentes: { id: string; nome: string; cargo: string }[];
}

const CustomTooltip = ({ active, payload, label, fmt }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900 dark:text-white text-sm">
        {fmt ? fmt(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
};

function StatCard({ title, value, icon: Icon, color, bg, sub, href }: any) {
  const content = (
    <div className={clsx('card-hover group', href && 'cursor-pointer')}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon className={clsx('w-5 h-5', color)} />
        </div>
        {href && (
          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const res = await api.get('/api/dashboard');
      setData(res.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Carregando dados...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            className="btn-secondary text-sm py-2 px-3">
            <RefreshCw className={clsx('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger">
          <StatCard title="Total de Funcionários" value={data?.cards.totalFuncionarios}
            icon={Users} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" href="/funcionarios" />
          <StatCard title="Funcionários Ativos" value={data?.cards.funcionariosAtivos}
            icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" href="/funcionarios" />
          <StatCard title="Presentes Hoje" value={data?.cards.presentesHoje}
            icon={Clock} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20"
            sub={`${data?.cards.ausentesHoje} ausentes`} href="/ponto" />
          <StatCard title="Custo da Folha" value={fmt(data?.cards.custoFolha || 0)}
            icon={DollarSign} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" href="/folha" />
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          <StatCard title="Ausentes Hoje" value={data?.cards.ausentesHoje}
            icon={UserX} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" href="/ponto" />
          <StatCard title="Faltas no Mês" value={data?.cards.faltasMes}
            icon={AlertCircle} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" href="/faltas" />
          <StatCard title="Horas Extras (Mês)" value={`${(data?.cards.horasExtrasMes || 0).toFixed(1)}h`}
            icon={TrendingUp} color="text-cyan-600" bg="bg-cyan-50 dark:bg-cyan-900/20" href="/ponto" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Area chart */}
          <div className="card lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Gastos com Folha</h3>
                <p className="text-xs text-gray-400 mt-0.5">Evolução dos últimos 6 meses</p>
              </div>
              <Link href="/folha" className="btn-ghost text-xs py-1.5 px-3">
                Ver folha <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={data?.gastosPorMes} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip fmt={fmt} />} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5}
                  fill="url(#gradBlue)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Faltas por Pessoa</h3>
                <p className="text-xs text-gray-400 mt-0.5">Top 5 do mês atual</p>
              </div>
              <Link href="/faltas" className="btn-ghost text-xs py-1.5 px-3">
                Ver faltas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data?.faltasPorFuncionario} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="faltas" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ausentes */}
        {data?.ausentes && data.ausentes.length > 0 && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <UserX className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Ausentes Hoje</h3>
                  <p className="text-xs text-gray-400">{data.ausentes.length} funcionário(s) sem registro</p>
                </div>
              </div>
              <Link href="/ponto" className="btn-ghost text-xs py-1.5 px-3">
                Ver ponto <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {data.ausentes.map(f => (
                <div key={f.id}
                  className="flex items-center gap-2.5 p-3 bg-red-50/60 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                    {f.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{f.nome.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400 truncate">{f.cargo.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
