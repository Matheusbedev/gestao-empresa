'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader2, User, AlertCircle } from 'lucide-react';
import { maskCPF, maskPhone, maskCurrency, parseCurrency, validateEmail, validateCPF } from '@/lib/masks';
import clsx from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionario?: any;
  onSave: () => void;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

export default function FuncionarioModal({ open, onClose, funcionario, onSave }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting, errors } } = useForm();
  const [cpfVal, setCpfVal] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [salario, setSalario] = useState('');
  const [vt, setVt] = useState('');
  const [va, setVa] = useState('');
  const [bonus, setBonus] = useState('');

  const statusAtual = watch('status');
  const fmt = (v: any) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v)) : '';
  const fmtDate = (v: any) => v ? new Date(v).toISOString().split('T')[0] : '';

  useEffect(() => {
    if (!open) return;
    if (funcionario) {
      reset(funcionario);
      setCpfVal(funcionario.cpf || '');
      setPhoneVal(funcionario.telefone || '');
      setSalario(fmt(funcionario.salarioBase));
      setVt(fmt(funcionario.valeTransporte));
      setVa(fmt(funcionario.valeAlimentacao));
      setBonus(fmt(funcionario.bonus));
      setValue('inicioFerias', fmtDate(funcionario.inicioFerias));
      setValue('fimFerias', fmtDate(funcionario.fimFerias));
    } else {
      reset({ status: 'ATIVO' });
      setCpfVal(''); setPhoneVal(''); setSalario(''); setVt(''); setVa(''); setBonus('');
    }
  }, [funcionario, open]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      cpf: cpfVal,
      telefone: phoneVal,
      salarioBase: parseCurrency(salario),
      valeTransporte: parseCurrency(vt),
      valeAlimentacao: parseCurrency(va),
      bonus: parseCurrency(bonus),
      inicioFerias: data.status === 'FERIAS' && data.inicioFerias ? data.inicioFerias : null,
      fimFerias: data.status === 'FERIAS' && data.fimFerias ? data.fimFerias : null,
    };
    try {
      if (funcionario) {
        await api.put(`/api/funcionarios/${funcionario.id}`, payload);
        toast.success('Funcionário atualizado com sucesso.');
      } else {
        await api.post('/api/funcionarios', payload);
        toast.success('Funcionário cadastrado com sucesso.');
      }
      onSave();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Não foi possível salvar. Tente novamente.';
      toast.error(msg);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-modal w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <p className="text-xs text-gray-400">Preencha todos os campos obrigatórios</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dados Pessoais</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome completo *" error={errors.nome?.message as string}>
                <input className={clsx('input', errors.nome && 'border-red-400 focus:ring-red-400')}
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  placeholder="Ex: João da Silva" />
              </Field>

              <Field label="CPF *" error={errors.cpf?.message as string}>
                <input className={clsx('input', errors.cpf && 'border-red-400')}
                  value={cpfVal}
                  {...register('cpf', { validate: () => validateCPF(cpfVal) })}
                  onChange={e => { const v = maskCPF(e.target.value); setCpfVal(v); setValue('cpf', v); }}
                  placeholder="000.000.000-00" />
              </Field>

              <Field label="Email" error={errors.email?.message as string}>
                <input className={clsx('input', errors.email && 'border-red-400')}
                  type="email"
                  {...register('email', { validate: v => !v || validateEmail(v) })}
                  placeholder="joao@empresa.com.br" />
              </Field>

              <Field label="Telefone / WhatsApp">
                <input className="input" value={phoneVal}
                  onChange={e => setPhoneVal(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000" />
              </Field>
            </div>
          </div>

          <div className="divider" />

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Dados Profissionais</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Cargo *" error={errors.cargo?.message as string}>
                <input className={clsx('input', errors.cargo && 'border-red-400')}
                  {...register('cargo', { required: 'Cargo é obrigatório' })}
                  placeholder="Ex: Analista de RH" />
              </Field>

              <Field label="Departamento">
                <input className="input" {...register('departamento')} placeholder="Ex: Recursos Humanos" />
              </Field>

              <Field label="Data de admissão *" error={errors.dataAdmissao?.message as string}>
                <input className={clsx('input', errors.dataAdmissao && 'border-red-400')}
                  type="date"
                  {...register('dataAdmissao', { required: 'Data de admissão é obrigatória' })} />
              </Field>

              <Field label="Status">
                <select className="input" {...register('status')}>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="FERIAS">Férias</option>
                  <option value="AFASTADO">Afastado</option>
                </select>
              </Field>
            </div>

            {/* Bloco de férias — aparece só quando status = FERIAS */}
            {statusAtual === 'FERIAS' && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400">🏖️ Período de Férias</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Início das férias *" error={errors.inicioFerias?.message as string}>
                    <input
                      className={clsx('input', errors.inicioFerias && 'border-red-400')}
                      type="date"
                      {...register('inicioFerias', { required: statusAtual === 'FERIAS' ? 'Informe o início' : false })}
                    />
                  </Field>
                  <Field label="Retorno previsto *" error={errors.fimFerias?.message as string}>
                    <input
                      className={clsx('input', errors.fimFerias && 'border-red-400')}
                      type="date"
                      {...register('fimFerias', { required: statusAtual === 'FERIAS' ? 'Informe o retorno' : false })}
                    />
                  </Field>
                </div>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                  Essas datas ficam registradas no perfil do funcionário e aparecem na listagem.
                </p>
              </div>
            )}
          </div>

          <div className="divider" />

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Remuneração e Benefícios</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Salário base *" error={errors.salarioBase?.message as string}>
                <input className="input" value={salario}
                  {...register('salarioBase', { validate: () => parseCurrency(salario) > 0 || 'Informe o salário' })}
                  onChange={e => { const v = maskCurrency(e.target.value); setSalario(v); setValue('salarioBase', v); }}
                  placeholder="R$ 0,00" />
              </Field>

              <Field label="Vale Transporte">
                <input className="input" value={vt}
                  onChange={e => setVt(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00" />
              </Field>

              <Field label="Vale Alimentação">
                <input className="input" value={va}
                  onChange={e => setVa(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00" />
              </Field>

              <Field label="Bônus mensal">
                <input className="input" value={bonus}
                  onChange={e => setBonus(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00" />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar funcionário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
