import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Lead, LeadStatus, PaymentStatus, DashboardStats, AIAnalysis, GeneratedMessage } from '@/types'

export function useLeads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transform database record to app Lead
  const transformRecord = useCallback((item: any): Lead => ({
    id: item.id,
    createdAt: item.created_at,
    updatedAt: item.created_at,
    userId: item.user_id,
    businessName: item.business_name,
    niche: item.niche,
    city: item.city,
    contact: item.contact || '',
    projectValue: item.project_value || 0,
    amountReceived: item.amount_received || 0,
    remainingAmount: (item.project_value || 0) - (item.amount_received || 0),
    leadStatus: item.lead_status as LeadStatus,
    paymentStatus: item.payment_status as PaymentStatus,
    notes: item.notes || '',
    aiAnalysis: item.ai_analysis ? JSON.parse(item.ai_analysis) : null,
    generatedMessage: item.generated_message ? JSON.parse(item.generated_message) : null,
  }), [])

  // Fetch leads for current user
  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLeads([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching leads:', fetchError)
      setError(fetchError.message)
      setIsLoading(false)
      return
    }

    const transformedLeads: Lead[] = data?.map(transformRecord) || []
    setLeads(transformedLeads)
    setIsLoading(false)
  }, [user, transformRecord])

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!user) {
      setLeads([])
      setIsLoading(false)
      return
    }

    fetchLeads()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`leads:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime event:', payload.eventType, payload)
          // Immediate fetch on any change
          fetchLeads()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchLeads])

  const addLead = useCallback(async (
    lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount' | 'paymentStatus' | 'userId'>
  ): Promise<Lead | null> => {
    if (!user) return null

    const paymentStatus: PaymentStatus =
      lead.amountReceived >= lead.projectValue ? 'pago' :
      lead.amountReceived > 0 ? 'parcial' : 'pendente'

    const remainingAmount = lead.projectValue - lead.amountReceived

    // Optimistic update - add to state immediately
    const tempId = Date.now() // Temporary ID
    const optimisticLead: Lead = {
      ...lead,
      id: tempId,
      userId: user.id,
      remainingAmount,
      paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setLeads(prev => [optimisticLead, ...prev])

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          business_name: lead.businessName,
          niche: lead.niche,
          city: lead.city,
          contact: lead.contact,
          project_value: lead.projectValue,
          amount_received: lead.amountReceived,
          lead_status: lead.leadStatus,
          payment_status: paymentStatus,
          notes: lead.notes,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding lead:', error)
        // Revert optimistic update
        setLeads(prev => prev.filter(l => l.id !== tempId))
        throw error
      }

      // Replace optimistic lead with real one
      const realLead = transformRecord(data)
      setLeads(prev => prev.map(l => l.id === tempId ? realLead : l))

      return realLead
    } catch (err) {
      // Revert on error
      setLeads(prev => prev.filter(l => l.id !== tempId))
      throw err
    }
  }, [user, transformRecord])

  const updateLead = useCallback(async (id: number, updates: Partial<Lead>): Promise<void> => {
    if (!user) return

    // Store previous state for rollback
    const previousLeads = [...leads]

    // Optimistic update
    setLeads(prev => prev.map(lead => {
      if (lead.id !== id) return lead

      const newLead = { ...lead, ...updates }

      // Recalculate derived fields
      if (updates.projectValue !== undefined || updates.amountReceived !== undefined) {
        const projectValue = updates.projectValue !== undefined ? updates.projectValue : lead.projectValue
        const amountReceived = updates.amountReceived !== undefined ? updates.amountReceived : lead.amountReceived
        newLead.remainingAmount = projectValue - amountReceived
        newLead.paymentStatus =
          amountReceived >= projectValue ? 'pago' :
          amountReceived > 0 ? 'parcial' : 'pendente'
      }

      return newLead
    }))

    const dbUpdates: any = {}
    if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName
    if (updates.niche !== undefined) dbUpdates.niche = updates.niche
    if (updates.city !== undefined) dbUpdates.city = updates.city
    if (updates.contact !== undefined) dbUpdates.contact = updates.contact
    if (updates.projectValue !== undefined) dbUpdates.project_value = updates.projectValue
    if (updates.amountReceived !== undefined) dbUpdates.amount_received = updates.amountReceived
    if (updates.leadStatus !== undefined) dbUpdates.lead_status = updates.leadStatus
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    try {
      const { error } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating lead:', error)
        // Revert
        setLeads(previousLeads)
        throw error
      }
    } catch (err) {
      setLeads(previousLeads)
      throw err
    }
  }, [user, leads])

  const deleteLead = useCallback(async (id: number): Promise<void> => {
    if (!user) return

    // Store previous state for rollback
    const previousLeads = [...leads]

    // Optimistic update - remove immediately
    setLeads(prev => prev.filter(lead => lead.id !== id))

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting lead:', error)
        // Revert
        setLeads(previousLeads)
        throw error
      }
    } catch (err) {
      setLeads(previousLeads)
      throw err
    }
  }, [user, leads])

  const updatePayment = useCallback(async (id: number, amountReceived: number): Promise<void> => {
    if (!user) return

    const lead = leads.find(l => l.id === id)
    if (!lead) return

    const previousLeads = [...leads]

    const newAmountReceived = amountReceived
    const paymentStatus: PaymentStatus =
      newAmountReceived >= lead.projectValue ? 'pago' :
      newAmountReceived > 0 ? 'parcial' : 'pendente'
    const remainingAmount = lead.projectValue - newAmountReceived

    // Optimistic update
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, amountReceived: newAmountReceived, paymentStatus, remainingAmount } : l
    ))

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          amount_received: newAmountReceived,
          payment_status: paymentStatus,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating payment:', error)
        setLeads(previousLeads)
        throw error
      }
    } catch (err) {
      setLeads(previousLeads)
      throw err
    }
  }, [leads, user])

  const markAsPaid = useCallback(async (id: number): Promise<void> => {
    if (!user) return

    const lead = leads.find(l => l.id === id)
    if (!lead) return

    const previousLeads = [...leads]

    // Optimistic update
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, amountReceived: lead.projectValue, paymentStatus: 'pago' as PaymentStatus, remainingAmount: 0 } : l
    ))

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          amount_received: lead.projectValue,
          payment_status: 'pago',
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error marking as paid:', error)
        setLeads(previousLeads)
        throw error
      }
    } catch (err) {
      setLeads(previousLeads)
      throw err
    }
  }, [leads, user])

  const saveAIAnalysis = useCallback(async (id: number, analysis: AIAnalysis): Promise<void> => {
    if (!user) return

    const previousLeads = [...leads]

    // Optimistic update - add analysis immediately
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, aiAnalysis: analysis } : l
    ))

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ai_analysis: JSON.stringify(analysis),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error saving AI analysis:', error)
        setLeads(previousLeads)
        throw error
      }
    } catch (err) {
      setLeads(previousLeads)
      throw err
    }
  }, [user, leads])

  const saveGeneratedMessage = useCallback(async (id: number, message: GeneratedMessage): Promise<void> => {
    if (!user) return

    const previousLeads = [...leads]

    // Optimistic update - add message immediately
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, generatedMessage: message } : l
    ))

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          generated_message: JSON.stringify(message),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error saving generated message:', error)
        setLeads(previousLeads)
        throw error
      }
    } catch (err) {
      setLeads(previousLeads)
      throw err
    }
  }, [user, leads])

  // Stats calculations
  const stats: DashboardStats = useMemo(() => {
    const totalLeads = leads.length
    const closedDeals = leads.filter(l => l.leadStatus === 'fechado').length
    const expectedRevenue = leads.reduce((sum, l) => sum + l.projectValue, 0)
    const receivedRevenue = leads.reduce((sum, l) => sum + l.amountReceived, 0)
    const pendingRevenue = expectedRevenue - receivedRevenue
    const conversionRate = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0
    const paymentCompletionRate = expectedRevenue > 0 ? Math.round((receivedRevenue / expectedRevenue) * 100) : 0
    const averageTicket = closedDeals > 0 ? Math.round(expectedRevenue / closedDeals) : 0

    return {
      totalLeads,
      closedDeals,
      expectedRevenue,
      receivedRevenue,
      pendingRevenue,
      conversionRate,
      paymentCompletionRate,
      averageTicket,
    }
  }, [leads])

  // Filter functions
  const getLeadsByStatus = useCallback((status: LeadStatus) =>
    leads.filter(l => l.leadStatus === status),
    [leads]
  )

  const getLeadsByPaymentStatus = useCallback((paymentStatus: PaymentStatus) =>
    leads.filter(l => l.paymentStatus === paymentStatus),
    [leads]
  )

  const getPendingPayments = useCallback(() =>
    leads.filter(l => l.paymentStatus === 'pendente' || l.paymentStatus === 'parcial'),
    [leads]
  )

  const getPaidLeads = useCallback(() =>
    leads.filter(l => l.paymentStatus === 'pago'),
    [leads]
  )

  const getPartialPayments = useCallback(() =>
    leads.filter(l => l.paymentStatus === 'parcial'),
    [leads]
  )

  return {
    leads,
    stats,
    isLoading,
    error,
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
    refreshLeads: fetchLeads,
  }
}
