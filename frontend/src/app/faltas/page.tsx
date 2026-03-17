'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';

const tipoColors: Record<string, string> = {
  JUSTIFICADA: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  NAO_JUSTIFICADA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ATESTADO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FERIADO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function FaltasPage() {
  const [faltas, setFaltas] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const carregar = async () => {
    setLoading(true);
    const [faltasRes, funcRes] = await Promise.all([
      api.get('/api/faltas', { params: { mes, ano, limit: 50 } }),
      api.get('/api/funcionarios', { params: { limit: 100, status: 'ATIVO' } }),
    ]);
    setFaltas(faltasRes.data.data);
    setFuncionarios(funcRes.data.data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [mes, ano]);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/api/faltas', data);
      toast.success('Falta registrada');
      reset();
      setShowForm(false);
      carregar();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao registrar falta');
    }
  };

  const deletar = async (id: string) => {
    if (!confirm('Remover esta falta?')) return;
    await api.delete(`/api/faltas/${id}`);
    toast.success('Falta removida');
    carregar();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faltas</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle de ausências</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-4 h-4" /> Registrar Falta
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card animate-slide-up">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nova Falta</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Funcionário</label>
                <select className="input" {...register('funcionarioId', { required: true })}>
                  <option value="">Selecione...</option>
                  {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Data</label>
                <input className="input" type="date" {...register('data', { required: true })} />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" {...register('tipo', { required: true })}>
                  <option value="NAO_JUSTIFICADA">Não Justificada</option>
                  <option value="JUSTIFICADA">Justificada</option>
                  <option value="ATESTADO">Atestado</option>
                  <option value="FERIADO">Feriado</option>
                </select>
              </div>
              <div>
                <label className="label">Motivo</label>
                <input className="input" {...register('motivo')} placeholder="Opcional..." />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="card">
          <div className="flex gap-3">
            <div>
              <label className="label">Mês</label>
              <select className="input" value={mes} onChange={e => setMes(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ano</label>
              <select className="input" value={ano} onChange={e => setAno(e.target.value)}>
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="table-header">Funcionário</th>
                  <th className="table-header">Data</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Motivo</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
                ) : faltas.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhuma falta registrada neste período
                  </td></tr>
                ) : faltas.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell font-medium">{f.funcionario?.nome}</td>
                    <td className="table-cell">{format(new Date(f.data), 'dd/MM/yyyy')}</td>
                    <td className="table-cell">
                      <span className={clsx('badge', tipoColors[f.tipo])}>{f.tipo.replace('_', ' ')}</span>
                    </td>
                    <td className="table-cell text-gray-500">{f.motivo || '—'}</td>
                    <td className="table-cell">
                      <button onClick={() => deletar(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
