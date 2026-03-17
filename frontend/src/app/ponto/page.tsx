'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Clock, Plus, ChevronDown, ChevronUp, Loader2, TrendingUp,
  CheckCircle, AlertCircle, Edit3, Save, X, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import PontoManualModal from '@/components/PontoManualModal';

const diasSemana: Record<string, string> = {
  Mon: 'Seg', Tue: 'Ter', Wed: 'Qua', Thu: 'Qui', Fri: 'Sex', Sat: 'Sáb', Sun: 'Dom',
};

const tipoDiaCfg = {
  util:    { label: '',         rowCls: '',                                              dateCls: 'text-gray-700 dark:text-gray-300' },
  sabado:  { label: 'Sáb',     rowCls: 'bg-purple-50/40 dark:bg-purple-900/10',         dateCls: 'text-purple-600 dark:text-purple-400' },
  domingo: { label: 'Dom',     rowCls: 'bg-purple-50/60 dark:bg-purple-900/15',         dateCls: 'text-purple-700 dark:text-purple-300' },
  feriado: { label: 'Feriado', rowCls: 'bg-amber-50/60 dark:bg-amber-900/10',           dateCls: 'text-amber-600 dark:text-amber-400' },
};

function fmtH(h: number) {
  if (!h || h <= 0) return '—';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h${mm > 0 ? mm.toString().padStart(2, '0') : ''}`;
}

function fmtTime(dt: string | null | undefined) {
  if (!dt) return '';
  try {
    const d = new Date(dt);
    // Exibir em UTC para evitar conversão de timezone (-3h no Brasil)
    return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
  } catch { return ''; }
}

// Converte "HH:MM" de hora + data "yyyy-MM-dd" em ISO string sem problema de timezone
// Sem o 'Z' no final — o backend vai adicionar Z para forçar UTC
function toDateTime(data: string, hora: string) {
  if (!hora) return undefined;
  return `${data}T${hora}:00`;
}

interface DiaResumo {
  data: string;
  diaSemana: string;
  tipoDia: 'util' | 'sabado' | 'domingo' | 'feriado';
  ponto: any;
  horasTrabalhadas: number;
  horasExtras50: number;
  horasExtras100: number;
}

interface Totais {
  horasTrabalhadas: number;
  horasExtras: number;
  horasExtras50: number;
  horasExtras100: number;
  diasTrabalhados: number;
  diasUteis: number;
}

// Linha editável inline
function LinhaEditavel({ dia, funcId, cargaHoraria, onSalvo }: {
  dia: DiaResumo; funcId: string; cargaHoraria: string; onSalvo: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [vals, setVals] = useState({
    entrada: fmtTime(dia.ponto?.entrada),
    saidaAlmoco: fmtTime(dia.ponto?.saidaAlmoco),
    retornoAlmoco: fmtTime(dia.ponto?.retornoAlmoco),
    saida: fmtTime(dia.ponto?.saida),
    observacao: dia.ponto?.observacao || '',
  });

  const hoje = format(new Date(), 'yyyy-MM-dd');
  const isHoje = dia.data === hoje;
  const temPonto = !!dia.ponto?.entrada;
  const cfg = tipoDiaCfg[dia.tipoDia] || tipoDiaCfg.util;
  const isFimSemanaOuFeriado = dia.tipoDia !== 'util';

  const salvar = async () => {
    setSalvando(true);
    try {
      const payload: any = { funcionarioId: funcId, data: dia.data };
      if (vals.entrada) payload.entrada = toDateTime(dia.data, vals.entrada);
      if (vals.saidaAlmoco) payload.saidaAlmoco = toDateTime(dia.data, vals.saidaAlmoco);
      if (vals.retornoAlmoco) payload.retornoAlmoco = toDateTime(dia.data, vals.retornoAlmoco);
      if (vals.saida) payload.saida = toDateTime(dia.data, vals.saida);
      if (vals.observacao) payload.observacao = vals.observacao;
      await api.post('/api/pontos/manual', payload);
      toast.success('Ponto salvo.');
      setEditando(false);
      onSalvo();
    } catch { toast.error('Não foi possível salvar.'); }
    finally { setSalvando(false); }
  };

  const cancelar = () => {
    setVals({
      entrada: fmtTime(dia.ponto?.entrada),
      saidaAlmoco: fmtTime(dia.ponto?.saidaAlmoco),
      retornoAlmoco: fmtTime(dia.ponto?.retornoAlmoco),
      saida: fmtTime(dia.ponto?.saida),
      observacao: dia.ponto?.observacao || '',
    });
    setEditando(false);
  };

  const inputCls = 'w-20 px-1.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500';

  return (
    <tr className={clsx(
      'transition-colors group',
      isHoje ? 'bg-blue-50/70 dark:bg-blue-900/10' : cfg.rowCls,
      editando && 'bg-amber-50/60 dark:bg-amber-900/10',
    )}>
      {/* Data */}
      <td className="table-cell w-24">
        <div className="flex items-center gap-1.5">
          {isHoje && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
          <div>
            <p className={clsx('font-semibold text-xs', isHoje ? 'text-blue-600' : cfg.dateCls)}>
              {format(new Date(dia.data + 'T12:00:00'), 'dd/MM')}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400">{diasSemana[dia.diaSemana] || dia.diaSemana}</p>
              {cfg.label && (
                <span className={clsx(
                  'text-[9px] font-bold px-1 rounded',
                  dia.tipoDia === 'feriado' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                  (dia.tipoDia === 'sabado' || dia.tipoDia === 'domingo') && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                )}>{cfg.label}</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Horários */}
      {editando ? (
        <>
          <td className="table-cell"><input type="time" className={inputCls} value={vals.entrada} onChange={e => setVals(v => ({ ...v, entrada: e.target.value }))} /></td>
          <td className="table-cell hidden sm:table-cell"><input type="time" className={inputCls} value={vals.saidaAlmoco} onChange={e => setVals(v => ({ ...v, saidaAlmoco: e.target.value }))} /></td>
          <td className="table-cell hidden sm:table-cell"><input type="time" className={inputCls} value={vals.retornoAlmoco} onChange={e => setVals(v => ({ ...v, retornoAlmoco: e.target.value }))} /></td>
          <td className="table-cell"><input type="time" className={inputCls} value={vals.saida} onChange={e => setVals(v => ({ ...v, saida: e.target.value }))} /></td>
          <td className="table-cell" colSpan={2}>
            <input className="w-full px-1.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Observação..." value={vals.observacao} onChange={e => setVals(v => ({ ...v, observacao: e.target.value }))} />
          </td>
          <td className="table-cell hidden md:table-cell" />
        </>
      ) : (
        <>
          <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">{fmtTime(dia.ponto?.entrada) || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
          <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400 hidden sm:table-cell">{fmtTime(dia.ponto?.saidaAlmoco) || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
          <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400 hidden sm:table-cell">{fmtTime(dia.ponto?.retornoAlmoco) || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
          <td className="table-cell font-mono text-xs text-gray-600 dark:text-gray-400">{fmtTime(dia.ponto?.saida) || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
          <td className="table-cell">
            {temPonto ? (
              <span className={clsx('font-semibold text-xs',
                isFimSemanaOuFeriado ? 'text-red-500' :
                dia.horasTrabalhadas >= parseFloat(cargaHoraria) ? 'text-emerald-600' : 'text-amber-500'
              )}>
                {fmtH(dia.horasTrabalhadas)}
              </span>
            ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
          </td>
          <td className="table-cell">
            <div className="flex items-center gap-1">
              {dia.horasExtras50 > 0 && <span className="badge bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 text-xs">{fmtH(dia.horasExtras50)} 50%</span>}
              {dia.horasExtras100 > 0 && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs">{fmtH(dia.horasExtras100)} 100%</span>}
              {!dia.horasExtras50 && !dia.horasExtras100 && <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
            </div>
          </td>
          <td className="table-cell hidden md:table-cell text-xs text-gray-400 max-w-[100px] truncate">
            {dia.ponto?.observacao || ''}
          </td>
        </>
      )}

      {/* Ações */}
      <td className="table-cell w-16">
        {editando ? (
          <div className="flex items-center gap-1">
            <button onClick={salvar} disabled={salvando}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors" title="Salvar">
              {salvando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            </button>
            <button onClick={cancelar} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors" title="Cancelar">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditando(true)}
            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Editar este dia">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

function CardFuncionario({ func, mes, ano, cargaHoraria, setModalOpen, setModalFunc }: any) {
  const [aberto, setAberto] = useState(false);
  const [resumo, setResumo] = useState<{ dias: DiaResumo[]; totais: Totais; cargaHoraria: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [batendo, setBatendo] = useState<string | null>(null);
  const carregouRef = useRef(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/pontos/funcionario/${func.id}/resumo`, {
        params: { mes, ano, cargaHoraria },
      });
      setResumo(res.data);
      carregouRef.current = true;
    } finally { setLoading(false); }
  }, [func.id, mes, ano, cargaHoraria]);

  useEffect(() => {
    if (aberto) carregar();
  }, [aberto, mes, ano, cargaHoraria]);

  const toggle = () => setAberto(v => !v);

  const bater = async (tipo: string) => {
    setBatendo(tipo);
    try {
      await api.post('/api/pontos/bater', { funcionarioId: func.id, tipo });
      toast.success('Ponto registrado.');
      carregar();
    } catch { toast.error('Não foi possível registrar o ponto.'); }
    finally { setBatendo(null); }
  };

  const hoje = format(new Date(), 'yyyy-MM-dd');
  const pontoHoje = resumo?.dias.find(d => d.data === hoje);

  const proximoTipo = (): string | null => {
    if (!pontoHoje?.ponto?.entrada) return 'entrada';
    if (!pontoHoje?.ponto?.saidaAlmoco) return 'saida_almoco';
    if (!pontoHoje?.ponto?.retornoAlmoco) return 'retorno_almoco';
    if (!pontoHoje?.ponto?.saida) return 'saida';
    return null;
  };

  const tipoLabel: Record<string, string> = {
    entrada: '▶ Entrada', saida_almoco: '⏸ Saída Almoço',
    retorno_almoco: '▶ Retorno', saida: '⏹ Saída',
  };

  const prox = proximoTipo();
  const diaCompleto = pontoHoje?.ponto?.saida;

  return (
    <div className={clsx('card p-0 overflow-hidden transition-all', aberto && 'shadow-md')}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={toggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {func.nome.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{func.nome}</p>
            <p className="text-xs text-gray-400 truncate">{func.cargo}</p>
          </div>
        </button>

        {/* Resumo rápido visível */}
        {resumo && (
          <div className="hidden md:flex items-center gap-4 text-xs flex-shrink-0">
            <div className="text-center min-w-[40px]">
              <p className="font-bold text-gray-900 dark:text-white">{resumo.totais.diasTrabalhados}/{resumo.totais.diasUteis}</p>
              <p className="text-gray-400">dias</p>
            </div>
            <div className="text-center min-w-[48px]">
              <p className="font-bold text-blue-600">{fmtH(resumo.totais.horasTrabalhadas)}</p>
              <p className="text-gray-400">trabalhadas</p>
            </div>
            <div className="text-center min-w-[48px]">
              <p className={clsx('font-bold', resumo.totais.horasExtras50 > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600')}>
                {fmtH(resumo.totais.horasExtras50)}
              </p>
              <p className="text-gray-400">H.E. 50%</p>
            </div>
            <div className="text-center min-w-[48px]">
              <p className={clsx('font-bold', resumo.totais.horasExtras100 > 0 ? 'text-red-500' : 'text-gray-300 dark:text-gray-600')}>
                {fmtH(resumo.totais.horasExtras100)}
              </p>
              <p className="text-gray-400">H.E. 100%</p>
            </div>
          </div>
        )}

        {/* Botão bater ponto hoje */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {diaCompleto ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" /> Completo
            </span>
          ) : prox ? (
            <button onClick={() => bater(prox)} disabled={!!batendo}
              className="btn-primary py-1.5 px-3 text-xs">
              {batendo ? <Loader2 className="w-3 h-3 animate-spin" /> : tipoLabel[prox]}
            </button>
          ) : null}

          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {aberto && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-400">Carregando registros...</span>
            </div>
          ) : resumo ? (
            <>
              {/* Totais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/30">
                {[
                  { label: 'Dias trabalhados', value: `${resumo.totais.diasTrabalhados}/${resumo.totais.diasUteis}`, color: 'text-gray-900 dark:text-white' },
                  { label: 'Total trabalhado', value: fmtH(resumo.totais.horasTrabalhadas), color: 'text-blue-600' },
                  { label: 'H.E. 50%', value: fmtH(resumo.totais.horasExtras50), color: resumo.totais.horasExtras50 > 0 ? 'text-orange-500' : 'text-gray-400' },
                  { label: 'H.E. 100%', value: fmtH(resumo.totais.horasExtras100), color: resumo.totais.horasExtras100 > 0 ? 'text-red-500' : 'text-gray-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
                    <p className={clsx('text-base font-bold', color)}>{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Dica inline */}
              <div className="px-4 py-2 flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/5 border-b border-gray-100 dark:border-gray-800">
                <Edit3 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-gray-400">Passe o mouse sobre um dia e clique no lápis para editar diretamente na tabela.</p>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="table-header w-20">Data</th>
                      <th className="table-header">Entrada</th>
                      <th className="table-header hidden sm:table-cell">S. Almoço</th>
                      <th className="table-header hidden sm:table-cell">R. Almoço</th>
                      <th className="table-header">Saída</th>
                      <th className="table-header">Trabalhadas</th>
                      <th className="table-header">Extras</th>
                      <th className="table-header hidden md:table-cell">Obs.</th>
                      <th className="table-header w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {resumo.dias.map(dia => (
                      <LinhaEditavel
                        key={dia.data}
                        dia={dia}
                        funcId={func.id}
                        cargaHoraria={cargaHoraria}
                        onSalvo={carregar}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-xs text-gray-400">Carga: {cargaHoraria}h/dia · Sáb/Dom/Feriado = 100% · Dia útil extras = 50%</p>
                <div className="flex items-center gap-2">
                  <button onClick={carregar} className="btn-ghost text-xs py-1.5 px-2.5">
                    <RefreshCw className="w-3 h-3" /> Atualizar
                  </button>
                  <button onClick={() => { setModalFunc(func); setModalOpen(true); }}
                    className="btn-secondary text-xs py-1.5 px-3">
                    <Plus className="w-3 h-3" /> Lançamento manual
                  </button>
                </div>
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
  const [cargaHoraria, setCargaHoraria] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('cargaHoraria') || '8' : '8'
  );
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.get('/api/funcionarios', { params: { limit: 100, status: 'ATIVO' } })
      .then(res => setFuncionarios(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCarga = (v: string) => {
    setCargaHoraria(v);
    localStorage.setItem('cargaHoraria', v);
  };

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
            <p className="page-subtitle capitalize">
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
              <label className="label">
                Carga horária/dia
                <span className="ml-1 text-blue-500 font-normal normal-case tracking-normal">(salvo automaticamente)</span>
              </label>
              <input
                className="input w-28 font-mono text-center"
                type="time"
                value={(() => {
                  const h = Math.floor(parseFloat(cargaHoraria));
                  const m = Math.round((parseFloat(cargaHoraria) - h) * 60);
                  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                })()}
                onChange={e => {
                  const [hh, mm] = e.target.value.split(':').map(Number);
                  const decimal = hh + mm / 60;
                  handleCarga(decimal.toFixed(4));
                }}
                title="Ex: 08:48 = 8h48min por dia"
              />
              <p className="text-xs text-gray-400 mt-1">
                {(() => {
                  const h = Math.floor(parseFloat(cargaHoraria));
                  const m = Math.round((parseFloat(cargaHoraria) - h) * 60);
                  return `${h}h${m > 0 ? m.toString().padStart(2,'0') + 'min' : ''} por dia`;
                })()}
              </p>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="label">Buscar funcionário</label>
              <input className="input" placeholder="Nome ou cargo..." value={busca}
                onChange={e => setBusca(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-4 px-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Horas completas</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Horas incompletas</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-400 inline-block" /> H.E. 50% (dia útil)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> H.E. 100% (sáb/dom/feriado)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-400 inline-block" /> Sábado / Domingo</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Feriado</span>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm text-gray-400">Carregando funcionários...</span>
          </div>
        ) : funcFiltrados.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Nenhum funcionário ativo encontrado</p>
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
