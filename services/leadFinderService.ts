import { Lead } from '@/types';

// Mock business names by niche
const businessNamesByNiche: Record<string, string[]> = {
  'restaurante': [
    'Sabor & Arte', 'Bistrô Central', 'Tempero Caseiro', 'Delícia do Chef', 'Mesa Brasileira',
    'Ponto de Encontro', 'Cozinha da Vovó', 'Sabor Regional', 'Cantinho Gourmet', 'Panela de Barro',
    'Sabores do Brasil', 'Chef em Casa', 'Gastronomia Local', 'Bom Apetite', 'Casa do Sabor'
  ],
  'dentista': [
    'Odonto Care', 'Sorriso Perfeito', 'Clínica Dental', 'Odonto Prime', 'Sorriso Saudável',
    'Dental Center', 'Odonto Plus', 'Clínica do Sorriso', 'Dentista Popular', 'Sorriso Total',
    'Odonto Vida', 'Dental Saúde', 'Centro Odontológico', 'Sorriso Bonito', 'Clínica Oral'
  ],
  'fotógrafo': [
    'Luz & Cena', 'Momento Único', 'Foco Criativo', 'Captura Perfeita', 'Estúdio Luz',
    'Olhar Fotografia', 'Imagem Viva', 'Flash Studio', 'Pixel Arte', 'Lente Mágica',
    'Click Criativo', 'Fotografia Emocional', 'Imagem Digital', 'Estúdio Criativo', 'Visão Artística'
  ],
  'clínica estética': [
    'Bella Face', 'Corpo & Alma', 'Beleza Natural', 'Estética Premium', 'Cuidar de Você',
    'Beleza Real', 'Corpoe Soul', 'Estética Vida', 'Renova Spa', 'Beleza Plena',
    'Clínica da Beleza', 'Estética Total', 'Beleza Natural', 'Cuidado Estético', 'Estética Bem-Estar'
  ],
  'advogado': [
    'Advocacia Silva', 'Consultório Jurídico', 'Escritório de Direito', 'Justiça e Cia', 'Advogados Associados',
    'Direito e Ordem', 'Sociedade Jurídica', 'Escritório Central', 'Advocacia Premium', 'Consultoria Legal',
    'Assessoria Jurídica', 'Advocacia Consultiva', 'Direito & Gestão', 'Consultório do Direito', 'Advocacia Estratégica'
  ],
  'personal trainer': [
    'Fit Life', 'Corpo em Forma', 'Treino Inteligente', 'Academia em Casa', 'Fitnesse Total',
    'Corpo e Movimento', 'Saúde em Ação', 'Bem Estar Fitness', 'Movimento Saudável', 'Corpo Forte',
    'Treino Personalizado', 'Fitness Life', 'Corpo Ideal', 'Performance Fitness', 'Vida Ativa'
  ],
  'default': [
    'Negócio Local', 'Empresa Central', 'Comércio Local', 'Serviços Premium', 'Soluções Locais',
    'Negócio Digital', 'Empresa Moderna', 'Serviços Express', 'Soluções Rápidas', 'Comércio Moderno',
    'Negócio Inovador', 'Empresa Sustentável', 'Serviços Completos', 'Soluções Integradas', 'Negócio Inteligente'
  ]
};

