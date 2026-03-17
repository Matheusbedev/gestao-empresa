'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { DollarSign, Play, Download, Eye, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import FolhaDetalheModal from '@/components/FolhaDetalheModal';

const statusColors: Record<string, string> = {
  PENDENTE:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PROCESSADA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PAGA:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};
const statusLabel: Record<string, string> = { PENDENTE: 'Pendente', PROCESSADA: 'Processada', PAGA: 'Paga' };

export default function FolhaPage() {
  const [folhas, setFolhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [detalhe, setDetalhe] = useState<any>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/folhas', { params: { mes, ano, limit: 50 } });
      setFolhas(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [mes, ano]);

  const gerarFolha = async () => {
    setGerando(true);
    try {
      const res = await api.post('/api/folhas/gerar', { mes: parseInt(mes), ano: parseInt(ano) });
      toast.success(`${res.data.folhas.length} folhas geradas.`);
      carregar();
    } catch { toast.error('Erro ao gerar folha.'); }
    finally { setGerando(false); }
  };

  const marcarPaga = async (id: string) => {
    try { await api.put(`/api/folhas/${id}/status`, { status: 'PAGA' }); toast.success('Folha marcada como paga.'); carregar(); }
    catch { toast.error('Erro ao atualizar.'); }
  };

  const desmarcarPaga = async (id: string) => {
    try { await api.put(`/api/folhas/${id}/status`, { status: 'PROCESSADA' }); toast.success('Pagamento desmarcado.'); carregar(); }
    catch { toast.error('Erro ao atualizar.'); }
  };

  const exportarExcel = () => {
    const token = localStorage.getItem('token');
    window.open(`${apiBase}/api/relatorios/folha/excel?mes=${mes}&ano=${ano}&token=${token}`, '_blank');
  };
  const exportarPDF = (id: string) => {
    const token = localStorage.getItem('token');
    window.open(`${apiBase}/api/relatorios/folha/pdf/${id}?token=${token}`, '_blank');
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const totalFolha = folhas.reduce((acc, f) => acc + parseFloat(f.salarioLiquido), 0);
  const totalPago = folhas.filter(f => f.status === 'PAGA').reduce((acc, f) => acc + parseFloat(f.salarioLiquido), 0);

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Folha de Pagamento</h1>
            <p className="page-subtitle">Gerencie os pagamentos da equipe</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={exportarExcel} className="btn-secondary">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={gerarFolha} disabled={gerando} className="btn-primary">
              {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Gerar Folha
            </button>
          </div>
        </div>

        {/* Filtros + KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card py-4">
            <label className="label">Mês</label>
            <select className="input" value={mes} onChange={e => setMes(e.target.value)}>
              {Array.from({length:12},(_,i) => (
                <option key={i+1} value={i+1}>{new Date(2024,i,1).toLocaleDateString('pt-BR',{month:'long'})}</option>
              ))}
            </select>
          </div>
          <div className="card py-4">
            <label className="label">Ano</label>
            <select className="input" value={ano} onChange={e => setAno(e.target.value)}>
              {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="card py-4 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
            <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-1">Total da Folha</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{fmt(totalFolha)}</p>
            <p className="text-xs text-blue-400 mt-0.5">{folhas.length} funcionários</p>
          </div>
          <div className="card py-4 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Total Pago</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{fmt(totalPago)}</p>
            <p className="text-xs text-emerald-500 mt-0.5">{folhas.filter(f => f.status === 'PAGA').length} pagos</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="table-header">Funcionário</th>
                  <th className="table-header hidden sm:table-cell">Salário Base</th>
                  <th className="table-header hidden md:table-cell">H.E.</th>
                  <th className="table-header hidden md:table-cell">Descontos</th>
                  <th className="table-header hidden lg:table-cell">Benefícios</th>
                  <th className="table-header">Líquido</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-14">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                    <p className="text-xs text-gray-400 mt-2">Carregando...</p>
                  </td></tr>
                ) : folhas.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-14">
                    <DollarSign className="w-8 h-8 mx-auto text-gray-200 dark:text-gray-700 mb-2" />
                    <p className="text-sm text-gray-400">Nenhuma folha gerada.</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Clique em "Gerar Folha" para começar.</p>
                  </td></tr>
                ) : folhas.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {f.funcionario?.nome?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.funcionario?.nome}</p>
                          <p className="text-xs text-gray-400">{f.funcionario?.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell text-sm">{fmt(parseFloat(f.salarioBase))}</td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-orange-600 text-sm font-medium">+{fmt(parseFloat(f.horasExtras50) + parseFloat(f.horasExtras100))}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-red-500 text-sm">-{fmt(parseFloat(f.inss) + parseFloat(f.descontoFaltas))}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <span className="text-emerald-600 text-sm">+{fmt(parseFloat(f.valeTransporte) + parseFloat(f.valeAlimentacao) + parseFloat(f.bonus))}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-bold text-gray-900 dark:text-white">{fmt(parseFloat(f.salarioLiquido))}</span>
                    </td>
                    <td className="table-cell">
                      <span className={clsx('badge', statusColors[f.status])}>{statusLabel[f.status] || f.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetalhe(f)} title="Ver detalhes"
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => exportarPDF(f.id)} title="Baixar PDF"
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        {f.status !== 'PAGA' ? (
                          <button onClick={() => marcarPaga(f.id)} title="Marcar como paga"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => desmarcarPaga(f.id)} title="Desmarcar pagamento"
                            className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detalhe && <FolhaDetalheModal folha={detalhe} onClose={() => setDetalhe(null)} />}
    </Layout>
  );
}
