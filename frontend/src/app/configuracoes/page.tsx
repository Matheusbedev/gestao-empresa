'use client';
import { useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Shield, Plus, Loader2, Eye, EyeOff, Key, User, Mail, Phone, Instagram, Code2 } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [showSenha, setShowSenha] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const criarUsuario = async (data: any) => {
    try {
      await api.post('/api/auth/register', data);
      toast.success('Usuário criado com sucesso!');
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar usuário');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie acessos e informações do sistema</p>
        </div>

        {/* Criar acesso */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Criar Novo Acesso</h3>
              <p className="text-xs text-gray-400">Adicione um novo usuário administrador ao sistema</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(criarUsuario)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome completo</label>
                <input className="input" {...register('nome', { required: true })} placeholder="Nome do usuário" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" {...register('email', { required: true })} placeholder="email@empresa.com" />
              </div>
              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input className="input pr-11" type={showSenha ? 'text' : 'password'}
                    {...register('senha', { required: true, minLength: 6 })} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-red-500 mt-1">Mínimo 6 caracteres</p>}
              </div>
              <div>
                <label className="label">Nível de acesso</label>
                <select className="input" {...register('role')}>
                  <option value="ADMIN">Administrador</option>
                  <option value="GESTOR">Gestor</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Criar Acesso
              </button>
            </div>
          </form>
        </div>

        {/* Acesso padrão */}
        <div className="card bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">Credenciais padrão do sistema</p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1 font-mono">
                admin@empresa.com · admin123
              </p>
              <p className="text-xs text-amber-500 mt-2">⚠️ Recomendamos criar um novo acesso e não usar as credenciais padrão em produção.</p>
            </div>
          </div>
        </div>

        {/* Sobre o desenvolvedor */}
        <div className="card border-2 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Sobre o Desenvolvedor</h3>
              <p className="text-xs text-gray-400">Informações de contato e suporte</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: User, label: 'Desenvolvedor', value: 'Matheus Augusto' },
              { icon: Phone, label: 'Telefone / WhatsApp', value: '(43) 99555-144' },
              { icon: Mail, label: 'Email', value: 'dev.matheusaugustoo@gmail.com' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Instagram className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Instagram</p>
              <a href="https://instagram.com/dev.matheuss" target="_blank" rel="noopener noreferrer"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                @dev.matheuss
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
