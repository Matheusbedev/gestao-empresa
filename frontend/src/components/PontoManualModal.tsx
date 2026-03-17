'use client';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader2, Clock, AlertCircle, Zap } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionarios: any[];
  funcionarioPreSelecionado?: any;
  onSave: () => void;
}

const hoje = new Date().toISOString().split('T')[0];

export default function PontoManualModal({ open, onClose, funcionarios, funcionarioPreSelecionado, onSave }: Props) {
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: { data: hoje, funcionarioId: '', entrada: '', saidaAlmoco: '', retornoAlmoco: '', saida: '', observacao: '' },
  });

  const entrada = watch('entrada');
  const saida = watch('saida');

  useEffect(() => {
    if (open) {
      reset({ data: hoje, funcionarioId: funcionarioPreSelecionado?.id || '', entrada: '', saidaAlmoco: '', retornoAlmoco: '', saida: '', observacao: '' });
    }
  }, [open, funcionarioPreSelecionado]);

  const preencherPadrao = () => {
    setValue('entrada', '08:00');
    setValue('saidaAlmoco', '12:00');
    setValue('retornoAlmoco', '13:00');
    setValue('saida', '17:00');
  };

  const onSubmit = async (data: any) => {
    if (!data.funcionarioId) { toast.error('Selecione um funcionário.'); return; }
    if (!data.data) { toast.error('Informe a data.'); return; }
    if (data.entrada && data.saida && data.saida <= data.entrada) {
      toast.error('O horário de saída deve ser após a entrada.');
      return;
    }
    try {
      const payload: any = { funcionarioId: data.funcionarioId, data: data.data };
      if (data.observacao) payload.observacao = data.observacao;
      if (data.entrada) payload.entrada = `${data.data}T${data.entrada}:00`;
      if (data.saidaAlmoco) payload.saidaAlmoco = `${data.data}T${data.saidaAlmoco}:00`;
      if (data.retornoAlmoco) payload.retornoAlmoco = `${data.data}T${data.retornoAlmoco}:00`;
      if (data.saida) payload.saida = `${data.data}T${data.saida}:00`;

      await api.post('/api/pontos/manual', payload);
      toast.success('Ponto registrado com sucesso.');
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível registrar o ponto.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-modal w-full max-w-lg animate-scale-in">
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Funcionário + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Funcionário *</label>
              <select className={`input ${errors.funcionarioId ? 'border-red-400' : ''}`}
                {...register('funcionarioId', { required: true })}>
                <option value="">Selecione o funcionário...</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>
                ))}
              </select>
              {errors.funcionarioId && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle className="w-3 h-3" /> Selecione um funcionário
                </p>
              )}
            </div>
            <div>
              <label className="label">Data *</label>
              <input className="input" type="date"
                {...register('data', { required: true })}
                max={hoje} />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={preencherPadrao}
                className="btn-secondary w-full justify-center text-xs py-2.5">
                <Zap className="w-3.5 h-3.5" /> Preencher padrão (8h–17h)
              </button>
            </div>
          </div>

          {/* Horários */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Horários</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'entrada', label: '▶ Entrada' },
                { key: 'saidaAlmoco', label: '⏸ Saída Almoço' },
                { key: 'retornoAlmoco', label: '▶ Retorno Almoço' },
                { key: 'saida', label: '⏹ Saída' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input className="input" type="time" {...register(key as any)} />
                </div>
              ))}
            </div>
          </div>

          {/* Aviso saída < entrada */}
          {entrada && saida && saida <= entrada && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">O horário de saída deve ser após a entrada.</p>
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="label">Observação <span className="font-normal text-gray-400 normal-case tracking-normal">(opcional)</span></label>
            <input className="input" {...register('observacao')}
              placeholder="Ex: Esqueceu de bater, home office, etc." />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Clock className="w-4 h-4" /> Registrar ponto</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
