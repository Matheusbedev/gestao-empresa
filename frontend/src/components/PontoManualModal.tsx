'use client';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionarios: any[];
  onSave: () => void;
}

export default function PontoManualModal({ open, onClose, funcionarios, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        funcionarioId: data.funcionarioId,
        data: data.data,
        observacao: data.observacao,
      };
      if (data.entrada) payload.entrada = `${data.data}T${data.entrada}:00`;
      if (data.saidaAlmoco) payload.saidaAlmoco = `${data.data}T${data.saidaAlmoco}:00`;
      if (data.retornoAlmoco) payload.retornoAlmoco = `${data.data}T${data.retornoAlmoco}:00`;
      if (data.saida) payload.saida = `${data.data}T${data.saida}:00`;

      await api.post('/api/pontos/manual', payload);
      toast.success('Ponto registrado manualmente');
      reset();
      onSave();
    } catch {
      toast.error('Erro ao registrar ponto');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Registro Manual de Ponto</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Funcionário</label>
            <select className="input" {...register('funcionarioId', { required: true })}>
              <option value="">Selecione...</option>
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data</label>
            <input className="input" type="date" {...register('data', { required: true })} />
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

          <div>
            <label className="label">Observação</label>
            <input className="input" {...register('observacao')} placeholder="Opcional..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
