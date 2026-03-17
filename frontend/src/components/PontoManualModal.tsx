'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader2, Clock, AlertCircle, Zap, Calculator } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionarios: any[];
  funcionarioPreSelecionado?: any;
  onSave: () => void;
}

const hoje = new Date().toISOString().split('T')[0];

// Converte "HH:MM" + "yyyy-MM-dd" em ISO string sem problema de timezone
function toISO(data: string, hora: string): string {
  return `${data}T${hora}:00`;
}

// Calcula horas trabalhadas para preview
function calcPreview(entrada: string, saida: string, saidaAlmoco: string, retornoAlmoco: string): string {
  if (!entrada || !saida) return '';
  const toMin = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };
  let total = toMin(saida) - toMin(entrada);
  if (saidaAlmoco && retornoAlmoco) total -= (toMin(retornoAlmoco) - toMin(saidaAlmoco));
  if (total <= 0) return '';
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
}

export default function PontoManualModal({ open, onClose, funcionarios, funcionarioPreSelecionado, onSave }: Props) {
  const [form, setForm] = useState({
    funcionarioId: '', data: hoje,
    entrada: '', saidaAlmoco: '', retornoAlmoco: '', saida: '', observacao: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        funcionarioId: funcionarioPreSelecionado?.id || '',
        data: hoje,
        entrada: '', saidaAlmoco: '', retornoAlmoco: '', saida: '', observacao: '',
      });
    }
  }, [open, funcionarioPreSelecionado]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const preencherPadrao = () => setForm(f => ({
    ...f, entrada: '08:00', saidaAlmoco: '12:00', retornoAlmoco: '13:00', saida: '17:00',
  }));

  const preencherSemAlmoco = () => setForm(f => ({
    ...f, entrada: '08:00', saidaAlmoco: '', retornoAlmoco: '', saida: '14:00',
  }));

  const saidaAntes = form.entrada && form.saida && form.saida <= form.entrada;
  const preview = calcPreview(form.entrada, form.saida, form.saidaAlmoco, form.retornoAlmoco);

  const salvar = async () => {
    if (!form.funcionarioId) { toast.error('Selecione um funcionário.'); return; }
    if (!form.data) { toast.error('Informe a data.'); return; }
    if (!form.entrada) { toast.error('Informe o horário de entrada.'); return; }
    if (saidaAntes) { toast.error('Saída deve ser após a entrada.'); return; }

    setSaving(true);
    try {
      const payload: any = {
        funcionarioId: form.funcionarioId,
        data: form.data,
        observacao: form.observacao || undefined,
      };
      if (form.entrada)       payload.entrada       = toISO(form.data, form.entrada);
      if (form.saidaAlmoco)   payload.saidaAlmoco   = toISO(form.data, form.saidaAlmoco);
      if (form.retornoAlmoco) payload.retornoAlmoco = toISO(form.data, form.retornoAlmoco);
      if (form.saida)         payload.saida         = toISO(form.data, form.saida);

      await api.post('/api/pontos/manual', payload);
      toast.success('Ponto registrado com sucesso.');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível registrar o ponto.');
    } finally { setSaving(false); }
  };

  if (!open) return null;

  const inputTime = (key: string, label: string) => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input text-center font-mono text-base tracking-widest"
        type="time"
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Lançamento Manual de Ponto</h2>
              <p className="text-xs text-gray-400">Registre ou corrija o ponto de qualquer dia</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Funcionário */}
          <div>
            <label className="label">Funcionário *</label>
            <select className="input" value={form.funcionarioId} onChange={e => set('funcionarioId', e.target.value)}>
              <option value="">Selecione o funcionário...</option>
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>
              ))}
            </select>
          </div>

          {/* Data + atalhos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data *</label>
              <input className="input" type="date" value={form.data}
                max={hoje} onChange={e => set('data', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <button type="button" onClick={preencherPadrao}
                className="btn-secondary text-xs py-2 justify-center">
                <Zap className="w-3.5 h-3.5" /> 08:00 – 17:00 (c/ almoço)
              </button>
              <button type="button" onClick={preencherSemAlmoco}
                className="btn-secondary text-xs py-2 justify-center">
                <Zap className="w-3.5 h-3.5" /> 08:00 – 14:00 (sem almoço)
              </button>
            </div>
          </div>

          {/* Horários em grade 2x2 */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Horários</p>
            <div className="grid grid-cols-2 gap-3">
              {inputTime('entrada', '▶ Entrada')}
              {inputTime('saida', '⏹ Saída')}
              {inputTime('saidaAlmoco', '⏸ Saída Almoço')}
              {inputTime('retornoAlmoco', '▶ Retorno Almoço')}
            </div>
          </div>

          {/* Preview de horas calculadas */}
          {preview && !saidaAntes && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
              <Calculator className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Total trabalhado: <strong>{preview}</strong>
              </p>
            </div>
          )}

          {/* Aviso saída < entrada */}
          {saidaAntes && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">O horário de saída deve ser após a entrada.</p>
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="label">Observação <span className="font-normal text-gray-400 normal-case tracking-normal">(opcional)</span></label>
            <input className="input" value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              placeholder="Ex: Esqueceu de bater, home office, feriado..." />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={salvar} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Clock className="w-4 h-4" /> Registrar ponto</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
