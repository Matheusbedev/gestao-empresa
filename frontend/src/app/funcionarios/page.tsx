'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Loader2, Users, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import FuncionarioModal from '@/components/FuncionarioModal';
import { useAuth } from '@/contexts/AuthContext';

function ConfirmModal({ open, nome, onConfirm, onCancel }: { open: boolean; nome: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">Desativar funcionário</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Tem certeza que deseja desativar <strong>{nome}</strong>? O registro será mantido no sistema.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex-1 justify-center flex items-center gap-2">Desativar</button>
        </div>
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; class: string }> = {
  ATIVO: { label: 'Ativo', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  INATIVO: { label: 'Inativo', class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  FERIAS: { label: 'Férias', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  AFASTADO: { label: 'Afastado', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [confirmDesativar, setConfirmDesativar] = useState<any>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/funcionarios', {
        params: { page, limit: 10, busca: busca || undefined, status: status || undefined },
      });
      setFuncionarios(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [page, busca, status]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/funcionarios/${id}`);
      toast.success('Funcionário desativado com sucesso.');
      setConfirmDesativar(null);
      carregar();
    } catch { toast.error('Não foi possível desativar o funcionário.'); }
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const ativos = funcionarios.filter(f => f.status === 'ATIVO').length;

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Funcionários</h1>
            <p className="page-subtitle">{total} cadastrado(s) no sistema</p>
          </div>
          <button onClick={() => { setEditando(null); setModalOpen(true); }} className="btn-primary flex-shrink-0">
            <Plus className="w-4 h-4" /> Novo Funcionário
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Ativos', value: funcionarios.filter(f => f.status === 'ATIVO').length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Inativos', value: funcionarios.filter(f => f.status !== 'ATIVO').length, icon: UserX, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card py-4">
              <div className="flex items-center gap-3">
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
                  <Icon className={clsx('w-4 h-4', color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" placeholder="Buscar por nome, CPF ou cargo..."
                value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }} />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select className="input pl-10 appearance-none" value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">Todos os status</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="FERIAS">Férias</option>
                <option value="AFASTADO">Afastado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="table-header">Funcionário</th>
                  <th className="table-header hidden md:table-cell">Cargo / Depto</th>
                  <th className="table-header hidden lg:table-cell">Admissão</th>
                  <th className="table-header">Salário</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-400 mt-2">Carregando...</p>
                  </td></tr>
                ) : funcionarios.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16">
                    <Users className="w-10 h-10 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Nenhum funcionário encontrado</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Tente ajustar os filtros ou cadastre um novo</p>
                  </td></tr>
                ) : funcionarios.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {f.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.nome}</p>
                          <p className="text-xs text-gray-400 font-mono">{f.cpf}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.cargo}</p>
                      <p className="text-xs text-gray-400">{f.departamento || '—'}</p>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                      {new Date(f.dataAdmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="table-cell font-bold text-gray-900 dark:text-white">
                      {fmt(parseFloat(f.salarioBase))}
                    </td>
                    <td className="table-cell">
                      <span className={clsx('badge', statusConfig[f.status]?.class)}>
                        {statusConfig[f.status]?.label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/funcionarios/${f.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { setEditando(f); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setConfirmDesativar(f)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Desativar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400">Página {page} de {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Anterior</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-primary py-1.5 px-3 text-xs disabled:opacity-40">Próxima</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FuncionarioModal open={modalOpen} onClose={() => setModalOpen(false)}
        funcionario={editando} onSave={() => { setModalOpen(false); carregar(); }} />

      <ConfirmModal
        open={!!confirmDesativar}
        nome={confirmDesativar?.nome || ''}
        onConfirm={() => handleDelete(confirmDesativar?.id)}
        onCancel={() => setConfirmDesativar(null)}
      />
    </Layout>
  );
}
