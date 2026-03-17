'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionario?: any;
  onSave: () => void;
}

export default function FuncionarioModal({ open, onClose, funcionario, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (funcionario) {
      reset({
        ...funcionario,
        dataAdmissao: funcionario.dataAdmissao?.split('T')[0],
        salarioBase: parseFloat(funcionario.salarioBase),
        valeTransporte: parseFloat(funcionario.valeTransporte),
        valeAlimentacao: parseFloat(funcionario.valeAlimentacao),
        bonus: parseFloat(funcionario.bonus),
      });
    } else {
      reset({ status: 'ATIVO', valeTransporte: 0, valeAlimentacao: 0, bonus: 0 });
    }
  }, [funcionario, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (funcionario) {
        await api.put(`/api/funcionarios/${funcionario.id}`, data);
        toast.success('Funcionário atualizado');
      } else {
        await api.post('/api/funcionarios', data);
        toast.success('Funcionário criado');
      }
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nome completo</label>
              <input className="input" {...register('nome', { required: true })} placeholder="Nome do funcionário" />
            </div>
            <div>
              <label className="label">CPF</label>
              <input className="input" {...register('cpf', { required: true })} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" {...register('email')} placeholder="email@empresa.com" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" {...register('telefone')} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="label">Cargo</label>
              <input className="input" {...register('cargo', { required: true })} placeholder="Ex: Desenvolvedor" />
            </div>
            <div>
              <label className="label">Departamento</label>
              <input className="input" {...register('departamento')} placeholder="Ex: Tecnologia" />
            </div>
            <div>
              <label className="label">Data de Admissão</label>
              <input className="input" type="date" {...register('dataAdmissao', { required: true })} />
            </div>
            <div>
              <label className="label">Salário Base (R$)</label>
              <input className="input" type="number" step="0.01" {...register('salarioBase', { required: true })} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Vale Transporte (R$)</label>
              <input className="input" type="number" step="0.01" {...register('valeTransporte')} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Vale Alimentação (R$)</label>
              <input className="input" type="number" step="0.01" {...register('valeAlimentacao')} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Bônus (R$)</label>
              <input className="input" type="number" step="0.01" {...register('bonus')} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="FERIAS">Férias</option>
                <option value="AFASTADO">Afastado</option>
              </select>
            </div>
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
