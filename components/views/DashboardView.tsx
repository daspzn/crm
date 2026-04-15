import { useMemo } from 'react';
import {
  DollarSign,
  Users,
  Wallet,
  TrendingUp,
  Activity,
  Receipt,
  Percent,
  ShoppingCart,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead, DashboardStats, LeadStatus, PaymentStatus } from '@/types';

interface DashboardViewProps {
  leads: Lead[];
  stats: DashboardStats;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadsByPaymentStatus: (paymentStatus: PaymentStatus) => Lead[];
}

const statusConfig: Record<LeadStatus, { label: string; color: string; gradient: string }> = {
  novo: { label: 'Novo', color: 'bg-slate-500', gradient: 'from-slate-400 to-slate-600' },
  contatado: { label: 'Contatado', color: 'bg-blue-500', gradient: 'from-blue-400 to-indigo-600' },
  proposta: { label: 'Proposta', color: 'bg-violet-500', gradient: 'from-violet-400 to-purple-600' },
  negociando: { label: 'Negociando', color: 'bg-amber-500', gradient: 'from-amber-400 to-orange-600' },
  fechado: { label: 'Fechado', color: 'bg-emerald-500', gradient: 'from-emerald-400 to-teal-600' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pendente: { label: 'Pendente', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  parcial: { label: 'Parcial', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  pago: { label: 'Pago', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
};

export function DashboardView({ leads, stats, getLeadsByStatus, getLeadsByPaymentStatus }: DashboardViewProps) {
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [leads]);

  const statCards = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads.toString(),
      subtitle: 'Cadastrados',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      title: 'Negócios Fechados',
      value: stats.closedDeals.toString(),
      subtitle: `${stats.conversionRate}% conversão`,
      icon: ShoppingCart,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toLocaleString('pt-BR')}`,
      subtitle: 'Por negócio',
      icon: Receipt,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/20',
    },
    {
      title: 'Faturamento',
      value: `R$ ${stats.expectedRevenue.toLocaleString('pt-BR')}`,
      subtitle: 'Valor esperado',
      icon: DollarSign,
      gradient: 'from-indigo-500 to-blue-600',
      shadowColor: 'shadow-indigo-500/20',
    },
    {
      title: 'Recebido',
      value: `R$ ${stats.receivedRevenue.toLocaleString('pt-BR')}`,
      subtitle: `${stats.paymentCompletionRate}% recebido`,
      icon: Wallet,
      gradient: 'from-emerald-500 to-green-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'Pendente',
      value: `R$ ${stats.pendingRevenue.toLocaleString('pt-BR')}`,
      subtitle: 'A receber',
      icon: CreditCard,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/20',
    },
  ];

  const statusDistribution = Object.entries(statusConfig).map(([status, config]) => ({
    status: status as LeadStatus,
    ...config,
    count: getLeadsByStatus(status as LeadStatus).length,
  }));

  const paymentDistribution = [
    { status: 'pago' as PaymentStatus, label: 'Pago', count: getLeadsByPaymentStatus('pago').length, color: 'bg-emerald-500' },
    { status: 'parcial' as PaymentStatus, label: 'Parcial', count: getLeadsByPaymentStatus('parcial').length, color: 'bg-amber-500' },
    { status: 'pendente' as PaymentStatus, label: 'Pendente', count: getLeadsByPaymentStatus('pendente').length, color: 'bg-rose-500' },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-8 pb-28 lg:pb-8">
      {/* Header - Premium */}
      <div className="mb-8 lg:mb-10">
        <h1 className="text-[28px] sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2 text-base sm:text-lg">Visão geral dos seus leads e finanças</p>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 mb-8 lg:mb-10">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title} className="border-0 bg-white shadow-card hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadowColor} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid - Premium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Status Distribution */}
        <Card className="border-0 shadow-card">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-600" />
              </div>
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
            <div className="space-y-5">
              {statusDistribution.map((item) => {
                const percentage = stats.totalLeads > 0
                  ? Math.round((item.count / stats.totalLeads) * 100)
                  : 0;

                return (
                  <div key={item.status} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${item.gradient}`} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{item.count} leads</span>
                        <span className="text-sm font-semibold text-slate-900 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.gradient} transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Distribution */}
        <Card className="border-0 shadow-card">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-slate-600" />
              </div>
              Situação de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
            <div className="space-y-5">
              {paymentDistribution.map((item) => {
                const totalWithValue = leads.filter(l => l.projectValue > 0).length;
                const percentage = totalWithValue > 0
                  ? Math.round((item.count / totalWithValue) * 100)
                  : 0;

                return (
                  <div key={item.status} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{item.count} leads</span>
                        <span className="text-sm font-semibold text-slate-900 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads - Premium */}
        <Card className="border-0 shadow-card lg:col-span-2">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              Leads Recentes
            </CardTitle>
            <CardDescription className="text-sm">Últimos leads cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {recentLeads.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-base font-medium">Nenhum lead cadastrado</p>
                  <p className="text-slate-400 text-sm mt-1">Adicione seu primeiro lead para começar</p>
                </div>
              ) : (
                recentLeads.map((lead) => {
                  const paymentConfig = paymentStatusConfig[lead.paymentStatus];

                  return (
                    <div
                      key={lead.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-200 border border-slate-100/80 active:scale-[0.98] tap-transparent group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
                        <span className="text-white text-sm font-bold">
                          {lead.businessName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{lead.businessName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{lead.niche} • {lead.city}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${paymentConfig.bgColor} ${paymentConfig.color}`}>
                            {paymentConfig.label}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            R$ {lead.projectValue.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={lead.leadStatus === 'fechado' ? 'default' : 'secondary'}
                        className="flex-shrink-0 text-xs font-medium"
                      >
                        {statusConfig[lead.leadStatus].label}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
