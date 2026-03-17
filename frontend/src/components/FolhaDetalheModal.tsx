'use client';
import { X, Download } from 'lucide-react';

interface Props {
  folha: any;
  onClose: () => void;
}

export default function FolhaDetalheModal({ folha, onClose }: Props) {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const linhas = [
    { label: 'Salário Base', valor: parseFloat(folha.salarioBase), tipo: 'neutro' },
    { label: `Horas Extras 50% (${folha.totalHorasExtras}h)`, valor: parseFloat(folha.horasExtras50), tipo: 'positivo' },
    { label: 'Horas Extras 100%', valor: parseFloat(folha.horasExtras100), tipo: 'positivo' },
    { label: 'Bônus', valor: parseFloat(folha.bonus), tipo: 'positivo' },
    { label: 'Vale Transporte', valor: parseFloat(folha.valeTransporte), tipo: 'positivo' },
    { label: 'Vale Alimentação', valor: parseFloat(folha.valeAlimentacao), tipo: 'positivo' },
    { label: `Desconto Faltas (${folha.totalFaltas} dias)`, valor: -parseFloat(folha.descontoFaltas), tipo: 'negativo' },
    { label: 'Desconto INSS', valor: -parseFloat(folha.inss), tipo: 'negativo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Holerite</h2>
            <p className="text-sm text-gray-500">{folha.funcionario?.nome} · {folha.mes}/{folha.ano}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/relatorios/folha/pdf/${folha.id}`}
              target="_blank"
              className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-2">
          {linhas.map(({ label, valor, tipo }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
              <span className={`text-sm font-medium ${
                tipo === 'positivo' ? 'text-green-600' :
                tipo === 'negativo' ? 'text-red-600' :
                'text-gray-900 dark:text-white'
              }`}>
                {valor >= 0 ? '+' : ''}{fmt(valor)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-gray-200 dark:border-gray-700">
            <span className="font-bold text-gray-900 dark:text-white">Salário Líquido</span>
            <span className="text-xl font-bold text-blue-600">{fmt(parseFloat(folha.salarioLiquido))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
