export type LeadStatus = 'novo' | 'contatado' | 'proposta' | 'negociando' | 'fechado';
export type PaymentStatus = 'pendente' | 'parcial' | 'pago';
export type LeadTemperature = 'all' | 'hot' | 'warm' | 'cold' | 'paid' | 'closed';

export interface AIAnalysis {
  opportunityScore: number; // 0-100
  leadQuality: 'excelente' | 'bom' | 'medio' | 'baixo';
  mainProblem: string;
  recommendedService: string;
  salesArgument: string;
  analyzedAt: string;
}

export interface GeneratedMessage {
  platform: 'instagram' | 'whatsapp';
  message: string;
  generatedAt: string;
}

export interface Lead {
  id: number;
  userId: string;
  businessName: string;
  niche: string;
  city: string;
  contact: string;
  projectValue: number;
  amountReceived: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  leadStatus: LeadStatus;
  notes: string;
  aiAnalysis?: AIAnalysis;
  generatedMessage?: GeneratedMessage;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  closedDeals: number;
  expectedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  averageTicket: number;
  conversionRate: number;
  paymentCompletionRate: number;
}

export type ViewSection = 'dashboard' | 'leads' | 'finance' | 'finder';

export interface LeadFormData {
  businessName: string;
  niche: string;
  city: string;
  contact: string;
  projectValue: number;
  amountReceived: number;
  leadStatus: LeadStatus;
  notes: string;
}
