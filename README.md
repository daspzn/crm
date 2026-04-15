# ClientOps CRM

Um CRM moderno e responsivo para gerenciamento de leads com autenticação Supabase, desenvolvido com Next.js, React, TypeScript e Tailwind CSS.

## Funcionalidades

### Autenticação
- Login e cadastro com email/senha via Supabase Auth
- Sessão persistente (mantém login entre sessões)
- Proteção de rotas (apenas usuários logados podem acessar)
- Logout com confirmação

### Dashboard
- Visão geral em tempo real de métricas importantes
- Total de leads, taxa de conversão, faturamento previsto e saldo recebido
- Distribuição visual por status (gráficos de barras)
- Lista dos leads mais recentes

### Gestão de Leads
- Cadastro completo de leads (negócio, nicho, cidade, contato, valor, status, observações)
- Filtros por status e busca por texto
- Atualização rápida de status
- Marcação de pagamentos
- Exclusão de leads
- **Integração com IA**:
  - Análise automática de leads
  - Geração de mensagens personalizadas

### Financeiro
- Controle completo de receitas
- Visualização de faturamento total, recebido, pendente e taxa de recebimento
- Lista separada de pagamentos pendentes, parciais e recebidos
- Marcação rápida de pagamentos
- Exportação para CSV

### Busca de Leads
- Integração com Google Places API
- Busca por nicho e cidade
- Adição em massa de leads encontrados

## Configuração do Supabase

### 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project" e configure:
   - Nome do projeto: `clientops-crm`
   - Database Password: (gerar senha segura)
   - Region: (escolha a mais próxima de você)
3. Aguarde a criação do projeto (leva alguns minutos)

### 2. Configurar as variáveis de ambiente

No painel do Supabase, vá em **Project Settings** > **API**:

Copie estes valores:
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Onde colocar as chaves

**IMPORTANTE: Nunca comite suas chaves no Git!**

**Opção 1: Desenvolvimento local**

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
GOOGLE_PLACES_API_KEY=sua-chave-google-places
```

**Opção 2: Deploy na Vercel**

1. No dashboard da Vercel, vá em **Settings** > **Environment Variables**
2. Adicione as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon
   - `GOOGLE_PLACES_API_KEY` = sua chave da API Google Places (opcional)

### 4. Criar as tabelas no Supabase

No SQL Editor do Supabase, execute o arquivo `supabase/schema.sql`:

```sql
-- Copie e cole o conteúdo de supabase/schema.sql no SQL Editor
```

Ou execute este SQL:

```sql
-- Enable Row Level Security
alter table if exists public.leads enable row level security;

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id bigint generated always as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users on delete cascade not null,
    business_name text not null,
    niche text not null,
    city text not null,
    contact text,
    project_value numeric default 0,
    amount_received numeric default 0,
    lead_status text default 'novo' not null,
    payment_status text default 'pendente' not null,
    notes text,
    ai_analysis jsonb,
    generated_message jsonb
);

-- Row Level Security Policies
CREATE POLICY "Users can only view their own leads"
    ON public.leads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own leads"
    ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own leads"
    ON public.leads FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own leads"
    ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_lead_status ON public.leads(lead_status);
CREATE INDEX idx_leads_payment_status ON public.leads(payment_status);
```

### 5. Configurar autenticação por email

Em **Authentication** > **Providers** > **Email**:
- Deixe `Enable Email provider` ativado
- Opcional: Desative `Confirm email` se não quiser confirmação por email
- Configure templates de email se desejar personalizar

## Deploy na Vercel

### Opção 1: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Opção 2: Deploy via GitHub (Recomendado)

1. Push o código para um repositório GitHub
2. Na Vercel, clique em "Add New..." > "Project"
3. Importe o repositório GitHub
4. Configure as variáveis de ambiente (como descrito acima)
5. Clique em "Deploy"

## Estrutura do Projeto

```
client-ops-dashboard/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # Proteção de rotas
│   ├── layout/
│   │   └── Sidebar.tsx           # Navegação lateral
│   ├── ui/                       # Componentes de UI
│   └── views/                    # Views principais
├── contexts/
│   └── AuthContext.tsx           # Contexto de autenticação
├── hooks/
│   └── useLeads.ts               # Hook para gerenciar leads
├── lib/
│   ├── supabase.ts               # Configuração do Supabase
│   └── utils.ts                  # Utilitários
├── pages/
│   ├── login.tsx                 # Página de login
│   ├── signup.tsx                # Página de cadastro
│   ├── index.tsx                 # Página principal
│   └── api/                      # API routes
├── supabase/
│   └── schema.sql                # Schema do banco
├── types/
│   └── index.ts                  # Tipos TypeScript
├── .env.local.example            # Exemplo de variáveis
├── vercel.json                   # Configuração do Vercel
└── README.md
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas chaves do Supabase

# Rodar servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

## Google Places API (Opcional)

Para a funcionalidade de busca de leads:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e habilite a **Places API**
3. Gere uma API Key em **Credentials** > **Create Credentials** > **API Key**
4. Adicione a chave em `GOOGLE_PLACES_API_KEY` no `.env.local` e nas variáveis da Vercel

## Segurança

- **Row Level Security (RLS)**: Cada usuário só vê seus próprios leads
- **Autenticação JWT**: Tokens gerenciados pelo Supabase Auth
- **Session persistente**: Login mantido entre sessões via cookies seguros
- **Dados isolados**: Leads são filtrados por `user_id` em todas as queries
- **Environment Variables**: Chaves nunca expostas no código

## Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento com hot reload
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção (requer build prévio)

## Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Supabase** - Backend (Auth + Database)
- **Lucide React** - Ícones modernos
- **class-variance-authority** - Variantes de componentes
- **clsx + tailwind-merge** - Utilitários para classes CSS

## Guia de Uso

### Criar uma conta
1. Acesse `/signup`
2. Preencha email e senha (mínimo 6 caracteres)
3. Confirme seu email (se habilitado)
4. Faça login em `/login`

### Adicionar um Novo Lead
1. Navegue para a seção "Leads"
2. Clique no botão "Novo Lead"
3. Preencha os campos obrigatórios (negócio, nicho, cidade)
4. Clique em "Adicionar Lead"

### Atualizar Status
1. Na lista de leads, use o dropdown de status
2. Selecione o novo status (novo, contatado, proposta, negociando, fechado)

### Marcar como Pago
1. Vá para a seção "Leads" ou "Financeiro"
2. Clique no botão "Marcar pago" ou "Pago"
3. O valor será automaticamente somado ao saldo recebido

### Exportar Dados Financeiros
1. Vá para a seção "Financeiro"
2. Clique em "Exportar CSV"
3. O arquivo será baixado automaticamente

## Licença

MIT - Sinta-se livre para usar e modificar!
