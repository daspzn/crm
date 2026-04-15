import { Lead, AIAnalysis, GeneratedMessage } from '@/types';

export async function analyzeLead(lead: Lead): Promise<AIAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const niche = lead.niche.toLowerCase();
  const businessName = lead.businessName;

  const nicheData: Record<string, {
    problems: string[];
    services: string[];
    arguments: string[];
    baseScore: number;
  }> = {
    'clínica estética': {
      problems: [
        'Baixa visibilidade online e dificuldade em atrair novos pacientes',
        'Concorrência intensa no setor de estética',
        'Falta de agendamento online facilitando desistências'
      ],
      services: [
        'Site institucional com galeria de resultados',
        'Sistema de agendamento online integrado',
        'Landing page para campanhas de tratamentos'
      ],
      arguments: [
        'Um site profissional aumenta a credibilidade e transmite confiança para novos pacientes',
        'Agendamento online reduz cancelamentos e facilita a vida do cliente'
      ],
      baseScore: 85
    },
    'fotógrafo': {
      problems: [
        'Dificuldade em demonstrar portfólio de forma organizada',
        'Perda de leads por falta de botão de contato fácil',
        'Site lento que prejudica SEO e ranqueamento'
      ],
      services: [
        'Portfólio online otimizado e responsivo',
        'Galeria com carregamento lazy para melhor performance',
        'Botão flutuante de WhatsApp e formulário de orçamento'
      ],
      arguments: [
        'Portfólio bem apresentado fecha mais contratos e justifica valores maiores',
        'Facilidade de contato aumenta conversão em até 40%'
      ],
      baseScore: 78
    },
    'dentista': {
      problems: [
        'Pacientes buscam online antes de agendar consulta',
        'Falta de informações claras sobre tratamentos',
        'Sem sistema de agendamento automatizado'
      ],
      services: [
        'Site institucional com explicação dos tratamentos',
        'Blog para SEO e marketing de conteúdo',
        'Agendamento online com lembretes automáticos'
      ],
      arguments: [
        'Pacientes pesquisam online - estar presente é obrigatório',
        'Site profissional transmite segurança e credibilidade para tratamentos'
      ],
      baseScore: 88
    },
    'restaurante': {
      problems: [
        'Cardápio não acessível online perde clientes',
        'Sem pedidos online perde vendas para iFood (comissão alta)',
        'Falta de presença digital em um mercado competitivo'
      ],
      services: [
        'Cardápio digital interativo e responsivo',
        'Sistema de pedidos online próprio (sem comissão)',
        'Integração com WhatsApp Business para pedidos'
      ],
      arguments: [
        'Cardápio digital bem feito aumenta ticket médio em 25%',
        'Pedidos próprios eliminam comissões e aumentam lucratividade'
      ],
      baseScore: 82
    },
    'default': {
      problems: [
        'Baixa presença digital prejudica credibilidade',
        'Concorrência já está online capturando seus clientes',
        'Dificuldade em comunicar valor do serviço sem site profissional'
      ],
      services: [
        'Site institucional moderno e responsivo',
        'Otimização para SEO local',
        'Integração com redes sociais e WhatsApp'
      ],
      arguments: [
        'Site profissional é cartão de visitas digital obrigatório em 2024',
        'Presença online aumenta confiança e converte mais visitantes em clientes'
      ],
      baseScore: 75
    }
  };

  const data = Object.entries(nicheData).find(([key]) => niche.includes(key))?.[1] || nicheData.default;

  let score = data.baseScore;
  if (lead.projectValue > 3000) score += 5;
  if (lead.projectValue > 5000) score += 5;
  if (lead.notes && lead.notes.length > 50) score += 3;
  score += Math.floor(Math.random() * 11) - 5;
  score = Math.max(0, Math.min(100, score));

  let quality: AIAnalysis['leadQuality'];
  if (score >= 85) quality = 'excelente';
  else if (score >= 70) quality = 'bom';
  else if (score >= 50) quality = 'medio';
  else quality = 'baixo';

  return {
    opportunityScore: score,
    leadQuality: quality,
    mainProblem: data.problems[Math.floor(Math.random() * data.problems.length)],
    recommendedService: data.services[Math.floor(Math.random() * data.services.length)],
    salesArgument: data.arguments[Math.floor(Math.random() * data.arguments.length)],
    analyzedAt: new Date().toISOString()
  };
}

