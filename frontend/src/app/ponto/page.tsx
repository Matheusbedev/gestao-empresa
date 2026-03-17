'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Clock, Plus, ChevronDown, ChevronUp, Loader2, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import PontoManualModal from '@/components/PontoManualModal';
import { useAuth } from '@/contexts/AuthContext';

const diasSemana: Record<string, string> = {
  Mon: 'Seg', Tue: 'Ter', Wed: 'Qua', Thu: 'Qui', Fri: 'Sex',
};

function fmtH(h: number) {
  if (!h) return '—';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h${mm > 0 ? `${mm.toString().padStart(2, '0')}` : ''}`;
}

function fmtTime(dt: string | null) {
  if (!dt) return '—';
  return format(new Date(dt), 'HH:mm');
}

interface ResumoFuncionario {
  funcionario: { id: string; nome: string; cargo: string; salarioBase: string };
  dias: any[];
  totais: { horasTrabalhadas: number; horasExtras: number; horasExtras50: number; horasExtras100: number; diasTrabalhados: number; diasUteis: number };
  cargaHoraria: number;
}

function CardFuncionario({ func, mes, ano, cargaHoraria, modalOpen, setModalOpen, setModalFunc }: any) {
  const [aberto, setAberto] = useState(false);
  const [resumo, setResumo] = useState<ResumoFuncionario | null>(null);
  const [loading, setLoading] = useState(false);
  const [batendo, setBatendo] = useState<string | null>(null);
  const { user } = useAuth();

  const carregar = async () => {
    if (resumo && !loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/pontos/funcionario/${func.id}/resumo`, {
        params: { mes, ano, cargaHoraria },
      });
      setResumo(res.data);
    } finally { setLoading(false); }
  };

  const toggle = () => {
    if (!aberto) carregar();
    setAberto(v => !v);
  };

  const recarregar = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/pontos/funcionario/${func.id}/resumo`, {
        params: { mes, ano, cargaHoraria },
      });
      setResumo(res.data);
    } finally { setLoading(false); }
  };

  const bater = async (tipo: string) => {
    setBatendo(tipo);
    try {
      await api.post('/api/pontos/bater', { funcionarioId: func.id, tipo });
      toast.success('Ponto registrado.');
      recarregar();
    } catch { toast.error('Não foi possível registrar o ponto.'); }
    finally { setBatendo(null); }
  };

  const hoje = format(new Date(), 'yyyy-MM-dd');
  const pontoHoje = resumo?.dias.find(d => d.data === hoje);

  const proximoTipo = () => {
    if (!pontoHoje?.ponto?.entrada) return 'entrada';
    if (!pontoHoje?.ponto?.saidaAlmoco) return 'saida_almoco';
    if (!pontoHoje?.ponto?.retornoAlmoco) return 'retorno_almoco';
    if (!pontoHoje?.ponto?.saida) return 'saida';
    return null;
  };

  const tipoLabel: Record<string, string> = {
    entrada: 'Entrada', saida_almoco: 'Saída Almoço',
    retorno_almoco: 'Retorno', saida: 'Saída',
  };

  const prox = proximoTipo();

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header do card */}
      <button onClick={toggle} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {func.nome.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{func.nome}</p>
          <p className="text-xs text-gray-400 truncate">{func.cargo}</p>
        </div>

        {/* Resumo rápido */}
        {resumo && (
          <div className="hidden sm:flex items-center gap-4 text-xs flex-shrink-0">
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">{resumo.totais.diasTrabalhados}/{resumo.totais.diasUteis}</p>
              <p className="text-gray-400">dias</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{fmtH(resumo.totais.horasTrabalhadas)}</p>
              <p className="text-gray-400">trabalhadas</p>
            </div>
            {resumo.totais.horasExtras50 > 0 && (
              <div className="text-center">
                <p className="font-bold text-orange-500">{fmtH(resumo.totais.horasExtras50)}</p>
                <p className="text-gray-400">H.E. 50%</p>
              </div>
            )}
            {resumo.totais.horasExtras100 > 0 && (
              <div className="text-center">
                <p className="font-bold text-red-500">{fmtH(resumo.totais.horasExtras100)}</p>
                <p className="text-gray-400">H.E. 100%</p>
              </div>
            )}
          </div>
        )}

        {/* Botão ponto hoje */}
        {prox && (
          <button
            onClick={e => { e.stopPropagation(); bater(prox); }}
            disabled={!!batendo}
            className="btn-primary py-1.5 px-3 text-xs flex-shrink-0"
          >
            {batendo ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Clock className="w-3 h-3" /> {tipoLabel[prox]}</>}
          </button>
        )}
        {!prox && pontoHoje?.ponto?.saida && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Completo
          </span>
        )}

        {aberto ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {/* Conteúdo expandido */}
      {aberto && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : resumo ? (
            <>
              {/* Totais do mês */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/30">
                {[
                  { label: 'Dias trabalhados', value: `${resumo.totais.diasTrabalhados}/${resumo.totais.diasUteis}`, color: 'text-gray-900 dark:text-white' },
                  { label: 'Total de horas', value: fmtH(resumo.totais.horasTrabalhadas), color: 'text-blue-600' },
                  { label: 'H.E. 50%', value: fmtH(resumo.totais.horasExtras50), color: 'text-orange-500' },
                  { label: 'H.E. 100%', value: fmtH(resumo.totais.horasExtras100), color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
                    <p className={clsx('text-lg font-bold', color)}>{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Tabela de dias */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="table-header w-24">Data</th>
                      <th className="table-header">Entrada</th>
                      <th className="table-header hidden sm:table-cell">S. Almoço</th>
                      <th className="table-header hidden sm:table-cell">R. Almoço</th>
                      <th className="table-header">Saída</th>
                      <th className="table-header">Trabalhadas</th>
                      <th className="table-header">H.E. 50%</th>
                      <th className="table-header">H.E. 100%</th>
                      <th className="table-header hidden md:table-cell">Obs.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {resumo.dias.map(dia => {
                      const isHoje = dia.data === hoje;
                      const temPonto = !!dia.ponto?.entrada;
                      return (
                        <tr key={dia.data} className={clsx(
                          'transition-colors',
                          isHoje ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/20',
                        )}>
                          <td className="table-cell">
                            <div className="flex items-center gap-1.5">
                              {isHoje && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                              <div>
                                <p className={clsx('font-semibold text-xs', isHoje ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300')}>
                                  {format(new Date(dia.data + 'T12:00:00'), 'dd/MM')}
                                </p>
                                <p className="text-xs text-gray-400">{diasSemana[dia.diaSemana] || dia.diaSemana}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell font-mono text-xs">{fmtTime(dia.ponto?.entrada)}</td>
                          <td className="table-cell font-mono text-xs hidden sm:table-cell">{fmtTime(dia.ponto?.saidaAlmoco)}</td>
                          <td className="table-cell font-mono text-xs hidden sm:table-cell">{fmtTime(dia.ponto?.retornoAlmoco)}</td>
                          <td className="table-cell font-mono text-xs">{fmtTime(dia.ponto?.saida)}</td>
                          <td className="table-cell">
                            {temPonto ? (
                              <span className={clsx('font-semibold text-xs', dia.horasTrabalhadas >= resumo.cargaHoraria ? 'text-emerald-600' : 'text-amber-500')}>
                                {fmtH(dia.horasTrabalhadas)}
                              </span>
                            ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="table-cell">
                            {dia.horasExtras50 > 0
                              ? <span className="badge bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 text-xs">{fmtH(dia.horasExtras50)}</span>
                              : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="table-cell">
                            {dia.horasExtras100 > 0
                              ? <span className="badge bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs">{fmtH(dia.horasExtras100)}</span>
                              : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="table-cell hidden md:table-cell text-xs text-gray-400 max-w-[120px] truncate">
                            {dia.ponto?.observacao || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ação manual */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button onClick={() => { setModalFunc(func); setModalOpen(true); }}
                  className="btn-secondary text-xs py-1.5 px-3">
                  <Plus className="w-3 h-3" /> Lançamento manual
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function PontoPage() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFunc, setModalFunc] = useState<any>(null);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [cargaHoraria, setCargaHoraria] = useState('8');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.get('/api/funcionarios', { params: { limit: 100, status: 'ATIVO' } })
      .then(res => setFuncionarios(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const funcFiltrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.cargo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Controle de Ponto</h1>
            <p className="page-subtitle">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <button onClick={() => { setModalFunc(null); setModalOpen(true); }} className="btn-primary flex-shrink-0">
            <Plus className="w-4 h-4" /> Lançamento Manual
          </button>
        </div>

        {/* Filtros */}
        <div className="card py-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">Mês</label>
              <select className="input w-36" value={mes} onChange={e => setMes(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ano</label>
              <select className="input w-24" value={ano} onChange={e => setAno(e.target.value)}>
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Carga horária diária</label>
              <select className="input w-32" value={cargaHoraria} onChange={e => setCargaHoraria(e.target.value)}>
                {[6, 7, 8, 9, 10].map(h => <option key={h} value={h}>{h}h / dia</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="label">Buscar funcionário</label>
              <input className="input" placeholder="Nome ou cargo..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Info carga horária */}
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            H.E. 50% = até 2h acima da carga diária · H.E. 100% = acima de 2h extras · Carga atual: <strong>{cargaHoraria}h/dia</strong>
          </p>
        </div>

        {/* Lista de funcionários */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : funcFiltrados.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Nenhum funcionário encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {funcFiltrados.map(f => (
              <CardFuncionario
                key={f.id}
                func={f}
                mes={mes}
                ano={ano}
                cargaHoraria={cargaHoraria}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                setModalFunc={setModalFunc}
              />
            ))}
          </div>
        )}
      </div>

      <PontoManualModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalFunc(null); }}
        funcionarios={funcionarios}
        funcionarioPreSelecionado={modalFunc}
        onSave={() => { setModalOpen(false); setModalFunc(null); }}
      />
    </Layout>
  );
}
