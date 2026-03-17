'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { ArrowLeft, User, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  INATIVO: 'bg-gray-100 text-gray-600',
  FERIAS: 'bg-blue-100 text-blue-700',
  AFASTADO: 'bg-orange-100 text-orange-700',
};

export default function FuncionarioDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [funcionario, setFuncionario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/funcionarios/${id}`)
      .then(res => setFuncionario(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></Layout>;
  if (!funcionario) return <Layout><p className="text-center text-gray-400 mt-20">Funcionário não encontrado</p></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Header */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
              {funcionario.nome.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{funcionario.nome}</h1>
                <span className={clsx('badge', statusColors[funcionario.status])}>{funcionario.status}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{funcionario.cargo} {funcionario.departamento && `· ${funcionario.departamento}`}</p>
              <p className="text-sm text-gray-400 mt-1">CPF: {funcionario.cpf}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">Salário Base</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(parseFloat(funcionario.salarioBase))}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-500">Admissão</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {format(new Date(funcionario.dataAdmissao), 'dd/MM/yyyy')}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-500">Benefícios</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">VT: {fmt(parseFloat(funcionario.valeTransporte))}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">VA: {fmt(parseFloat(funcionario.valeAlimentacao))}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Bônus: {fmt(parseFloat(funcionario.bonus))}</p>
          </div>
        </div>

        {/* Últimos pontos */}
        {funcionario.pontos?.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Últimos Registros de Ponto</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Entrada</th>
                    <th className="pb-2">Saída</th>
                    <th className="pb-2">Horas</th>
                    <th className="pb-2">Extras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {funcionario.pontos.slice(0, 10).map((p: any) => (
                    <tr key={p.id} className="text-sm">
                      <td className="py-2 text-gray-700 dark:text-gray-300">{format(new Date(p.data), 'dd/MM/yyyy')}</td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{p.entrada ? format(new Date(p.entrada), 'HH:mm') : '—'}</td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{p.saida ? format(new Date(p.saida), 'HH:mm') : '—'}</td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{p.horasTrabalhadas ? `${p.horasTrabalhadas}h` : '—'}</td>
                      <td className="py-2">
                        {p.horasExtras > 0 ? (
                          <span className="badge bg-orange-100 text-orange-700">{p.horasExtras}h</span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Últimas faltas */}
        {funcionario.faltas?.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Últimas Faltas</h3>
            </div>
            <div className="space-y-2">
              {funcionario.faltas.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{format(new Date(f.data), 'dd/MM/yyyy')}</span>
                  <span className={clsx('badge', f.tipo === 'JUSTIFICADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{f.tipo}</span>
                  <span className="text-sm text-gray-500">{f.motivo || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
