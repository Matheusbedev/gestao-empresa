'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Briefcase, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="card p-8 max-w-sm w-full mx-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Carregando</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">Validando sua sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">RH System</h1>
              <p className="text-xs text-[var(--text-muted)]">Gestão de RH Profissional</p>
            </div>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Bem-vindo</h2>
            <p className="text-sm text-[var(--text-muted)]">Faça login para acessar o painel</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label className="label">Senha</label>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-strong)] font-semibold"
                >
                  Demo
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !email || !senha}
              className="btn-primary w-full justify-center py-3 mt-6"
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

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Credencial de Demonstração</p>
            <p className="text-xs text-blue-800 font-mono">admin@empresa.com / admin123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          RH System © 2026 · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
