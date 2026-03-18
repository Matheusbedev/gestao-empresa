'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Users, BarChart3, Clock, Shield, Sparkles } from 'lucide-react';

const features = [
  { icon: Users,    label: 'Gestão de Funcionários', desc: 'Cadastro completo com benefícios e documentos' },
  { icon: Clock,    label: 'Controle de Ponto',      desc: 'Registro automático com cálculo de horas extras' },
  { icon: BarChart3,label: 'Dashboard Analítico',    desc: 'Métricas e gráficos em tempo real' },
  { icon: Shield,   label: 'Folha de Pagamento',     desc: 'Cálculo automático com INSS e descontos' },
];

export default function LoginPage() {
  const [email, setEmail]       = useState('admin@empresa.com');
  const [senha, setSenha]       = useState('admin123');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Acesso autorizado. Bem-vindo!');
      router.push('/dashboard');
    } catch {
      toast.error('Email ou senha incorretos. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0b0d14]">

      {/* ── Left — branding ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(145deg, #0e0b1e 0%, #130f28 50%, #0c0a18 100%)' }}>

        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 70%)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 20px rgb(124 58 237 / 0.5)' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none">RH System</span>
              <span className="block text-violet-400 text-xs">Enterprise</span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/30"
                style={{ background: 'rgb(124 58 237 / 0.15)' }}>
                <Sparkles className="w-3 h-3" /> Plataforma completa de RH
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Gerencie sua equipe<br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                com inteligência
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Controle total de funcionários, ponto, faltas e folha de pagamento em uma plataforma moderna e intuitiva.
            </p>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label}
                  className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] hover:border-violet-500/30 transition-colors"
                  style={{ background: 'rgb(255 255 255 / 0.04)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgb(124 58 237 / 0.2)' }}>
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer credits */}
          <div className="border-t border-white/[0.08] pt-6">
            <p className="text-slate-500 text-xs mb-2">Desenvolvido por</p>
            <p className="text-white font-semibold text-sm">Matheus Augusto</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="text-slate-400 text-xs">📱 (43) 999555-144</span>
              <span className="text-slate-400 text-xs">✉️ dev.matheusaugustoo@gmail.com</span>
              <span className="text-slate-400 text-xs">📸 @dev.matheuss</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#f5f4fb] dark:bg-[#0b0d14]">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">RH System</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Bem-vindo de volta</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Entre com suas credenciais para continuar</p>
          </div>

          <div className="bg-white dark:bg-[#10121c] rounded-2xl border border-gray-100 dark:border-white/[0.07] p-8"
            style={{ boxShadow: '0 4px 24px rgb(0 0 0 / 0.08)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email corporativo</label>
                <input type="email" className="input" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@empresa.com" required autoComplete="email" />
              </div>
              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input type={showSenha ? 'text' : 'password'} className="input pr-11"
                    value={senha} onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password" />
                  <button type="button" onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5">
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm mt-1">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                  : 'Entrar no sistema'}
              </button>
            </form>
          </div>

          <div className="mt-4 p-4 rounded-xl border border-violet-200 dark:border-violet-900/40"
            style={{ background: 'rgb(124 58 237 / 0.06)' }}>
            <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">🔑 Acesso de demonstração</p>
            <p className="text-xs text-violet-600 dark:text-violet-300 font-mono">admin@empresa.com · admin123</p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Desenvolvido por{' '}
            <a href="https://instagram.com/dev.matheuss" target="_blank" rel="noopener noreferrer"
              className="text-violet-500 hover:text-violet-600 font-semibold transition-colors">
              Matheus Augusto
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
