'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: string;
  prioridade: string;
  criadoEm: string;
}

interface AnotacoesModalProps {
  funcionarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

const tiposAnotacao = ['GERAL', 'AVISO', 'DISCIPLINA', 'ELOGIO', 'REUNIAO', 'TAREFA'];
const prioridades = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];

export default function AnotacoesModal({ funcionarioId, isOpen, onClose }: AnotacoesModalProps) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'GERAL',
    prioridade: 'NORMAL',
  });

  useEffect(() => {
    if (isOpen) {
      carregarAnotacoes();
    }
  }, [isOpen, funcionarioId]);

  const carregarAnotacoes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/anotacoes/${funcionarioId}`);
      setAnotacoes(res.data.data);
    } catch (err) {
      toast.error('Erro ao carregar anotações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.conteudo) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/anotacoes/${editingId}`, formData);
        toast.success('Anotação atualizada');
      } else {
        await api.post('/api/anotacoes', {
          funcionarioId,
          ...formData,
        });
        toast.success('Anotação criada');
      }
      setFormData({ titulo: '', conteudo: '', tipo: 'GERAL', prioridade: 'NORMAL' });
      setEditingId(null);
      setShowForm(false);
      carregarAnotacoes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar anotação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta anotação?')) return;

    try {
      await api.delete(`/api/anotacoes/${id}`);
      toast.success('Anotação deletada');
      carregarAnotacoes();
    } catch (err) {
      toast.error('Erro ao deletar anotação');
    }
  };

  const handleEdit = (anotacao: Anotacao) => {
    setFormData({
      titulo: anotacao.titulo,
      conteudo: anotacao.conteudo,
      tipo: anotacao.tipo,
      prioridade: anotacao.prioridade,
    });
    setEditingId(anotacao.id);
    setShowForm(true);
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      BAIXA: 'bg-blue-100 text-blue-800',
      NORMAL: 'bg-gray-100 text-gray-800',
      ALTA: 'bg-orange-100 text-orange-800',
      URGENTE: 'bg-red-100 text-red-800',
    };
    return colors[prioridade as keyof typeof colors] || colors.NORMAL;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Anotações</h2>
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
                <div>
                  <label className="label">Título</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Título da anotação"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Conteúdo</label>
                  <textarea
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    placeholder="Escreva a anotação aqui..."
                    className="input min-h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="input"
                    >
                      {tiposAnotacao.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Prioridade</label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                      className="input"
                    >
                      {prioridades.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Atualizar' : 'Criar'} Anotação
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ titulo: '', conteudo: '', tipo: 'GERAL', prioridade: 'NORMAL' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Anotações List */}
          {loading ? (
            <div className="text-center py-8 text-[var(--text-muted)]">Carregando...</div>
          ) : anotacoes.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma anotação</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anotacoes.map(anotacao => (
                <div key={anotacao.id} className="card p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">{anotacao.titulo}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{anotacao.conteudo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(anotacao)}
                        className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-muted)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(anotacao.id)}
                        className="p-1 hover:bg-red-100 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <span className={`badge text-xs ${getPrioridadeColor(anotacao.prioridade)}`}>
                      {anotacao.prioridade}
                    </span>
                    <span className="badge text-xs">{anotacao.tipo}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(anotacao.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
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
              Nova Anotação
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