export async function generateMessage(lead: Lead, platform: 'instagram' | 'whatsapp'): Promise<GeneratedMessage> {
  await new Promise(resolve => setTimeout(resolve, 600));

  const niche = lead.niche.toLowerCase();
  const businessName = lead.businessName;

  const templates: Record<string, string[]> = {
    'clínica estética': [
      `Olá ${businessName}! 👋\n\nVi o trabalho incrível que vocês fazem e fiquei impressionado com a qualidade dos resultados.\n\nVocês já pensaram em ter um site profissional para mostrar esses resultados e captar mais clientes? Um portfólio online organizado aumenta muito a credibilidade.\n\nPosso mostrar como ficaria? 💜`,
      `Oi! Tudo bem? 🌟\n\nEstou analisando clínicas de estética em ${lead.city} e ${businessName} chamou minha atenção pela excelência.\n\nVi que vocês não têm site ainda. Com a concorrência crescendo, um site profissional seria um diferencial enorme para atrair mais pacientes.\n\nQue tal uma conversa rápida sobre isso?`
    ],
    'fotógrafo': [
      `E aí, ${businessName}! 📸\n\nCurti muito seu trabalho fotográfico! Tem um olhar muito profissional.\n\nTe pergunto: seus clientes conseguem ver seu portfólio de forma fácil? Um site otimizado faz toda diferença na hora de fechar contratos mais altos.\n\nBora conversar sobre um portfólio online que converta visitantes em clientes?`,
      `Olá! Tudo certo? 🎨\n\nAcompanho fotógrafos de ${lead.city} e seu trabalho em ${businessName} realmente se destaca pela qualidade.\n\nPercebi que você poderia ter mais visibilidade com um site próprio. Imagina um portfólio que carregue rápido e tenha botão direto pro WhatsApp?\n\nTopo conversar?`
    ],
    'dentista': [
      `Dra./Dr., tudo bem? 🦷\n\nEstou ajudando dentistas de ${lead.city} a terem mais pacientes através da presença digital.\n\nPercebi que ${businessName} ainda não tem um site. Hoje em dia, 80% dos pacientes pesquisam online antes de agendar.\n\nUm site profissional transmitiria toda a credibilidade que seu trabalho merece. Posso mostrar como ficaria?`,
      `Olá! 👋\n\nSou especialista em sites para consultórios odontológicos. Vi que ${businessName} tem um excelente posicionamento, mas está perdendo pacientes por não estar bem posicionado digitalmente.\n\nUm site com agendamento online e blog educativo pode trazer 3x mais consultas.\n\nTopa ouvir uma proposta sem compromisso?`
    ],
    'restaurante': [
      `Olá ${businessName}! 🍽️\n\nSou fã da culinária de vocês! Mas percebi que muitos clientes têm dificuldade para ver o cardápio ou fazer pedidos.\n\nQue tal um cardápio digital profissional? Dá pra incluir fotos dos pratos, aceitar pedidos online sem pagar comissão pro iFood, e integrar com WhatsApp.\n\nQuer ver como funciona?`,
      `E aí, tudo bem? 🍕\n\nTrabalho com sites para restaurantes e vi que ${businessName} tem potencial enorme mas depende só das redes sociais.\n\nUm cardápio digital próprio pode aumentar seu ticket médio e reduzir custos com aplicativos.\n\nPosso mostrar uma demonstração personalizada?`
    ],
    'default': [
      `Olá ${businessName}! 👋\n\nEstou ajudando empresas de ${lead.city} a crescerem com sites profissionais.\n\nPercebi que vocês ainda não têm presença digital forte. No mercado atual, isso é essencial para não perder clientes para a concorrência.\n\nPosso mostrar como um site moderno e otimizado poderia impulsionar ${businessName}?\n\nQue tal uma conversa sem compromisso?`,
      `Oi! Tudo bem? 🚀\n\nSou desenvolvedor de sites e vi que ${businessName} tem um diferencial no setor de ${lead.niche}.\n\nUm site profissional ajudaria vocês a mostrarem esse valor para mais clientes e fechar mais negócios.\n\nPosso enviar uma proposta personalizada? Respondendo aqui mesmo!`
    ]
  };

  const messages = Object.entries(templates).find(([key]) => niche.includes(key))?.[1] || templates.default;
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

  const finalMessage = platform === 'whatsapp'
    ? selectedMessage
    : selectedMessage.replace(/\n\n/g, '\n').substring(0, 2200);

  return {
    platform,
    message: finalMessage,
    generatedAt: new Date().toISOString()
  };
}

export function getQualityColor(quality: AIAnalysis['leadQuality']): string {
  switch (quality) {
    case 'excelente': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'bom': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'medio': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'baixo': return 'text-rose-600 bg-rose-50 border-rose-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getQualityLabel(quality: AIAnalysis['leadQuality']): string {
  const labels: Record<string, string> = {
    'excelente': '⭐ Excelente',
    'bom': '✓ Bom',
    'medio': '◐ Médio',
    'baixo': '✕ Baixo'
  };
  return labels[quality] || quality;
}
