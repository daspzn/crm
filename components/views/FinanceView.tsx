import { useMemo, useState } from 'react';
import {
  DollarSign,
  Wallet,
  Clock,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Percent,
  BarChart3,
  Wallet2,
  Clock4,
  CheckCircle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, DashboardStats, PaymentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface FinanceViewProps {
  leads: Lead[];
  stats: DashboardStats;
  getPendingPayments: () => Lead[];
  getPaidLeads: () => Lead[];
  getPartialPayments: () => Lead[];
  markAsPaid: (id: number) => void;
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string; borderColor: string; gradient: string }> = {
  pendente: { label: 'Pendente', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', gradient: 'from-rose-400 to-pink-600' },
  parcial: { label: 'Parcial', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', gradient: 'from-amber-400 to-orange-600' },
  pago: { label: 'Pago', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-600' },
};

export function FinanceView({
  leads,
  stats,
  getPendingPayments,
  getPaidLeads,
  getPartialPayments,
  markAsPaid
}: FinanceViewProps) {
  const pendingPayments = useMemo(() => getPendingPayments(), [getPendingPayments]);
  const paidLeads = useMemo(() => getPaidLeads(), [getPaidLeads]);
  const partialPayments = useMemo(() => getPartialPayments(), [getPartialPayments]);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const handleMarkAsPaid = async (leadId: number) => {
    setIsProcessing(leadId);
    try {
      await markAsPaid(leadId);
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    } finally {
      setIsProcessing(null);
    }
  };

  const financeStats = [
    {
      title: 'Faturamento Total',
      value: `R$ ${stats.expectedRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
      description: 'Soma de todos os projetos',
    },
    {
      title: 'Valor Recebido',
      value: `R$ ${stats.receivedRevenue.toLocaleString('pt-BR')}`,
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
      description: 'Pagamentos confirmados',
    },
    {
      title: 'Valor Pendente',
      value: `R$ ${stats.pendingRevenue.toLocaleString('pt-BR')}`,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
      description: 'Ainda a receber',
    },
    {
      title: 'Taxa de Recebimento',
      value: `${stats.paymentCompletionRate}%`,
      icon: Percent,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20',
      description: 'Recebido / Total',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toLocaleString('pt-BR')}`,
      icon: Receipt,
      gradient: 'from-indigo-500 to-blue-600',
      shadowColor: 'shadow-indigo-500/20',
      description: 'Por negócio fechado',
    },
    {
      title: 'Negócios Fechados',
      value: stats.closedDeals.toString(),
      icon: BarChart3,
      gradient: 'from-cyan-500 to-teal-600',
      shadowColor: 'shadow-cyan-500/20',
      description: `${stats.conversionRate}% conversão`,
    },
  ];

  const exportToCSV = () => {
    const headers = ['Negócio', 'Nicho', 'Cidade', 'Status Lead', 'Valor Total', 'Recebido', 'Pendente', 'Status Pagamento', 'Data'];
    const rows = leads.map(lead => [
      lead.businessName,
      lead.niche,
      lead.city,
      lead.leadStatus,
      lead.projectValue,
      lead.amountReceived,
      lead.remainingAmount,
      lead.paymentStatus,
      new Date(lead.createdAt).toLocaleDateString('pt-BR'),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'financeiro_clientops.csv';
    link.click();
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 pb-28 lg:pb-8">
      {/* Header - Premium */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10">
        <div>
          <h1 className="text-[28px] sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">Controle completo de receitas e pagamentos</p>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="gap-2 rounded-xl">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Grid - Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 mb-8 lg:mb-10">
        {financeStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title} className="border-0 shadow-card hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadowColor} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Summary Cards - Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 lg:mb-10">
        <Card className="border-0 shadow-card bg-gradient-to-br from-emerald-50 to-teal-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Pagos</p>
                <p className="text-3xl font-bold text-emerald-700">{paidLeads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-amber-50 to-orange-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Wallet2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Parciais</p>
                <p className="text-3xl font-bold text-amber-700">{partialPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-rose-50 to-pink-50/50 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Clock4 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Pendentes</p>
                <p className="text-3xl font-bold text-rose-700">{pendingPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Premium */}
      <div className="grid gap-5 sm:gap-6">
        {/* Partial Payments */}
        {partialPayments.length > 0 && (
          <Card className="border-0 shadow-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Wallet2 className="w-5 h-5 text-amber-600" />
                </div>
                Pagamentos Parciais
                <Badge variant="warning" className="ml-2 text-xs font-semibold">{partialPayments.length}</Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                Total parcialmente recebido: <span className="font-semibold text-slate-700">R$ {partialPayments.reduce((sum, l) => sum + l.amountReceived, 0).toLocaleString('pt-BR')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {partialPayments.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 tap-transparent"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="text-white text-sm font-bold">
                          {lead.businessName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{lead.businessName}</p>
                        <p className="text-xs text-slate-400">{lead.niche}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Total:</span>
                        <span className="font-semibold text-slate-700">R$ {lead.projectValue.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Recebido:</span>
                        <span className="font-semibold text-emerald-600">R$ {lead.amountReceived.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Restante:</span>
                        <span className="font-semibold text-rose-600">R$ {lead.remainingAmount.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsPaid(lead.id)}
                        disabled={isProcessing === lead.id}
                        className="w-full gap-2 text-emerald-600 rounded-xl border-emerald-200 hover:bg-emerald-50"
                      >
                        {isProcessing === lead.id ? (
                          <>Proces...</>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Marcar como pago
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Payments */}
        <Card className="border-0 shadow-card">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              Pagamentos Pendentes
              <Badge variant="destructive" className="ml-2 text-xs font-semibold">{pendingPayments.length}</Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              Total a receber: <span className="font-semibold text-slate-700">R$ {pendingPayments.reduce((sum, l) => sum + l.remainingAmount, 0).toLocaleString('pt-BR')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-500 text-lg font-medium">Nenhum pagamento pendente</p>
                <p className="text-slate-400 text-sm mt-1">Todos os pagamentos estão em dia!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPayments.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-200/60 tap-transparent"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <span className="text-white text-sm font-bold">
                          {lead.businessName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{lead.businessName}</p>
                        <p className="text-xs text-slate-400">{lead.niche}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Valor total:</span>
                        <span className="font-bold text-slate-700">R$ {lead.projectValue.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-rose-200/60">
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(lead.id)}
                        disabled={isProcessing === lead.id}
                        className="w-full gap-2 rounded-xl"
                      >
                        {isProcessing === lead.id ? (
                          <>Proces...</>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Marcar como pago
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paid Leads */}
        <Card className="border-0 shadow-card">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              Pagamentos Recebidos
              <Badge variant="success" className="ml-2 text-xs font-semibold">{paidLeads.length}</Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              Total recebido: <span className="font-semibold text-slate-700">R$ {stats.receivedRevenue.toLocaleString('pt-BR')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
            {paidLeads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-lg font-medium">Nenhum pagamento recebido</p>
                <p className="text-slate-400 text-sm mt-1">Quando os pagamentos forem confirmados, eles aparecerão aqui</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/60 tap-transparent"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-white text-sm font-bold">
                          {lead.businessName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{lead.businessName}</p>
                        <p className="text-xs text-slate-400">{lead.niche}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Valor recebido:</span>
                        <span className="font-bold text-emerald-600">R$ {lead.amountReceived.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-200/60">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-semibold">Pagamento completo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
