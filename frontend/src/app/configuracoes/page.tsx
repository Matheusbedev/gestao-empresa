'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield, Plus, Loader2, Eye, EyeOff, Key, User,
  Mail, Phone, Instagram, Code2, Trash2, Edit2, RefreshCw, AlertCircle, Clock, Calendar, Globe, MapPin, Flag
} from 'lucide-react';
import clsx from 'clsx';
import { validateEmail } from '@/lib/masks';

interface Usuario {
  id: string; nome: string; email: string; role: string; ativo: boolean; criadoEm: string;
}

function ConfirmModal({ open, onConfirm, onCancel, nome }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-modal w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">Remover usuário</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Tem certeza que deseja remover <strong>{nome}</strong>? O acesso será revogado imediatamente.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={onConfirm} className="btn-danger flex-1 justify-center">Remover</button>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSenha, setShowSenha] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [confirmRemover, setConfirmRemover] = useState<Usuario | null>(null);
  const [cargaHoraria, setCargaHoraria] = useState('8');
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm();

  useEffect(() => {
    const saved = localStorage.getItem('cargaHoraria');
    if (saved) setCargaHoraria(saved);
  }, []);

  const salvarCarga = (v: string) => {
    setCargaHoraria(v);
    localStorage.setItem('cargaHoraria', v);
    toast.success('Carga horária atualizada.');
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/usuarios');
      setUsuarios(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const onSubmit = async (data: any) => {
    try {
      if (editando) {
        await api.put(`/api/auth/usuarios/${editando.id}`, data);
        toast.success('Usuário atualizado com sucesso.');
        setEditando(null);
      } else {
        await api.post('/api/auth/register', data);
        toast.success('Acesso criado com sucesso.');
      }
      reset();
      carregar();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível salvar. Tente novamente.');
    }
  };

  const remover = async () => {
    if (!confirmRemover) return;
    try {
      await api.delete(`/api/auth/usuarios/${confirmRemover.id}`);
      toast.success('Usuário removido com sucesso.');
      setConfirmRemover(null);
      carregar();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Não foi possível remover.');
    }
  };

  const iniciarEdicao = (u: Usuario) => {
    setEditando(u);
    setValue('nome', u.nome);
    setValue('email', u.email);
    setValue('role', u.role);
    setValue('senha', '');
  };

  const cancelarEdicao = () => { setEditando(null); reset(); };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie os acessos ao sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {editando ? 'Editar Usuário' : 'Novo Acesso'}
                </h3>
                <p className="text-xs text-gray-400">{editando ? `Editando: ${editando.nome}` : 'Adicione um administrador'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Nome completo *</label>
                <input className={clsx('input', errors.nome && 'border-red-400')}
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  placeholder="Nome do usuário" />
                {errors.nome && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nome.message as string}</p>}
              </div>

              <div>
                <label className="label">E-mail *</label>
                <input className={clsx('input', errors.email && 'border-red-400')}
                  type="email"
                  {...register('email', { required: 'E-mail é obrigatório', validate: validateEmail })}
                  placeholder="usuario@empresa.com.br" />
                {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message as string}</p>}
              </div>

              <div>
                <label className="label">{editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
                <div className="relative">
                  <input className={clsx('input pr-11', errors.senha && 'border-red-400')}
                    type={showSenha ? 'text' : 'password'}
                    {...register('senha', { required: !editando && 'Senha é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                    placeholder={editando ? 'Deixe em branco para não alterar' : 'Mínimo 6 caracteres'} />
                  <button type="button" onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.senha.message as string}</p>}
              </div>

              <div>
                <label className="label">Nível de acesso</label>
                <select className="input" {...register('role')}>
                  <option value="ADMIN">Administrador</option>
                  <option value="GESTOR">Gestor</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                {editando && (
                  <button type="button" onClick={cancelarEdicao} className="btn-secondary flex-1 justify-center">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editando ? <><Edit2 className="w-4 h-4" /> Salvar alterações</> : <><Plus className="w-4 h-4" /> Criar acesso</>}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de usuários */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Usuários do Sistema</h3>
                <p className="text-xs text-gray-400">{usuarios.filter(u => u.ativo).length} ativo(s)</p>
              </div>
              <button onClick={carregar} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
              </button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : usuarios.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum usuário encontrado</p>
              ) : usuarios.map(u => (
                <div key={u.id} className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                  u.ativo
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-60'
                )}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.nome}</p>
                      {u.id === currentUser?.id && (
                        <span className="badge bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs">você</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    <span className={clsx('badge text-xs mt-0.5', u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400')}>
                      {u.role}
                    </span>
                  </div>
                  {u.id !== currentUser?.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => iniciarEdicao(u)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmRemover(u)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carga Horária da Empresa */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Carga Horária da Empresa</h3>
              <p className="text-xs text-gray-400">Define o padrão de horas diárias para todos os funcionários</p>
            </div>
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="label">Horas por dia</label>
              <select
                className="input w-40"
                value={cargaHoraria}
                onChange={e => salvarCarga(e.target.value)}
              >
                {[4, 5, 6, 7, 8, 9, 10].map(h => (
                  <option key={h} value={h}>{h} horas por dia</option>
                ))}
              </select>
            </div>
            <div className="pb-0.5">
              <p className="text-xs text-gray-400 leading-relaxed">
                H.E. 50% é calculada nas primeiras 2h extras por dia.<br />
                H.E. 100% é calculada acima de 2h extras por dia.
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Esta configuração é salva no seu navegador e aplicada automaticamente na página de Ponto.
            </p>
          </div>
        </div>

        {/* Credenciais padrão */}
        <div className="card bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">Credenciais padrão</p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-0.5 font-mono">admin@empresa.com · admin123</p>
              <p className="text-xs text-amber-500 mt-1.5">Recomendamos criar um novo acesso e não utilizar as credenciais padrão em produção.</p>
            </div>
          </div>
        </div>

        {/* Calendário de Feriados 2026 — Cambé/PR */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Feriados 2026 — Cambé, Paraná</h3>
              <p className="text-xs text-gray-400">Datas usadas automaticamente no cálculo de H.E. 100%</p>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { label: 'Nacional', color: 'bg-blue-500', icon: Globe },
              { label: 'Estadual/Regional', color: 'bg-purple-500', icon: Flag },
              { label: 'Municipal (Cambé)', color: 'bg-emerald-500', icon: MapPin },
            ].map(({ label, color, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className={clsx('w-2 h-2 rounded-full', color)} />
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { data: '01/01', nome: 'Confraternização Universal',    tipo: 'nacional' },
              { data: '16/02', nome: 'Carnaval — Segunda-feira',      tipo: 'nacional' },
              { data: '17/02', nome: 'Carnaval — Terça-feira',        tipo: 'nacional' },
              { data: '18/02', nome: 'Quarta de Cinzas (meio dia)',    tipo: 'nacional' },
              { data: '03/04', nome: 'Sexta-feira Santa',             tipo: 'nacional' },
              { data: '05/04', nome: 'Páscoa',                        tipo: 'nacional' },
              { data: '21/04', nome: 'Tiradentes',                    tipo: 'nacional' },
              { data: '01/05', nome: 'Dia do Trabalho',               tipo: 'nacional' },
              { data: '04/06', nome: 'Corpus Christi',                tipo: 'nacional' },
              { data: '09/07', nome: 'Revolução Constitucionalista',  tipo: 'estadual' },
              { data: '07/09', nome: 'Independência do Brasil',       tipo: 'nacional' },
              { data: '12/10', nome: 'Nossa Sra. Aparecida',          tipo: 'nacional' },
              { data: '28/10', nome: 'Aniversário de Cambé',          tipo: 'municipal' },
              { data: '02/11', nome: 'Finados',                       tipo: 'nacional' },
              { data: '15/11', nome: 'Proclamação da República',      tipo: 'nacional' },
              { data: '20/11', nome: 'Consciência Negra',             tipo: 'nacional' },
              { data: '08/12', nome: 'Nossa Sra. da Conceição',       tipo: 'municipal' },
              { data: '25/12', nome: 'Natal',                         tipo: 'nacional' },
            ].map(({ data, nome, tipo }) => (
              <div key={data} className={clsx(
                'flex items-center gap-3 p-2.5 rounded-xl border text-sm',
                tipo === 'nacional'  && 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20',
                tipo === 'estadual'  && 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20',
                tipo === 'municipal' && 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20',
              )}>
                <span className={clsx(
                  'text-xs font-bold font-mono px-2 py-1 rounded-lg flex-shrink-0',
                  tipo === 'nacional'  && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                  tipo === 'estadual'  && 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                  tipo === 'municipal' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
                )}>{data}</span>
                <span className="text-gray-700 dark:text-gray-300 text-xs leading-tight">{nome}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Nos feriados, <strong>todas as horas trabalhadas</strong> são calculadas com adicional de 100% automaticamente no ponto e na folha de pagamento.
            </p>
          </div>
        </div>

        {/* Sobre o desenvolvedor */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Desenvolvedor</h3>
              <p className="text-xs text-gray-400">Contato e suporte técnico</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: User, label: 'Nome', value: 'Matheus Augusto' },
              { icon: Phone, label: 'WhatsApp', value: '(43) 999555-144' },
              { icon: Mail, label: 'E-mail', value: 'dev.matheusaugustoo@gmail.com' },
              { icon: Instagram, label: 'Instagram', value: '@dev.matheuss', href: 'https://instagram.com/dev.matheuss' },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">{value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmRemover}
        nome={confirmRemover?.nome}
        onConfirm={remover}
        onCancel={() => setConfirmRemover(null)}
      />
    </Layout>
  );
}
