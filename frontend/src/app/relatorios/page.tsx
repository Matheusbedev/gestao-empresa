'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import RelatorioFiltros from '@/components/RelatorioFiltros';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Download,
  Loader2,
  Eye,
  Printer,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';

interface Relatorio {
  id: string;
  [key: string]: any;
}

export default function RelatoriosPage() {
  const { user, loading: sessionLoading } = useAuth();
  const router = useRouter();
  const [tipoRelatorio, setTipoRelatorio] = useState<'ponto' | 'faltas' | 'folha' | 'financeiro'>('ponto');
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filtros, setFiltros] = useState({});

  useEffect(() => {
    if (!sessionLoading && !user) router.replace('/login');
  }, [sessionLoading, user, router]);

  const carregarRelatorios = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filtros,
      });

      const endpoint = `/api/relatorios/avancado/${tipoRelatorio}/avancado?${params}`;
      const res = await api.get(endpoint);

      setRelatorios(res.data.data);
      setPagination(res.data.pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorios(1);
  }, [tipoRelatorio, filtros]);

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        tipo: tipoRelatorio,
        ...filtros,
      });

      const url = `/api/relatorios/avancado/gerar/${formato}?${params}`;
      window.open(url, '_blank');
      toast.success(`Relatório exportado em ${formato.toUpperCase()}`);
    } catch (err) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const getTituloRelatorio = () => {
    const titulos = {
      ponto: 'Relatório de Ponto',
      faltas: 'Relatório de Faltas',
      folha: 'Relatório de Folha de Pagamento',
      financeiro: 'Relatório Financeiro',
    };
    return titulos[tipoRelatorio];
  };

  const getIconeRelatorio = () => {
    const icones = {
      ponto: <Calendar className="h-5 w-5" />,
      faltas: <Users className="h-5 w-5" />,
      folha: <BarChart3 className="h-5 w-5" />,
      financeiro: <TrendingUp className="h-5 w-5" />,
    };
    return icones[tipoRelatorio];
  };

  if (sessionLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIconeRelatorio()}
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Relatórios</h1>
              <p className="text-sm text-[var(--text-muted)]">Gere e analise relatórios detalhados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportar('pdf')}
              className="btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => handleExportar('excel')}
              className="btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={handleImprimir}
              className="btn-secondary flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Seleção de Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {(['ponto', 'faltas', 'folha', 'financeiro'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setTipoRelatorio(tipo)}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoRelatorio === tipo
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--border)] hover:border-[var(--primary)]'
              }`}
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {tipo === 'ponto' && 'Ponto'}
                {tipo === 'faltas' && 'Faltas'}
                {tipo === 'folha' && 'Folha'}
                {tipo === 'financeiro' && 'Financeiro'}
              </div>
            </button>
          ))}
        </div>

        {/* Filtros */}
        <RelatorioFiltros tipo={tipoRelatorio} onFiltrar={setFiltros} />

        {/* Tabela de Resultados */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : relatorios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
              <FileText className="h-12 w-12 mb-2 opacity-50" />
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                    <tr>
                      {tipoRelatorio === 'ponto' && (
                        <>
                          <th className="px-6 py-3 text-left font-semibold">Funcionário</th>
                          <th className="px-6 py-3 text-left font-semibold">Data</th>
                          <th className="px-6 py-3 text-left font-semibold">Entrada</th>
                          <th className="px-6 py-3 text-left font-semibold">Saída</th>
                          <th className="px-6 py-3 text-left font-semibold">Tipo</th>
                        </>
                      )}
                      {tipoRelatorio === 'faltas' && (
                        <>
                          <th className="px-6 py-3 text-left font-semibold">Funcionário</th>
                          <th className="px-6 py-3 text-left font-semibold">Data</th>
                          <th className="px-6 py-3 text-left font-semibold">Tipo</th>
                          <th className="px-6 py-3 text-left font-semibold">Motivo</th>
                        </>
                      )}
                      {tipoRelatorio === 'folha' && (
                        <>
                          <th className="px-6 py-3 text-left font-semibold">Funcionário</th>
                          <th className="px-6 py-3 text-left font-semibold">Mês/Ano</th>
                          <th className="px-6 py-3 text-right font-semibold">Salário Base</th>
                          <th className="px-6 py-3 text-right font-semibold">Líquido</th>
                          <th className="px-6 py-3 text-left font-semibold">Status</th>
                        </>
                      )}
                      {tipoRelatorio === 'financeiro' && (
                        <>
                          <th className="px-6 py-3 text-left font-semibold">Descrição</th>
                          <th className="px-6 py-3 text-left font-semibold">Categoria</th>
                          <th className="px-6 py-3 text-right font-semibold">Valor</th>
                          <th className="px-6 py-3 text-left font-semibold">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {relatorios.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-secondary)] transition-colors">
                        {tipoRelatorio === 'ponto' && (
                          <>
                            <td className="px-6 py-3">{item.funcionario?.nome}</td>
                            <td className="px-6 py-3">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-3">{item.entrada ? new Date(item.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td className="px-6 py-3">{item.saida ? new Date(item.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                            <td className="px-6 py-3"><span className="badge">{item.tipo}</span></td>
                          </>
                        )}
                        {tipoRelatorio === 'faltas' && (
                          <>
                            <td className="px-6 py-3">{item.funcionario?.nome}</td>
                            <td className="px-6 py-3">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-3"><span className="badge">{item.tipo}</span></td>
                            <td className="px-6 py-3">{item.motivo || '-'}</td>
                          </>
                        )}
                        {tipoRelatorio === 'folha' && (
                          <>
                            <td className="px-6 py-3">{item.funcionario?.nome}</td>
                            <td className="px-6 py-3">{item.mes}/{item.ano}</td>
                            <td className="px-6 py-3 text-right">R$ {parseFloat(item.salarioBase).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-3 text-right font-semibold">R$ {parseFloat(item.salarioLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-3"><span className="badge">{item.status}</span></td>
                          </>
                        )}
                        {tipoRelatorio === 'financeiro' && (
                          <>
                            <td className="px-6 py-3">{item.descricao}</td>
                            <td className="px-6 py-3">{item.categoria}</td>
                            <td className="px-6 py-3 text-right">R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-3"><span className="badge">{item.status}</span></td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)]">
                    Página {pagination.page} de {pagination.pages} ({pagination.total} registros)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => carregarRelatorios(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn-secondary py-1 px-3 text-sm disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => carregarRelatorios(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="btn-secondary py-1 px-3 text-sm disabled:opacity-50"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
