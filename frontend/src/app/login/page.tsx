'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Users, BarChart3, Clock, Shield, CheckCircle } from 'lucide-react';

const features = [
  { icon: Users, label: 'Gestão de Funcionários', desc: 'Cadastro completo com benefícios e documentos' },
  { icon: Clock, label: 'Controle de Ponto', desc: 'Registro automático com cálculo de horas extras' },
  { icon: BarChart3, label: 'Dashboard Analítico', desc: 'Métricas e gráficos em tempo real' },
  { icon: Shield, label: 'Folha de Pagamento', desc: 'Cálculo automático com INSS e descontos' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [senha, setSenha] = useState('admin123');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none">RH System</span>
              <span className="block text-blue-400 text-xs">Enterprise</span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/30">
                <CheckCircle className="w-3 h-3" /> Plataforma completa de RH
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Gerencie sua equipe<br />
              <span className="text-blue-400">com inteligência</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Controle total de funcionários, ponto, faltas e folha de pagamento em uma plataforma moderna e intuitiva.
            </p>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/8 transition-colors">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-blue-400" />
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
          <div className="border-t border-white/10 pt-6">
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

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">RH System</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Bem-vindo de volta</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Entre com suas credenciais para continuar</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email corporativo</label>
                <input type="email" className="input" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="seu@empresa.com" required autoComplete="email" />
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

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">🔑 Acesso de demonstração</p>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-mono">admin@empresa.com · admin123</p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Desenvolvido por{' '}
            <a href="https://instagram.com/dev.matheuss" target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
              Matheus Augusto
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
