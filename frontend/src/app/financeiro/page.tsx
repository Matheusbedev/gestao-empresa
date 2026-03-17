'use client';
import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, CheckCircle,
  XCircle, Download, FileText, FileSpreadsheet, Loader2, Bell,
  AlertTriangle, Edit2, X, RefreshCw, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const hoje = new Date().toISOString().split('T')[0];

const categoriasDespesa = ['Aluguel','Energia','Água','Internet','Telefone','Folha','Impostos','Fornecedores','Manutenção','Marketing','Outros'];
const categoriasReceita = ['Vendas','Serviços','Investimentos','Reembolso','Outros'];

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDENTE: { label: 'Pendente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  PAGA:     { label: 'Paga',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  VENCIDA:  { label: 'Vencida',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  CANCELADA:{ label: 'Cancelada',cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

// ── Modal Conta ───────────────────────────────────────────────
function ContaModal({ open, onClose, onSave, editando }: any) {
  const [form, setForm] = useState({ descricao:'', valor:'', vencimento: hoje, categoria:'Outros', tipo:'DESPESA', lembrete: false, lembreteAntecedencia:'3', observacao:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editando) {
        setForm({
          descricao: editando.descricao, valor: String(editando.valor),
          vencimento: editando.vencimento?.split('T')[0] || hoje,
          categoria: editando.categoria, tipo: editando.tipo,
          lembrete: editando.lembrete, lembreteAntecedencia: String(editando.lembreteAntecedencia),
          observacao: editando.observacao || '',
        });
      } else {
        setForm({ descricao:'', valor:'', vencimento: hoje, categoria:'Outros', tipo:'DESPESA', lembrete: false, lembreteAntecedencia:'3', observacao:'' });
      }
    }
  }, [open, editando]);

  const salvar = async () => {
    if (!form.descricao || !form.valor || !form.vencimento) { toast.error('Preencha os campos obrigatórios.'); return; }
    setSaving(true);
    try {
      if (editando) await api.put(`/api/financeiro/contas/${editando.id}`, form);
      else await api.post('/api/financeiro/contas', form);
      toast.success(editando ? 'Conta atualizada.' : 'Conta cadastrada.');
      onSave();
    } catch { toast.error('Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{editando ? 'Editar Conta' : 'Nova Conta / Despesa'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Descrição *</label>
              <input className="input" placeholder="Ex: Aluguel do escritório" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} />
            </div>
            <div>
              <label className="label">Valor *</label>
              <input className="input" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={e => setForm(f => ({...f, valor: e.target.value}))} />
            </div>
            <div>
              <label className="label">Vencimento *</label>
              <input className="input" type="date" value={form.vencimento} onChange={e => setForm(f => ({...f, vencimento: e.target.value}))} />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
                {categoriasDespesa.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
                <option value="DESPESA">Despesa</option>
                <option value="INVESTIMENTO">Investimento</option>
                <option value="IMPOSTO">Imposto</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Observação</label>
              <input className="input" placeholder="Opcional..." value={form.observacao} onChange={e => setForm(f => ({...f, observacao: e.target.value}))} />
            </div>
            <div className="col-span-2 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
              <input type="checkbox" id="lembrete" checked={form.lembrete} onChange={e => setForm(f => ({...f, lembrete: e.target.checked}))} className="w-4 h-4 accent-amber-500" />
              <label htmlFor="lembrete" className="text-sm text-amber-700 dark:text-amber-400 font-semibold flex-1">Ativar lembrete</label>
              {form.lembrete && (
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="30" className="input w-16 py-1.5 text-xs" value={form.lembreteAntecedencia} onChange={e => setForm(f => ({...f, lembreteAntecedencia: e.target.value}))} />
                  <span className="text-xs text-amber-600">dias antes</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={salvar} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Salvar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Receita ─────────────────────────────────────────────
function ReceitaModal({ open, onClose, onSave, editando }: any) {
  const [form, setForm] = useState({ descricao:'', valor:'', data: hoje, categoria:'Outros', origem:'', observacao:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editando) {
        setForm({ descricao: editando.descricao, valor: String(editando.valor), data: editando.data?.split('T')[0] || hoje, categoria: editando.categoria, origem: editando.origem || '', observacao: editando.observacao || '' });
      } else {
        setForm({ descricao:'', valor:'', data: hoje, categoria:'Outros', origem:'', observacao:'' });
      }
    }
  }, [open, editando]);

  const salvar = async () => {
    if (!form.descricao || !form.valor || !form.data) { toast.error('Preencha os campos obrigatórios.'); return; }
    setSaving(true);
    try {
      if (editando) await api.put(`/api/financeiro/receitas/${editando.id}`, form);
      else await api.post('/api/financeiro/receitas', form);
      toast.success(editando ? 'Receita atualizada.' : 'Receita cadastrada.');
      onSave();
    } catch { toast.error('Não foi possível salvar.'); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{editando ? 'Editar Receita' : 'Nova Receita'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Descrição *</label>
              <input className="input" placeholder="Ex: Pagamento cliente XYZ" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} />
            </div>
            <div>
              <label className="label">Valor *</label>
              <input className="input" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={e => setForm(f => ({...f, valor: e.target.value}))} />
            </div>
            <div>
              <label className="label">Data *</label>
              <input className="input" type="date" value={form.data} onChange={e => setForm(f => ({...f, data: e.target.value}))} />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
                {categoriasReceita.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Origem</label>
              <input className="input" placeholder="Ex: Empresa ABC" value={form.origem} onChange={e => setForm(f => ({...f, origem: e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="label">Observação</label>
              <input className="input" placeholder="Opcional..." value={form.observacao} onChange={e => setForm(f => ({...f, observacao: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={salvar} disabled={saving} className="btn-success flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingUp className="w-4 h-4" /> Salvar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────
export default function FinanceiroPage() {
  const [tab, setTab] = useState<'contas'|'receitas'>('contas');
  const [contas, setContas] = useState<any[]>([]);
  const [receitas, setReceitas] = useState<any[]>([]);
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [modalConta, setModalConta] = useState(false);
  const [modalReceita, setModalReceita] = useState(false);
  const [editandoConta, setEditandoConta] = useState<any>(null);
  const [editandoReceita, setEditandoReceita] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, rRes, sumRes] = await Promise.all([
        api.get('/api/financeiro/contas', { params: { mes, ano, status: filtroStatus || undefined, limit: 100 } }),
        api.get('/api/financeiro/receitas', { params: { mes, ano, limit: 100 } }),
        api.get('/api/financeiro/resumo', { params: { mes, ano } }),
      ]);
      setContas(cRes.data.data);
      setReceitas(rRes.data.data);
      setResumo(sumRes.data);
    } finally { setLoading(false); }
  }, [mes, ano, filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);

  const pagarConta = async (id: string) => {
    try { await api.patch(`/api/financeiro/contas/${id}/pagar`); toast.success('Marcada como paga.'); carregar(); }
    catch { toast.error('Erro ao marcar como paga.'); }
  };
  const desmarcarConta = async (id: string) => {
    try { await api.patch(`/api/financeiro/contas/${id}/desmarcar`); toast.success('Pagamento desmarcado.'); carregar(); }
    catch { toast.error('Erro ao desmarcar.'); }
  };
  const deletarConta = async (id: string) => {
    if (!confirm('Remover esta conta?')) return;
    try { await api.delete(`/api/financeiro/contas/${id}`); toast.success('Conta removida.'); carregar(); }
    catch { toast.error('Erro ao remover.'); }
  };
  const deletarReceita = async (id: string) => {
    if (!confirm('Remover esta receita?')) return;
    try { await api.delete(`/api/financeiro/receitas/${id}`); toast.success('Receita removida.'); carregar(); }
    catch { toast.error('Erro ao remover.'); }
  };

  const exportar = (tipo: 'pdf'|'excel'|'word') => {
    const ext = tipo === 'excel' ? 'excel' : tipo;
    const token = localStorage.getItem('token');
    window.open(`${apiBase}/api/relatorios/financeiro/${ext}?mes=${mes}&ano=${ano}&token=${token}`, '_blank');
  };

  const contasVencendo = resumo?.contasVencendo || [];

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Financeiro</h1>
            <p className="page-subtitle">Controle de contas, despesas e receitas</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => exportar('pdf')} className="btn-secondary text-xs py-2 px-3">
              <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
            </button>
            <button onClick={() => exportar('excel')} className="btn-secondary text-xs py-2 px-3">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel
            </button>
            <button onClick={() => exportar('word')} className="btn-secondary text-xs py-2 px-3">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Word
            </button>
            <button onClick={() => { setEditandoReceita(null); setModalReceita(true); }} className="btn-success text-sm">
              <TrendingUp className="w-4 h-4" /> Nova Receita
            </button>
            <button onClick={() => { setEditandoConta(null); setModalConta(true); }} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Nova Conta
            </button>
          </div>
        </div>

        {/* Alertas de vencimento */}
        {contasVencendo.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse-soft" />
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Contas vencendo nos próximos 7 dias</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {contasVencendo.map((c: any) => (
                  <span key={c.id} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full font-semibold">
                    {c.descricao} — {fmt(c.valor)} · {new Date(c.vencimento).toLocaleDateString('pt-BR')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {[
            { label: 'Receitas', value: fmt(resumo?.totalReceitas || 0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', sub: `${resumo?.qtdReceitas || 0} lançamentos` },
            { label: 'Despesas', value: fmt(resumo?.totalDespesas || 0), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', sub: `${resumo?.qtdContas || 0} contas` },
            { label: 'Saldo', value: fmt(resumo?.saldo || 0), icon: Wallet, color: (resumo?.saldo || 0) >= 0 ? 'text-blue-600' : 'text-red-500', bg: 'bg-blue-50 dark:bg-blue-900/20', sub: 'Receitas − Despesas' },
            { label: 'A Pagar', value: fmt(resumo?.totalPendente || 0), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', sub: `Vencido: ${fmt(resumo?.totalVencido || 0)}` },
          ].map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                  <Icon className={clsx('w-5 h-5', color)} />
                </div>
              </div>
              <p className={clsx('text-2xl font-bold tracking-tight', color)}>{value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="card py-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">Mês</label>
              <select className="input w-36" value={mes} onChange={e => setMes(e.target.value)}>
                {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(2024,i,1).toLocaleDateString('pt-BR',{month:'long'})}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ano</label>
              <select className="input w-24" value={ano} onChange={e => setAno(e.target.value)}>
                {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {tab === 'contas' && (
              <div>
                <label className="label">Status</label>
                <select className="input w-36" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGA">Paga</option>
                  <option value="VENCIDA">Vencida</option>
                </select>
              </div>
            )}
            <button onClick={carregar} className="btn-ghost py-2.5">
              <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          {(['contas','receitas'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-5 py-2 rounded-lg text-sm font-semibold transition-all', tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {t === 'contas' ? 'Contas / Despesas' : 'Receitas'}
            </button>
          ))}
        </div>

        {/* Tabela Contas */}
        {tab === 'contas' && (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="table-header">Descrição</th>
                    <th className="table-header hidden md:table-cell">Categoria</th>
                    <th className="table-header hidden lg:table-cell">Tipo</th>
                    <th className="table-header">Vencimento</th>
                    <th className="table-header">Valor</th>
                    <th className="table-header">Status</th>
                    <th className="table-header hidden md:table-cell">Lembrete</th>
                    <th className="table-header text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" /></td></tr>
                  ) : contas.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Nenhuma conta encontrada. Clique em "Nova Conta" para começar.</td></tr>
                  ) : contas.map(c => (
                    <tr key={c.id} className={clsx('transition-colors group', c.status === 'VENCIDA' && 'bg-red-50/30 dark:bg-red-900/5')}>
                      <td className="table-cell">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.descricao}</p>
                        {c.observacao && <p className="text-xs text-gray-400 truncate max-w-[180px]">{c.observacao}</p>}
                      </td>
                      <td className="table-cell hidden md:table-cell text-xs text-gray-500">{c.categoria}</td>
                      <td className="table-cell hidden lg:table-cell text-xs text-gray-500">{c.tipo}</td>
                      <td className="table-cell text-sm font-mono">{new Date(c.vencimento).toLocaleDateString('pt-BR')}</td>
                      <td className="table-cell font-bold text-red-600">{fmt(parseFloat(c.valor))}</td>
                      <td className="table-cell">
                        <span className={clsx('badge', statusConfig[c.status]?.cls)}>{statusConfig[c.status]?.label}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        {c.lembrete ? <span className="flex items-center gap-1 text-xs text-amber-600"><Bell className="w-3 h-3" />{c.lembreteAntecedencia}d antes</span> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {c.status !== 'PAGA' && (
                            <button onClick={() => pagarConta(c.id)} title="Marcar como paga"
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {c.status === 'PAGA' && (
                            <button onClick={() => desmarcarConta(c.id)} title="Desmarcar pagamento"
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => { setEditandoConta(c); setModalConta(true); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletarConta(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabela Receitas */}
        {tab === 'receitas' && (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="table-header">Descrição</th>
                    <th className="table-header hidden md:table-cell">Categoria</th>
                    <th className="table-header hidden lg:table-cell">Origem</th>
                    <th className="table-header">Data</th>
                    <th className="table-header">Valor</th>
                    <th className="table-header text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" /></td></tr>
                  ) : receitas.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Nenhuma receita encontrada. Clique em "Nova Receita" para começar.</td></tr>
                  ) : receitas.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="table-cell">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.descricao}</p>
                        {r.observacao && <p className="text-xs text-gray-400 truncate max-w-[180px]">{r.observacao}</p>}
                      </td>
                      <td className="table-cell hidden md:table-cell text-xs text-gray-500">{r.categoria}</td>
                      <td className="table-cell hidden lg:table-cell text-xs text-gray-500">{r.origem || '—'}</td>
                      <td className="table-cell text-sm font-mono">{new Date(r.data).toLocaleDateString('pt-BR')}</td>
                      <td className="table-cell font-bold text-emerald-600">{fmt(parseFloat(r.valor))}</td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditandoReceita(r); setModalReceita(true); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletarReceita(r.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ContaModal open={modalConta} onClose={() => { setModalConta(false); setEditandoConta(null); }} onSave={() => { setModalConta(false); setEditandoConta(null); carregar(); }} editando={editandoConta} />
      <ReceitaModal open={modalReceita} onClose={() => { setModalReceita(false); setEditandoReceita(null); }} onSave={() => { setModalReceita(false); setEditandoReceita(null); carregar(); }} editando={editandoReceita} />
    </Layout>
  );
}
