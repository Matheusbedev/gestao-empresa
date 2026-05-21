'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, X as XIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Desconto {
  id: string;
  valor: number;
  motivo: string;
  observacao?: string;
  tipo: string;
  status: string;
  mes: number;
  ano: number;
  criadoEm: string;
}

interface DescontosModalProps {
  funcionarioId: string;
  mes: number;
  ano: number;
  isOpen: boolean;
  onClose: () => void;
}

const tiposDesconto = ['FALTA', 'ATRASO', 'ADIANTAMENTO', 'EMPRESTIMO', 'OUTRO'];

export default function DescontosModal({ funcionarioId, mes, ano, isOpen, onClose }: DescontosModalProps) {
  const [descontos, setDescontos] = useState<Desconto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    valor: '',
    motivo: '',
    observacao: '',
    tipo: 'OUTRO',
  });

  useEffect(() => {
    if (isOpen) {
      carregarDescontos();
    }
  }, [isOpen, funcionarioId, mes, ano]);

  const carregarDescontos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/descontos/funcionario/${funcionarioId}?mes=${mes}&ano=${ano}`);
      setDescontos(res.data.descontos);
    } catch (err) {
      toast.error('Erro ao carregar descontos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.motivo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/descontos/${editingId}`, formData);
        toast.success('Desconto atualizado');
      } else {
        await api.post('/api/descontos', {
          funcionarioId,
          mes,
          ano,
          ...formData,
          valor: parseFloat(formData.valor),
        });
        toast.success('Desconto criado');
      }
      setFormData({ valor: '', motivo: '', observacao: '', tipo: 'OUTRO' });
      setEditingId(null);
      setShowForm(false);
      carregarDescontos();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar desconto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este desconto?')) return;

    try {
      await api.delete(`/api/descontos/${id}`);
      toast.success('Desconto deletado');
      carregarDescontos();
    } catch (err) {
      toast.error('Erro ao deletar desconto');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/descontos/${id}/aprovar`);
      toast.success('Desconto aprovado');
      carregarDescontos();
    } catch (err) {
      toast.error('Erro ao aprovar desconto');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/api/descontos/${id}/rejeitar`);
      toast.success('Desconto rejeitado');
      carregarDescontos();
    } catch (err) {
      toast.error('Erro ao rejeitar desconto');
    }
  };

  const handleEdit = (desconto: Desconto) => {
    setFormData({
      valor: desconto.valor.toString(),
      motivo: desconto.motivo,
      observacao: desconto.observacao || '',
      tipo: desconto.tipo,
    });
    setEditingId(desconto.id);
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      APROVADO: 'bg-emerald-100 text-emerald-800',
      REJEITADO: 'bg-red-100 text-red-800',
      APLICADO: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || colors.PENDENTE;
  };

  const totalDescontos = descontos.reduce((sum, d) => sum + d.valor, 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Descontos</h2>
            <p className="text-sm text-[var(--text-muted)]">{mes}/{ano}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Form */}
          {showForm && (
            <div className="card p-4 space-y-4 bg-[var(--bg-secondary)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="0.00"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="input"
                    >
                      {tiposDesconto.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Motivo</label>
                  <input
                    type="text"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ex: Falta não justificada"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Observação</label>
                  <textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Detalhes adicionais..."
                    className="input min-h-20 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Atualizar' : 'Criar'} Desconto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ valor: '', motivo: '', observacao: '', tipo: 'OUTRO' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Total */}
          {totalDescontos > 0 && (
            <div className="card p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
              <p className="text-sm text-[var(--text-muted)]">Total de Descontos</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Descontos List */}
          {loading ? (
            <div className="text-center py-8 text-[var(--text-muted)]">Carregando...</div>
          ) : descontos.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <p>Nenhum desconto registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {descontos.map(desconto => (
                <div key={desconto.id} className="card p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{desconto.motivo}</h3>
                        <span className={`badge text-xs ${getStatusColor(desconto.status)}`}>
                          {desconto.status}
                        </span>
                      </div>
                      {desconto.observacao && (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{desconto.observacao}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        -R$ {desconto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{desconto.tipo}</p>
                    </div>
                  </div>

                  {desconto.status === 'PENDENTE' && (
                    <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                      <button
                        onClick={() => handleApprove(desconto.id)}
                        className="btn-success flex-1 justify-center gap-1 py-2 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(desconto.id)}
                        className="btn-danger flex-1 justify-center gap-1 py-2 text-sm"
                      >
                        <XIcon className="w-4 h-4" />
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleEdit(desconto)}
                        className="btn-secondary flex-1 justify-center gap-1 py-2 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(desconto.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex gap-2">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex-1 justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Desconto
            </button>
          )}
          <button onClick={onClose} className="btn-secondary flex-1">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
