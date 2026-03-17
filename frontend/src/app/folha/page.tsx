'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { DollarSign, Play, Download, Eye, Loader2, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import FolhaDetalheModal from '@/components/FolhaDetalheModal';

const statusColors: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSADA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PAGA: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function FolhaPage() {
  const [folhas, setFolhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [detalhe, setDetalhe] = useState<any>(null);

  const carregar = async () => {
    setLoading(true);
    const res = await api.get('/api/folhas', { params: { mes, ano, limit: 50 } });
    setFolhas(res.data.data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [mes, ano]);

  const gerarFolha = async () => {
    setGerando(true);
    try {
      const res = await api.post('/api/folhas/gerar', { mes: parseInt(mes), ano: parseInt(ano) });
      toast.success(`${res.data.folhas.length} folhas geradas!`);
      carregar();
    } catch {
      toast.error('Erro ao gerar folha');
    } finally {
      setGerando(false);
    }
  };

  const marcarPaga = async (id: string) => {
    await api.put(`/api/folhas/${id}/status`, { status: 'PAGA' });
    toast.success('Folha marcada como paga');
    carregar();
  };

  const exportarExcel = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/relatorios/folha/excel?mes=${mes}&ano=${ano}`, '_blank');
  };

  const exportarPDF = (id: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/relatorios/folha/pdf/${id}`, '_blank');
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totalFolha = folhas.reduce((acc, f) => acc + parseFloat(f.salarioLiquido), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Folha de Pagamento</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie os pagamentos da equipe</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportarExcel} className="btn-secondary">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={gerarFolha} disabled={gerando} className="btn-primary">
              {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Gerar Folha do Mês
            </button>
          </div>
        </div>

        {/* Filtros + Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <label className="label">Mês</label>
            <select className="input" value={mes} onChange={e => setMes(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="card">
            <label className="label">Ano</label>
            <select className="input" value={ano} onChange={e => setAno(e.target.value)}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Total da Folha</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{fmt(totalFolha)}</p>
            <p className="text-xs text-blue-500 mt-1">{folhas.length} funcionários</p>
          </div>
        </div>

        {/* Tabela */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="table-header">Funcionário</th>
                  <th className="table-header">Salário Base</th>
                  <th className="table-header">H.E.</th>
                  <th className="table-header">Faltas</th>
                  <th className="table-header">INSS</th>
                  <th className="table-header">Benefícios</th>
                  <th className="table-header">Líquido</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
                ) : folhas.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhuma folha gerada. Clique em "Gerar Folha do Mês"
                  </td></tr>
                ) : folhas.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{f.funcionario?.nome}</p>
                        <p className="text-xs text-gray-400">{f.funcionario?.cargo}</p>
                      </div>
                    </td>
                    <td className="table-cell">{fmt(parseFloat(f.salarioBase))}</td>
                    <td className="table-cell text-orange-600">+{fmt(parseFloat(f.horasExtras50) + parseFloat(f.horasExtras100))}</td>
                    <td className="table-cell text-red-600">-{fmt(parseFloat(f.descontoFaltas))}</td>
                    <td className="table-cell text-red-600">-{fmt(parseFloat(f.inss))}</td>
                    <td className="table-cell text-green-600">+{fmt(parseFloat(f.valeTransporte) + parseFloat(f.valeAlimentacao) + parseFloat(f.bonus))}</td>
                    <td className="table-cell font-bold text-gray-900 dark:text-white">{fmt(parseFloat(f.salarioLiquido))}</td>
                    <td className="table-cell">
                      <span className={clsx('badge', statusColors[f.status])}>{f.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetalhe(f)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => exportarPDF(f.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        {f.status !== 'PAGA' && (
                          <button onClick={() => marcarPaga(f.id)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition-colors">
                            <CheckCircle className="w-4 h-4" />
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
