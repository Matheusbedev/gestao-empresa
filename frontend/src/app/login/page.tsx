'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: Users, label: 'Gestão de Pessoas', desc: 'Controle completo de funcionários' },
  { icon: Clock, label: 'Ponto Inteligente', desc: 'Registro automático de horas' },
  { icon: DollarSign, label: 'Folha de Pagamento', desc: 'Cálculos precisos e automáticos' },
  { icon: BarChart3, label: 'Relatórios Avançados', desc: 'Análises detalhadas e exportação' },
];

import { Users, Clock, DollarSign, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, loading: sessionLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && user) router.replace('/dashboard');
  }, [sessionLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Bem-vindo de volta!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@empresa.com');
    setSenha('admin123');
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="card p-8 max-w-sm w-full mx-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Carregando</h2>
          <p className="text-sm text-slate-600 mt-2">Validando sua sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Side - Features */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">RH System</h1>
              <p className="text-sm text-slate-300">Gestão Profissional</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-3">Bem-vindo ao RH System</h2>
              <p className="text-slate-300 text-lg">Plataforma completa para gestão de recursos humanos</p>
            </div>

            <div className="space-y-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Segurança em primeiro lugar</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Interface intuitiva e profissional</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Suporte técnico 24/7</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">RH System</h1>
              <p className="text-xs text-slate-500">Gestão Profissional</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="card p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo</h2>
              <p className="text-slate-600">Faça login para acessar o painel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@empresa.com"
                  className="input"
                  disabled={loading}
                />
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="label">Senha</label>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Usar Demo
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="input pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão */}
              <button
                type="submit"
                disabled={loading || !email || !senha}
                className="btn-primary w-full justify-center py-3 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Acessar Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-semibold text-blue-900 mb-2">Credencial de Demonstração</p>
              <p className="text-xs text-blue-800 font-mono">admin@empresa.com / admin123</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-8">
            RH System © 2026 · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
