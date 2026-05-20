'use client';
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface RelatorioFiltrosProps {
  onFiltrar: (filtros: any) => void;
  tipo: 'ponto' | 'faltas' | 'folha' | 'financeiro';
}

export default function RelatorioFiltros({ onFiltrar, tipo }: RelatorioFiltrosProps) {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    funcionarioId: '',
    status: '',
    categoria: '',
    mes: '',
    ano: new Date().getFullYear().toString(),
  });

  const [expandido, setExpandido] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleAplicar = () => {
    onFiltrar(filtros);
  };

  const handleLimpar = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      funcionarioId: '',
      status: '',
      categoria: '',
      mes: '',
      ano: new Date().getFullYear().toString(),
    });
    onFiltrar({});
  };

  return (
    <div className="card p-4 mb-6">
      <button
        onClick={() => setExpandido(!expandido)}
        className="flex items-center gap-2 text-[var(--text-primary)] font-semibold hover:text-[var(--primary)]"
      >
        <Filter className="h-5 w-5" />
        Filtros Avançados
        <span className="ml-auto text-sm text-[var(--text-muted)]">
          {expandido ? '▼' : '▶'}
        </span>
      </button>

      {expandido && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Data Início */}
          <div>
            <label className="label">Data Início</label>
            <input
              type="date"
              name="dataInicio"
              value={filtros.dataInicio}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="label">Data Fim</label>
            <input
              type="date"
              name="dataFim"
              value={filtros.dataFim}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Status (para folha e financeiro) */}
          {(tipo === 'folha' || tipo === 'financeiro') && (
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={filtros.status}
                onChange={handleChange}
                className="input"
              >
                <option value="">Todos</option>
                {tipo === 'folha' && (
                  <>
                    <option value="PENDENTE">Pendente</option>
                    <option value="PROCESSADA">Processada</option>
                    <option value="PAGA">Paga</option>
                  </>
                )}
                {tipo === 'financeiro' && (
                  <>
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGA">Paga</option>
                    <option value="VENCIDA">Vencida</option>
                    <option value="CANCELADA">Cancelada</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Categoria (para financeiro) */}
          {tipo === 'financeiro' && (
            <div>
              <label className="label">Categoria</label>
              <input
                type="text"
                name="categoria"
                placeholder="Ex: Salários"
                value={filtros.categoria}
                onChange={handleChange}
                className="input"
              />
            </div>
          )}

          {/* Mês/Ano (para folha) */}
          {tipo === 'folha' && (
            <>
              <div>
                <label className="label">Mês</label>
                <select
                  name="mes"
                  value={filtros.mes}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Todos</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ano</label>
                <select
                  name="ano"
                  value={filtros.ano}
                  onChange={handleChange}
                  className="input"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-2 items-end">
            <button
              onClick={handleAplicar}
              className="btn-primary flex-1 py-2 text-sm"
            >
              <Search className="h-4 w-4" />
              Aplicar
            </button>
            <button
              onClick={handleLimpar}
              className="btn-secondary flex-1 py-2 text-sm"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
