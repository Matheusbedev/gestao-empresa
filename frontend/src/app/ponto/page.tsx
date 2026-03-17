'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Clock, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import PontoManualModal from '@/components/PontoManualModal';

export default function PontoPage() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [pontosHoje, setPontosHoje] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [batendo, setBatendo] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const carregar = async () => {
    const [funcRes, pontosRes] = await Promise.all([
      api.get('/api/funcionarios', { params: { limit: 100, status: 'ATIVO' } }),
      api.get('/api/pontos/hoje'),
    ]);
    setFuncionarios(funcRes.data.data);
    setPontosHoje(pontosRes.data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const getPontoFuncionario = (funcId: string) =>
    pontosHoje.find(p => p.funcionarioId === funcId);

  const getProximoTipo = (ponto: any) => {
    if (!ponto || !ponto.entrada) return 'entrada';
    if (!ponto.saidaAlmoco) return 'saida_almoco';
    if (!ponto.retornoAlmoco) return 'retorno_almoco';
    if (!ponto.saida) return 'saida';
    return null;
  };

  const tipoLabel: Record<string, string> = {
    entrada: 'Registrar Entrada',
    saida_almoco: 'Saída Almoço',
    retorno_almoco: 'Retorno Almoço',
    saida: 'Registrar Saída',
  };

  const baterPonto = async (funcionarioId: string, tipo: string) => {
    setBatendo(funcionarioId);
    try {
      await api.post('/api/pontos/bater', { funcionarioId, tipo });
      toast.success('Ponto registrado!');
      carregar();
    } catch {
      toast.error('Erro ao bater ponto');
    } finally {
      setBatendo(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Ponto</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: require('date-fns/locale/pt-BR').ptBR })}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Registro Manual
          </button>
        </div>

        {/* Cards de ponto */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionarios.map(f => {
              const ponto = getPontoFuncionario(f.id);
              const proximoTipo = getProximoTipo(ponto);
              const completo = ponto?.saida;

              return (
                <div key={f.id} className={clsx(
                  'card transition-all duration-200',
                  completo ? 'border-green-200 dark:border-green-900/30' : ''
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                        {f.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{f.nome}</p>
                        <p className="text-xs text-gray-400">{f.cargo}</p>
                      </div>
                    </div>
                    {completo && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>

                  {/* Horários */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {[
                      { label: 'Entrada', value: ponto?.entrada },
                      { label: 'Saída Almoço', value: ponto?.saidaAlmoco },
                      { label: 'Retorno', value: ponto?.retornoAlmoco },
                      { label: 'Saída', value: ponto?.saida },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                        <p className="text-gray-400">{label}</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {value ? format(new Date(value), 'HH:mm') : '—'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {ponto?.horasTrabalhadas && (
                    <div className="flex gap-2 mb-3">
                      <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {ponto.horasTrabalhadas}h trabalhadas
                      </span>
                      {ponto.horasExtras > 0 && (
                        <span className="badge bg-orange-100 text-orange-700">+{ponto.horasExtras}h extras</span>
                      )}
                    </div>
                  )}

                  {proximoTipo && (
                    <button
                      onClick={() => baterPonto(f.id, proximoTipo)}
                      disabled={batendo === f.id}
                      className="btn-primary w-full justify-center text-sm py-2"
                    >
                      {batendo === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <><Clock className="w-4 h-4" /> {tipoLabel[proximoTipo]}</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PontoManualModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        funcionarios={funcionarios}
        onSave={() => { setModalOpen(false); carregar(); }}
      />
    </Layout>
  );
}