// Mock Instagram handle generator
function generateInstagramHandle(businessName: string): string {
  const cleanName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffixes = ['', '.oficial', '.br', '_local', '123'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `@${cleanName}${suffix}`;
}

// Mock project value suggestions by niche
function getProjectValueByNiche(niche: string): number {
  const values: Record<string, [number, number]> = {
    'restaurante': [1200, 3500],
    'dentista': [2500, 6000],
    'fotógrafo': [800, 2500],
    'clínica estética': [2000, 5000],
    'advogado': [1500, 4000],
    'personal trainer': [1000, 3000],
    'default': [1000, 3000]
  };

  const [min, max] = values[niche.toLowerCase()] || values['default'];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mock notes generator
function generateNotes(niche: string, businessName: string): string {
  const notesByNiche: Record<string, string[]> = {
    'restaurante': [
      'Não possui cardápio digital. Grande potencial para pedidos online.',
      'Bio forte no Instagram, mas sem site para conversões.',
      'Restaurante tradicional buscando modernização digital.',
      'Alta avaliação no Google, mas baixa presença online.',
      'Interesse em sistema de reservas e pedidos online.'
    ],
    'dentista': [
      'Clínica nova, precisa de presença digital para atrair pacientes.',
      'Sem site institucional, perde clientes para concorrência.',
      'Busca sistema de agendamento online para reduzir faltas.',
      'Especialidades diversas, precisa mostrar no digital.',
      'Excelente reputação, mas sem visibilidade online.'
    ],
    'fotógrafo': [
      'Portfólio espalhado no Instagram, precisa de site organizado.',
      'Alto potencial, mas dificuldade em mostrar trabalhos.',
      'Busca mais visibilidade para fechar mais eventos.',
      'Nicho específico, precisa de portfólio profissional.',
      'Referências boas, mas sem presença digital estruturada.'
    ],
    'clínica estética': [
      'Resultados excelentes, mas sem galeria para mostrar.',
      'Alta demanda, precisa de agendamento online.',
      'Concorrência forte digitalmente, precisa de diferencial.',
      'Bio forte, mas sem conversão para vendas.',
      'Interesse em landing pages para campanhas específicas.'
    ],
    'advogado': [
      'Escritório tradicional buscando modernização.',
      'Especialista na área, mas sem visibilidade online.',
      'Necessita de credibilidade digital para novos clientes.',
      'Sem site para captar leads qualificados.',
      'Potencial para marketing de conteúdo jurídico.'
    ],
    'personal trainer': [
      'Clientes fiéis, mas sem captação digital.',
      'Transformações incríveis, mas sem portfólio organizado.',
      'Busca expandir base de alunos via online.',
      'Conteúdo bom nas redes, mas sem estrutura de vendas.',
      'Interesse em sistema de agendamento de aulas.'
    ],
    'default': [
      'Negócio local com potencial de crescimento digital.',
      'Sem presença online estruturada.',
      'Busca mais visibilidade para atrair clientes.',
      'Concorrência forte no digital, precisa de diferenciação.',
      'Excelente serviço, mas pouca visibilidade online.'
    ]
  };

  const nicheNotes = notesByNiche[niche.toLowerCase()] || notesByNiche['default'];
  return nicheNotes[Math.floor(Math.random() * nicheNotes.length)];
}

export interface LeadFinderParams {
  niche: string;
  city: string;
  limit: number;
}

export interface FoundLead {
  businessName: string;
  niche: string;
  city: string;
  contact: string;
  projectValue: number;
  notes: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function findLeads(params: LeadFinderParams): Promise<FoundLead[]> {
  // Simulate API call delay
  await delay(1500);

  const { niche, city, limit } = params;
  const normalizedNiche = niche.toLowerCase().trim();

  // Get business names for this niche or use default
  const availableNames = businessNamesByNiche[normalizedNiche] || businessNamesByNiche['default'];

  // Shuffle and take requested amount
  const shuffled = [...availableNames].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

  return selected.map(name => ({
    businessName: `${name} ${city}`,
    niche: niche.charAt(0).toUpperCase() + niche.slice(1).toLowerCase(),
    city,
    contact: generateInstagramHandle(name),
    projectValue: getProjectValueByNiche(normalizedNiche),
    notes: generateNotes(niche, name)
  }));
}

// Check if lead already exists (by business name and city)
export function isDuplicateLead(existingLeads: Lead[], businessName: string, city: string): boolean {
  return existingLeads.some(lead =>
    lead.businessName.toLowerCase() === businessName.toLowerCase() &&
    lead.city.toLowerCase() === city.toLowerCase()
  );
}
