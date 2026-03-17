'use client';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader2, Clock, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionarios: any[];
  funcionarioPreSelecionado?: any;
  onSave: () => void;
}

export default function PontoManualModal({ open, onClose, funcionarios, funcionarioPreSelecionado, onSave }: Props) {
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm();
  const entrada = watch('entrada');
  const saida = watch('saida');

  useEffect(() => {
    if (open && funcionarioPreSelecionado) {
      setValue('funcionarioId', funcionarioPreSelecionado.id);
    }
  }, [open, funcionarioPreSelecionado]);

  const onSubmit = async (data: any) => {
    if (data.entrada && data.saida && data.saida <= data.entrada) {
      toast.error('O horário de saída deve ser após a entrada.');
      return;
    }
    try {
      const payload: any = { funcionarioId: data.funcionarioId, data: data.data, observacao: data.observacao };
      if (data.entrada) payload.entrada = `${data.data}T${data.entrada}:00`;
      if (data.saidaAlmoco) payload.saidaAlmoco = `${data.data}T${data.saidaAlmoco}:00`;
      if (data.retornoAlmoco) payload.retornoAlmoco = `${data.data}T${data.retornoAlmoco}:00`;
      if (data.saida) payload.saida = `${data.data}T${data.saida}:00`;

      await api.post('/api/pontos/manual', payload);
      toast.success('Ponto registrado com sucesso.');
      reset();
      onSave();
    } catch {
      toast.error('Não foi possível registrar o ponto. Tente novamente.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-modal w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Registro Manual de Ponto</h2>
              <p className="text-xs text-gray-400">Lançamento retroativo pelo administrador</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Funcionário *</label>
            <select className="input" {...register('funcionarioId', { required: true })}>
              <option value="">Selecione o funcionário...</option>
              {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>)}
            </select>
            {errors.funcionarioId && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                <AlertCircle className="w-3 h-3" /> Selecione um funcionário
              </p>
            )}
          </div>

          <div>
            <label className="label">Data *</label>
            <input className="input" type="date" {...register('data', { required: true })}
              max={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Entrada</label>
              <input className="input" type="time" {...register('entrada')} />
            </div>
            <div>
              <label className="label">Saída Almoço</label>
              <input className="input" type="time" {...register('saidaAlmoco')} />
            </div>
            <div>
              <label className="label">Retorno Almoço</label>
              <input className="input" type="time" {...register('retornoAlmoco')} />
            </div>
            <div>
              <label className="label">Saída</label>
              <input className="input" type="time" {...register('saida')} />
            </div>
          </div>

          {entrada && saida && saida <= entrada && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">O horário de saída deve ser após a entrada.</p>
            </div>
          )}

          <div>
            <label className="label">Observação</label>
            <input className="input" {...register('observacao')} placeholder="Ex: Esqueceu de bater na entrada" />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Registrar ponto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
