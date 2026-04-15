import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { LeadsView } from '@/components/views/LeadsView';
import { FinanceView } from '@/components/views/FinanceView';
import { FinderView } from '@/components/views/FinderView';
import { ViewSection } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewSection>('dashboard');
  const [mounted, setMounted] = useState(false);
  const {
    leads,
    stats,
    addLead,
    updateLead,
    deleteLead,
    updatePayment,
    markAsPaid,
    saveAIAnalysis,
    saveGeneratedMessage,
    getLeadsByStatus,
    getLeadsByPaymentStatus,
    getPendingPayments,
    getPaidLeads,
    getPartialPayments,
  } = useLeads();

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            leads={leads}
            stats={stats}
            getLeadsByStatus={getLeadsByStatus}
            getLeadsByPaymentStatus={getLeadsByPaymentStatus}
          />
        );
      case 'leads':
        return (
          <LeadsView
            leads={leads}
            stats={stats}
            addLead={addLead}
            updateLead={updateLead}
            deleteLead={deleteLead}
            updatePayment={updatePayment}
            markAsPaid={markAsPaid}
            saveAIAnalysis={saveAIAnalysis}
            saveGeneratedMessage={saveGeneratedMessage}
          />
        );
      case 'finance':
        return (
          <FinanceView
            leads={leads}
            stats={stats}
            getPendingPayments={getPendingPayments}
            getPaidLeads={getPaidLeads}
            getPartialPayments={getPartialPayments}
            markAsPaid={markAsPaid}
          />
        );
      case 'finder':
        return (
          <FinderView
            leads={leads}
            addLead={addLead}
          />
        );
      default:
        return (
          <DashboardView
            leads={leads}
            stats={stats}
            getLeadsByStatus={getLeadsByStatus}
            getLeadsByPaymentStatus={getLeadsByPaymentStatus}
          />
        );
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-center">
            <div className="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4 max-w-xs"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 max-w-xs"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 sm:h-32 bg-slate-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen ios-safe-bottom">
          <div className="max-w-[1920px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
