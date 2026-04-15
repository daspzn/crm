-- Supabase Database Schema for ClientOps CRM
-- Run this in the Supabase SQL Editor

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

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    key text not null,
    value text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, key)
);

-- Row Level Security Policies

-- Leads: Users can only see their own leads
CREATE POLICY "Users can only view their own leads"
    ON public.leads
    FOR SELECT
    USING (auth.uid() = user_id);

-- Leads: Users can only insert their own leads
CREATE POLICY "Users can only insert their own leads"
    ON public.leads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Leads: Users can only update their own leads
CREATE POLICY "Users can only update their own leads"
    ON public.leads
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Leads: Users can only delete their own leads
CREATE POLICY "Users can only delete their own leads"
    ON public.leads
    FOR DELETE
    USING (auth.uid() = user_id);

-- User Preferences: Users can only see their own preferences
CREATE POLICY "Users can only view their own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- User Preferences: Users can only insert their own preferences
CREATE POLICY "Users can only insert their own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Preferences: Users can only update their own preferences
CREATE POLICY "Users can only update their own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- User Preferences: Users can only delete their own preferences
CREATE POLICY "Users can only delete their own preferences"
    ON public.user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_payment_status ON public.leads(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
