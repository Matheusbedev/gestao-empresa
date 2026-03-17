'use client';
import { useState } from 'react';
import Layout from '@/components/Layout';
import { FileText, Download, Clock, AlertCircle, DollarSign, FileSpreadsheet } from 'lucide-react';

export default function RelatoriosPage() {
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const relatorios = [
    {
      title: 'Relatório de Ponto',
      desc: 'Histórico completo de entradas, saídas e horas trabalhadas no período selecionado.',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-900/30',
      actions: [
        { label: 'Exportar PDF', icon: FileText, url: `${API}/api/relatorios/ponto/pdf?mes=${mes}&ano=${ano}`, style: 'btn-primary' },
      ],
    },
    {
      title: 'Relatório de Faltas',
      desc: 'Listagem detalhada de todas as ausências registradas, com tipo e justificativa.',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-100 dark:border-orange-900/30',
      actions: [
        { label: 'Exportar PDF', icon: FileText, url: `${API}/api/relatorios/faltas/pdf?mes=${mes}&ano=${ano}`, style: 'btn-primary' },
      ],
    },
    {
      title: 'Folha de Pagamento',
      desc: 'Relatório completo da folha salarial com todos os cálculos, descontos e benefícios.',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      actions: [
        { label: 'Exportar Excel', icon: FileSpreadsheet, url: `${API}/api/relatorios/folha/excel?mes=${mes}&ano=${ano}`, style: 'btn-success' },
      ],
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Exporte dados em PDF e Excel para análise</p>
        </div>

        {/* Período */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Período de Referência</h3>
              <p className="text-xs text-gray-400">Selecione o mês e ano para os relatórios</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-48">
              <label className="label">Mês</label>
              <select className="input" value={mes} onChange={e => setMes(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="label">Ano</label>
              <select className="input" value={ano} onChange={e => setAno(e.target.value)}>
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatorios.map(({ title, desc, icon: Icon, color, bg, border, actions }) => (
            <div key={title} className={`card border-2 ${border} hover:shadow-md transition-all duration-200`}>
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{desc}</p>
              <div className="space-y-2 mt-auto">
                {actions.map(({ label, icon: ActionIcon, url, style }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    className={`${style} w-full justify-center text-sm`}>
                    <Download className="w-4 h-4" /> {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="card bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Como usar</p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1 leading-relaxed">
                Selecione o período desejado acima e clique no botão de exportação. Os relatórios são gerados automaticamente com os dados do banco de dados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
