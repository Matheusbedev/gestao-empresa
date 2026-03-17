'use client';
import { X, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface Props { folha: any; onClose: () => void; }

export default function FolhaDetalheModal({ folha, onClose }: Props) {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const proventos = [
    { label: 'Salário Base', valor: parseFloat(folha.salarioBase) },
    { label: `Horas Extras 50% (${parseFloat(folha.totalHorasExtras).toFixed(1)}h)`, valor: parseFloat(folha.horasExtras50) },
    { label: 'Horas Extras 100%', valor: parseFloat(folha.horasExtras100) },
    { label: 'Bônus', valor: parseFloat(folha.bonus) },
    { label: 'Vale Transporte', valor: parseFloat(folha.valeTransporte) },
    { label: 'Vale Alimentação', valor: parseFloat(folha.valeAlimentacao) },
  ].filter(l => l.valor > 0);

  const descontos = [
    { label: `Faltas (${folha.totalFaltas} dia${folha.totalFaltas !== 1 ? 's' : ''})`, valor: parseFloat(folha.descontoFaltas) },
    { label: 'INSS', valor: parseFloat(folha.inss) },
  ].filter(l => l.valor > 0);

  const totalProventos = proventos.reduce((a, b) => a + b.valor, 0);
  const totalDescontos = descontos.reduce((a, b) => a + b.valor, 0);

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-modal w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Holerite</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {folha.funcionario?.nome} · {meses[folha.mes - 1]} de {folha.ano}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/relatorios/folha/pdf/${folha.id}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors" title="Baixar PDF">
              <Download className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proventos</p>
            </div>
            <div className="space-y-1.5">
              {proventos.map(({ label, valor }) => (
                <div key={label} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-emerald-600">{fmt(valor)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-1.5 px-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Total de Proventos</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{fmt(totalProventos)}</span>
              </div>
            </div>
          </div>

          {descontos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descontos</p>
              </div>
              <div className="space-y-1.5">
                {descontos.map(({ label, valor }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-semibold text-red-500">- {fmt(valor)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1.5 px-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">Total de Descontos</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">- {fmt(totalDescontos)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-blue-600 rounded-xl">
            <div>
              <p className="text-blue-200 text-xs font-semibold">Salário Líquido</p>
              <p className="text-white text-xs mt-0.5">{meses[folha.mes - 1]} / {folha.ano}</p>
            </div>
            <p className="text-white text-xl font-bold">{fmt(parseFloat(folha.salarioLiquido))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
