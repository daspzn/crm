import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Sparkles,
  MessageSquare,
  Filter,
  X,
  Pencil,
  CheckCircle2,
  Clock,
  Wallet,
  AlertCircle,
  CheckCircle,
  Copy,
  BarChart3,
  Lightbulb,
  Megaphone,
  Loader2,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectOption } from '@/components/ui/select';
import { Lead, LeadStatus, PaymentStatus, AIAnalysis, GeneratedMessage } from '@/types';
import { analyzeLead, generateMessage, getQualityColor, getQualityLabel } from '@/services/aiService';
import { cn } from '@/lib/utils';

interface LeadsViewProps {
  leads: Lead[];
  stats: { totalLeads: number; };
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount' | 'paymentStatus'>) => void;
  updateLead: (id: number, updates: Partial<Lead>) => void;
  deleteLead: (id: number) => void;
  updatePayment: (id: number, amountReceived: number) => void;
  markAsPaid: (id: number) => void;
  saveAIAnalysis: (id: number, analysis: AIAnalysis) => void;
  saveGeneratedMessage: (id: number, message: GeneratedMessage) => void;
}

const statusOptions: LeadStatus[] = ['novo', 'contatado', 'proposta', 'negociando', 'fechado'];

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string; gradient: string }> = {
  novo: { label: 'Novo', color: 'text-slate-700', bgColor: 'bg-slate-100', gradient: 'from-slate-400 to-slate-500' },
  contatado: { label: 'Contatado', color: 'text-blue-700', bgColor: 'bg-blue-100', gradient: 'from-blue-400 to-blue-600' },
  proposta: { label: 'Proposta', color: 'text-violet-700', bgColor: 'bg-violet-100', gradient: 'from-violet-400 to-purple-600' },
  negociando: { label: 'Negociando', color: 'text-amber-700', bgColor: 'bg-amber-100', gradient: 'from-amber-400 to-orange-600' },
  fechado: { label: 'Fechado', color: 'text-emerald-700', bgColor: 'bg-emerald-100', gradient: 'from-emerald-400 to-teal-600' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  pendente: { label: 'Pendente', color: 'text-rose-700', bgColor: 'bg-rose-100', icon: Clock },
  parcial: { label: 'Parcial', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Wallet },
  pago: { label: 'Pago', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle2 },
};

export function LeadsView({ leads, stats, addLead, updateLead, deleteLead, updatePayment, markAsPaid, saveAIAnalysis, saveGeneratedMessage }: LeadsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; leadId: number | null; amount: string }>({ isOpen: false, leadId: null, amount: '' });
  const [expandedAI, setExpandedAI] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);

  const [form, setForm] = useState({
    businessName: '',
    niche: '',
    city: '',
    contact: '',
    projectValue: '',
    amountReceived: '',
    leadStatus: 'novo' as LeadStatus,
    notes: '',
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = [lead.businessName, lead.niche, lead.city, lead.contact, lead.leadStatus]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.leadStatus === statusFilter;
      const matchesPayment = paymentFilter === 'all' || lead.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [leads, search, statusFilter, paymentFilter]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddLead = async () => {
    if (!form.businessName || !form.niche || !form.city) return;
    setIsSubmitting(true);
    try {
      await addLead({
        businessName: form.businessName,
        niche: form.niche,
        city: form.city,
        contact: form.contact,
        projectValue: Number(form.projectValue || 0),
        amountReceived: Number(form.amountReceived || 0),
        leadStatus: form.leadStatus,
        notes: form.notes,
      });
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;
    setIsSubmitting(true);
    try {
      await updateLead(editingLead.id, {
        businessName: editingLead.businessName,
        niche: editingLead.niche,
        city: editingLead.city,
        contact: editingLead.contact,
        projectValue: Number(editingLead.projectValue || 0),
        amountReceived: Number(editingLead.amountReceived || 0),
        leadStatus: editingLead.leadStatus,
        notes: editingLead.notes,
      });
      setEditingLead(null);
    } catch (err) {
      console.error('Failed to update lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!paymentModal.leadId || paymentModal.amount === '') return;
    setIsSubmitting(true);
    try {
      await updatePayment(paymentModal.leadId, Number(paymentModal.amount));
      setPaymentModal({ isOpen: false, leadId: null, amount: '' });
    } catch (err) {
      console.error('Failed to update payment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async (lead: Lead) => {
    setAnalyzing(lead.id);
    try {
      const analysis = await analyzeLead(lead);
      await saveAIAnalysis(lead.id, analysis);
      if (expandedAI !== lead.id) setExpandedAI(lead.id);
    } catch (err) {
      console.error('Failed to analyze lead:', err);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleGenerateMessage = async (lead: Lead) => {
    setGenerating(lead.id);
    try {
      const message = await generateMessage(lead, 'whatsapp');
      await saveGeneratedMessage(lead.id, message);
      if (expandedAI !== lead.id) setExpandedAI(lead.id);
    } catch (err) {
      console.error('Failed to generate message:', err);
    } finally {
      setGenerating(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetForm = () => {
    setForm({
      businessName: '',
      niche: '',
      city: '',
      contact: '',
      projectValue: '',
      amountReceived: '',
      leadStatus: 'novo',
      notes: '',
    });
  };

  const startEditing = (lead: Lead) => {
    setEditingLead({ ...lead });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPaymentModal = (lead: Lead) => {
    setPaymentModal({
      isOpen: true,
      leadId: lead.id,
      amount: lead.amountReceived.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAddForm = () => {
    if (showAddForm) {
      setShowAddForm(false);
      resetForm();
    } else {
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: LeadStatus) => {
    try {
      await updateLead(leadId, { leadStatus: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    try {
      await deleteLead(leadId);
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleMarkAsPaid = async (leadId: number) => {
    try {
      await markAsPaid(leadId);
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 pb-28 lg:pb-8">
      {/* Header - Premium */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10">
        <div>
          <h1 className="text-[28px] sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">Gerencie seus contatos com análise de IA</p>
        </div>
        <div className="hidden sm:block">
          <Button
            onClick={toggleAddForm}
            className="gap-2"
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showAddForm ? 'Cancelar' : 'Novo Lead'}
          </Button>
        </div>
      </div>

      {/* Add Form - Premium */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        showAddForm ? "max-h-[800px] opacity-100 mb-6" : "max-h-0 opacity-0"
      )}>
        <Card className="border-0 shadow-card">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-violet-600" />
              </div>
              Adicionar Novo Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input placeholder="Nome do Negócio *" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              <Input placeholder="Nicho *" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
              <Input placeholder="Cidade *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="Contato" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <Input placeholder="Valor Total" type="number" value={form.projectValue} onChange={(e) => setForm({ ...form, projectValue: e.target.value })} />
              <Input placeholder="Valor Recebido" type="number" value={form.amountReceived} onChange={(e) => setForm({ ...form, amountReceived: e.target.value })} />
              <Select value={form.leadStatus} onChange={(e) => setForm({ ...form, leadStatus: e.target.value as LeadStatus })}>
                {statusOptions.map((status) => (
                  <SelectOption key={status} value={status}>{statusConfig[status].label}</SelectOption>
                ))}
              </Select>
            </div>
            <div className="mt-4">
              <Input placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleAddLead} disabled={!form.businessName || !form.niche || !form.city}>Adicionar Lead</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form - Premium */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        editingLead ? "max-h-[800px] opacity-100 mb-6" : "max-h-0 opacity-0"
      )}>
        {editingLead && (
          <Card className="border-0 shadow-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-blue-600" />
                </div>
                Editar Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input value={editingLead.businessName} onChange={(e) => setEditingLead({ ...editingLead, businessName: e.target.value })} />
                <Input value={editingLead.niche} onChange={(e) => setEditingLead({ ...editingLead, niche: e.target.value })} />
                <Input value={editingLead.city} onChange={(e) => setEditingLead({ ...editingLead, city: e.target.value })} />
                <Input value={editingLead.contact} onChange={(e) => setEditingLead({ ...editingLead, contact: e.target.value })} />
                <Input type="number" value={editingLead.projectValue} onChange={(e) => setEditingLead({ ...editingLead, projectValue: Number(e.target.value) })} />
                <Input type="number" value={editingLead.amountReceived} onChange={(e) => setEditingLead({ ...editingLead, amountReceived: Number(e.target.value) })} />
                <Select value={editingLead.leadStatus} onChange={(e) => setEditingLead({ ...editingLead, leadStatus: e.target.value as LeadStatus })}>
                  {statusOptions.map((status) => (
                    <SelectOption key={status} value={status}>{statusConfig[status].label}</SelectOption>
                  ))}
                </Select>
              </div>
              <div className="mt-4">
                <Input value={editingLead.notes} onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })} />
              </div>
              <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingLead(null)}>Cancelar</Button>
                <Button onClick={handleUpdateLead}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal - Premium */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        paymentModal.isOpen ? "max-h-[400px] opacity-100 mb-6" : "max-h-0 opacity-0"
      )}>
        {paymentModal.isOpen && (
          <Card className="border-0 shadow-card bg-gradient-to-br from-amber-50 to-orange-50/50">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-amber-600" />
                </div>
                Atualizar Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Valor Recebido (R$)</label>
                  <Input type="number" value={paymentModal.amount} onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })} placeholder="0,00" />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => setPaymentModal({ isOpen: false, leadId: null, amount: '' })}>Cancelar</Button>
                  <Button onClick={handleUpdatePayment}>Atualizar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters - Premium */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 rounded-xl" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')} className="w-full sm:w-44 rounded-xl">
            <SelectOption value="all">Todos os status</SelectOption>
            {statusOptions.map((status) => (<SelectOption key={status} value={status}>{statusConfig[status].label}</SelectOption>))}
          </Select>
          <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')} className="w-full sm:w-44 rounded-xl">
            <SelectOption value="all">Todos pagamentos</SelectOption>
            <SelectOption value="pendente">Pendente</SelectOption>
            <SelectOption value="parcial">Parcial</SelectOption>
            <SelectOption value="pago">Pago</SelectOption>
          </Select>
        </div>
      </div>

      <p className="text-sm text-slate-400 font-medium mb-6">Mostrando <span className="text-slate-700">{filteredLeads.length}</span> de <span className="text-slate-700">{stats.totalLeads}</span> leads</p>

      {/* Leads List - Premium */}
      <div className="grid gap-4">
        {filteredLeads.length === 0 ? (
          <Card className="border-0 shadow-card">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-500 text-lg font-medium">Nenhum lead encontrado</p>
              <p className="text-slate-400 text-sm mt-2">Adicione um novo lead ou ajuste os filtros</p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const statusInfo = statusConfig[lead.leadStatus];
            const paymentInfo = paymentStatusConfig[lead.paymentStatus];
            const PaymentIcon = paymentInfo.icon;
            const isExpanded = expandedAI === lead.id;

            return (
              <Card key={lead.id} className="border-0 shadow-card overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-5 xl:gap-6">
                      {/* Lead Info - Premium */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                            <span className="text-white text-xl font-bold">{lead.businessName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 truncate">{lead.businessName}</h3>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span>
                              {lead.aiAnalysis && (
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getQualityColor(lead.aiAnalysis.leadQuality)}`}>
                                  {getQualityLabel(lead.aiAnalysis.leadQuality)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">{lead.niche} • {lead.city}</p>
                            <p className="text-sm text-slate-400 truncate mt-1">Contato: {lead.contact || '—'}</p>

                            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Total:</span>
                                <span className="text-sm font-bold text-slate-700">R$ {lead.projectValue.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Recebido:</span>
                                <span className="text-sm font-bold text-emerald-600">R$ {lead.amountReceived.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Pendente:</span>
                                <span className={cn("text-sm font-bold", lead.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-600')}>R$ {lead.remainingAmount.toLocaleString('pt-BR')}</span>
                              </div>
                            </div>

                            {lead.notes && (
                              <p className="text-sm text-slate-600 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">{lead.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions - Premium */}
                      <div className="flex flex-col gap-3">
                        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${paymentInfo.bgColor} w-fit`}>
                          <PaymentIcon className={`w-4 h-4 ${paymentInfo.color}`} />
                          <span className={`text-sm font-semibold ${paymentInfo.color}`}>{paymentInfo.label}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAnalyze(lead)} disabled={analyzing === lead.id}
                            className="gap-2 rounded-lg"
                          >
                            {analyzing === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-violet-500" />}
                            Analisar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleGenerateMessage(lead)} disabled={generating === lead.id}
                            className="gap-2 rounded-lg"
                          >
                            {generating === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4 text-blue-500" />}
                            Mensagem
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Select value={lead.leadStatus} onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)} className="w-32 rounded-lg">
                            {statusOptions.map((status) => (<SelectOption key={status} value={status}>{statusConfig[status].label}</SelectOption>
                            ))}
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => openPaymentModal(lead)} className="rounded-lg">Pagamento</Button>
                          {lead.paymentStatus !== 'pago' && (
                            <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(lead.id)} className="text-emerald-600 rounded-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => startEditing(lead)} className="rounded-lg">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteLead(lead.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {(lead.aiAnalysis || lead.generatedMessage) && (
                          <Button variant="ghost" size="sm" onClick={() => setExpandedAI(isExpanded ? null : lead.id)} className="text-slate-400 rounded-lg">
                            {isExpanded ? 'Ocultar IA' : 'Ver análise IA'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* AI Section - Premium */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      isExpanded && (lead.aiAnalysis || lead.generatedMessage) ? "max-h-[2000px] opacity-100 mt-5 pt-5 border-t border-slate-200" : "max-h-0 opacity-0"
                    )}>
                      <div className="space-y-4">
                        {lead.aiAnalysis && (
                          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50/50">
                            <CardHeader className="pb-2 p-5">
                              <CardTitle className="text-sm flex items-center gap-2.5 text-violet-700">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                  <BarChart3 className="w-4 h-4" />
                                </div>
                                Análise de Oportunidade
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5 pt-0">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-violet-100">
                                  <p className="text-xs text-slate-400 font-medium mb-2">Score de Oportunidade</p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full" style={{ width: `${lead.aiAnalysis.opportunityScore}%` }} />
                                    </div>
                                    <span className="text-2xl font-bold text-violet-600">{lead.aiAnalysis.opportunityScore}</span>
                                  </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-violet-100">
                                  <p className="text-xs text-slate-400 font-medium mb-2">Qualidade do Lead</p>
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getQualityColor(lead.aiAnalysis.leadQuality)}`}>
                                    {getQualityLabel(lead.aiAnalysis.leadQuality)}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-violet-100">
                                <p className="text-xs text-violet-600 font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" />Problema Principal Identificado</p>
                                <p className="text-sm text-slate-700">{lead.aiAnalysis.mainProblem}</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-violet-100">
                                <p className="text-xs text-violet-600 font-semibold mb-2 flex items-center gap-2"><Lightbulb className="w-3.5 h-3.5" />Serviço Recomendado</p>
                                <p className="text-sm text-slate-700">{lead.aiAnalysis.recommendedService}</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-violet-100">
                                <p className="text-xs text-violet-600 font-semibold mb-2 flex items-center gap-2"><Megaphone className="w-3.5 h-3.5" />Argumento de Venda</p>
                                <p className="text-sm text-slate-700">{lead.aiAnalysis.salesArgument}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {lead.generatedMessage && (
                          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50/50">
                            <CardHeader className="pb-2 p-5">
                              <CardTitle className="text-sm flex items-center gap-2.5 text-blue-700">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                                Mensagem Gerada para {lead.generatedMessage.platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{lead.generatedMessage.message}</p>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(lead.generatedMessage!.message)} className="gap-2 rounded-lg">
                                  <Copy className="w-4 h-4" />Copiar mensagem
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Floating Action Button - WhatsApp Style */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40 animate-float-in">
        <Button
          size="float"
          onClick={toggleAddForm}
          className="shadow-float"
        >
          {showAddForm ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          {showAddForm ? 'Fechar' : 'Novo Lead'}
        </Button>
      </div>
    </div>
  );
}
