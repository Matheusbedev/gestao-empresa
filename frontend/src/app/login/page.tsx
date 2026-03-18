'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Loader2,
  Users,
  BarChart3,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  { icon: Users, label: 'Gestão de Pessoas', desc: 'Cadastros, status e histórico do time em um painel único.' },
  { icon: Clock, label: 'Ponto Inteligente', desc: 'Registros e horas extras com visão diária e mensal.' },
  { icon: BarChart3, label: 'Métricas Reais', desc: 'Indicadores práticos para decisões com menos achismo.' },
  { icon: Shield, label: 'Folha Confiável', desc: 'Cálculos padronizados com foco em consistência operacional.' },
];

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

  const canSubmit = useMemo(() => {
    return email.trim().length > 4 && senha.trim().length >= 6 && !loading;
  }, [email, senha, loading]);

  const fillDemo = () => {
    setEmail('admin@empresa.com');
    setSenha('admin123');
  };

  const getErrorMessage = (err: unknown) => {
    const fallback = 'Nao foi possivel entrar. Verifique os dados e tente novamente.';
    if (!err || typeof err !== 'object') return fallback;
    const maybeResponse = (err as { response?: { data?: { error?: string } } }).response;
    return maybeResponse?.data?.error || fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Acesso autorizado. Bem-vindo de volta.');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 login-screen">
        <div className="card max-w-sm w-full text-center animate-scale-in">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Validando sessao</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Aguarde um instante para continuar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_0.85fr] login-screen">
      <section className="relative hidden lg:flex overflow-hidden border-r border-white/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.2),transparent_38%),radial-gradient(circle_at_75%_20%,rgba(45,212,191,0.18),transparent_42%),linear-gradient(155deg,#082f49_0%,#0f172a_58%,#111827_100%)]" />
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        <div className="relative z-10 flex h-full w-full flex-col p-10 xl:p-14 text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-900 shadow-xl shadow-cyan-900/40 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">RH System</p>
              <p className="text-xs text-slate-300">Plataforma de gestao operacional</p>
            </div>
          </div>

          <div className="mt-16 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" /> Acesso centralizado para equipes de RH
            </span>

            <h1 className="mt-5 text-4xl xl:text-5xl font-black leading-tight">
              Operacao de pessoas
              <span className="block bg-gradient-to-r from-cyan-200 to-emerald-200 bg-clip-text text-transparent">mais profissional e previsivel.</span>
            </h1>

            <p className="mt-5 text-slate-300 leading-relaxed">
              Gerencie funcionarios, ponto, faltas e folha com dados claros, visual refinado e fluxo de trabalho objetivo.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-2xl">
            {features.map(({ icon: Icon, label, desc }) => (
              <article key={label} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                <div className="mb-2 h-8 w-8 rounded-lg bg-cyan-300/20 text-cyan-100 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold">{label}</h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-white/15 bg-white/5 p-4 max-w-xl">
            <p className="text-xs font-bold text-cyan-100">Pontos fortes desta versao</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-200">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Login mais consistente com sessao validada.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Interface renovada para uso diario profissional.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Dashboard orientado a acoes e monitoramento.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-7 lg:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 text-white flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-[var(--text-primary)] leading-none">RH System</p>
              <p className="text-xs text-[var(--text-muted)]">Gestao de RH</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Entrar na plataforma</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Use seu email corporativo e senha para acessar o painel.</p>
          </div>

          <div className="card p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Senha</label>
                  <button type="button" onClick={fillDemo} className="text-xs text-[var(--primary-strong)] hover:text-[var(--primary)] font-semibold">
                    Preencher demo
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    className="input pr-11"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={!canSubmit} className="btn-primary w-full justify-center py-3">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                  </>
                ) : (
                  <>
                    Acessar dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 rounded-xl border border-sky-200/70 bg-sky-50/80 p-4 text-xs text-sky-900">
            <p className="font-bold">Credencial de demonstracao</p>
            <p className="mt-1 font-mono">admin@empresa.com / admin123</p>
          </div>
        </div>
      </section>
    </div>
  );
}
