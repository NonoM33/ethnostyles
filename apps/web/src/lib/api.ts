import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('session_token')
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

// Dashboard
export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => fetchAPI<{
      campaigns: Array<{
        id: string
        name: string
        status: 'draft' | 'active' | 'archived'
        slug: string
        createdAt: string
        stats: {
          total: number
          completed: number
          inProgress: number
          completionRate: number
        }
      }>
      totals: {
        totalResponses: number
        completedResponses: number
        activeCampaigns: number
      }
    }>('/dashboard/overview'),
  })
}

// Campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => fetchAPI<{
      campaigns: Array<{
        id: string
        name: string
        description: string | null
        status: 'draft' | 'active' | 'archived'
        slug: string
        logoUrl: string | null
        primaryColor: string | null
        createdAt: string
        updatedAt: string
      }>
    }>('/campaigns'),
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => fetchAPI<{
      id: string
      name: string
      description: string | null
      status: 'draft' | 'active' | 'archived'
      slug: string
      logoUrl: string | null
      primaryColor: string | null
      webhookUrl: string | null
      webhookSecret: string | null
      createdAt: string
      updatedAt: string
    }>(`/campaigns/${id}`),
    enabled: !!id,
  })
}

export function useCampaignStats(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id, 'stats'],
    queryFn: () => fetchAPI<{
      campaign: { id: string; name: string; status: string }
      stats: {
        total: number
        completed: number
        inProgress: number
        abandoned: number
        completionRate: number
        abandonmentRate: number
      }
      profileDistribution: Array<{
        mythe: string | null
        count: number
        percentage: number
        benchmark?: number
      }>
      benchmark?: Record<string, number>
    }>(`/campaigns/${id}/stats`),
    enabled: !!id,
  })
}

// Dashboard Campaign Stats (with filters)
export function useDashboardCampaignStats(
  id: string | undefined,
  options?: { startDate?: string; endDate?: string; includeBenchmark?: boolean }
) {
  const params = new URLSearchParams()
  if (options?.startDate) params.append('startDate', options.startDate)
  if (options?.endDate) params.append('endDate', options.endDate)
  if (options?.includeBenchmark) params.append('includeBenchmark', 'true')
  const queryString = params.toString()

  return useQuery({
    queryKey: ['dashboard', 'campaigns', id, 'stats', options],
    queryFn: () => fetchAPI<{
      campaign: { id: string; name: string; status: string; slug: string }
      stats: {
        total: number
        completed: number
        inProgress: number
        abandoned: number
        completionRate: number
        abandonmentRate: number
      }
      profileDistribution: Array<{
        mythe: string | null
        count: number
        percentage: number
        benchmark?: number
      }>
      benchmark?: Record<string, number>
    }>(`/dashboard/campaigns/${id}/stats${queryString ? `?${queryString}` : ''}`),
    enabled: !!id,
  })
}

export function useCampaignResponses(id: string | undefined, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'campaigns', id, 'responses', page, limit],
    queryFn: () => fetchAPI<{
      responses: Array<{
        id: string
        email: string
        status: string
        primaryMythe: string | null
        currentQuestion: number
        totalQuestions: number
        progress: number
        startedAt: string
        completedAt: string | null
      }>
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(`/dashboard/campaigns/${id}/responses?page=${page}&limit=${limit}`),
    enabled: !!id,
  })
}

// Team
export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => fetchAPI<{
      members: Array<{
        id: string
        email: string
        name: string | null
        role: 'admin' | 'viewer'
        isActive: boolean
        createdAt: string
      }>
      pendingInvitations: Array<{
        id: string
        email: string
        createdAt: string
        expiresAt: string
      }>
    }>('/team'),
  })
}

// Team Campaigns (Epic 10)
export function useTeamCampaigns() {
  return useQuery({
    queryKey: ['team-campaigns'],
    queryFn: () => fetchAPI<{
      campaigns: Array<{
        id: string
        name: string
        teamName: string | null
        department: string | null
        status: 'draft' | 'active' | 'archived'
        slug: string
        stats: {
          responses: number
          completed: number
          invitations: number
          pendingInvitations: number
        }
        createdAt: string
      }>
    }>('/teams/campaigns'),
  })
}

export function useTeamComposition(id: string | undefined) {
  return useQuery({
    queryKey: ['team-campaigns', id, 'composition'],
    queryFn: () => fetchAPI<{
      campaign: {
        id: string
        name: string
        teamName: string | null
        department: string | null
      }
      composition: {
        total: number
        distribution: Record<string, number>
        percentages: Record<string, number>
      }
      members: Array<{
        id: string
        email: string
        primaryMythe: string | null
        completedAt: string
      }>
      dynamics: {
        similarGroups: Array<{ mythe: string; members: Array<{ id: string; email: string }> }>
        complementaryFound: Array<{ pair: [string, string]; members: Array<{ mythe: string; id: string; email: string }> }>
      }
    }>(`/teams/campaigns/${id}/composition`),
    enabled: !!id,
  })
}

export function useTeamRecommendations(id: string | undefined) {
  return useQuery({
    queryKey: ['team-campaigns', id, 'recommendations'],
    queryFn: () => fetchAPI<{
      campaign: {
        id: string
        name: string
        teamName: string | null
      }
      teamSize: number
      mythesPresent: number
      recommendations: Array<{
        mythe: string
        count: number
        percentage: number
        tips: string[]
        communication: string
        strengths: string
        watchFor: string
      }>
      potentialConflicts: string[]
      generalTips: string[]
    }>(`/teams/campaigns/${id}/recommendations`),
    enabled: !!id,
  })
}

// Analytics (Epic 11)
export function useCultureMap() {
  return useQuery({
    queryKey: ['analytics', 'culture-map'],
    queryFn: () => fetchAPI<{
      globalComposition: {
        total: number
        distribution: Record<string, number>
        percentages: Record<string, number>
      }
      departmentBreakdown: Array<{
        department: string
        composition: {
          total: number
          percentages: Record<string, number>
        }
      }>
      benchmark: Record<string, number>
    }>('/analytics/culture-map'),
  })
}

export function useCultureGap() {
  return useQuery({
    queryKey: ['analytics', 'culture-gap'],
    queryFn: () => fetchAPI<{
      hasTarget: boolean
      targetCulture?: {
        id: string
        name: string
        description?: string
      }
      currentComposition?: {
        percentages: Record<string, number>
      }
      targetComposition?: Record<string, number>
      gaps?: Array<{
        mythe: string
        current: number
        target: number
        gap: number
        priority: 'high' | 'medium' | 'low'
      }>
      recommendations?: string[]
      message?: string
    }>('/analytics/culture-gap'),
  })
}

export function useCultureTrends(months = 12) {
  return useQuery({
    queryKey: ['analytics', 'trends', months],
    queryFn: () => fetchAPI<{
      trends: Array<{
        month: string
        total: number
        distribution: Record<string, number>
        percentages: Record<string, number>
      }>
      summary?: {
        totalResponses: number
        months: number
      }
      significantChanges?: string[]
      benchmark?: Record<string, number>
    }>(`/analytics/trends?months=${months}`),
  })
}

export function useCreateTargetCulture() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      explorateurTarget: number
      gardienTarget: number
      createurTarget: number
      sageTarget: number
      herosTarget: number
      rebelleTarget: number
      magicienTarget: number
      innocentTarget: number
    }) =>
      fetchAPI('/analytics/target-culture', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

// Organization Settings
export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: () => fetchAPI<{
      organization: {
        id: string
        name: string
        slug: string
        description: string | null
        logoUrl: string | null
        domain: string | null
        primaryColor: string | null
        createdAt: string
      }
    }>('/organization'),
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name?: string
      description?: string | null
      domain?: string | null
      logoUrl?: string | null
      primaryColor?: string
    }) =>
      fetchAPI<{
        organization: {
          id: string
          name: string
          slug: string
          description: string | null
          logoUrl: string | null
          domain: string | null
          primaryColor: string | null
          createdAt: string
        }
      }>('/organization', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}

export function useRequestOrganizationExport() {
  return useMutation({
    mutationFn: () =>
      fetchAPI<{ message: string }>('/organization/export-request', { method: 'POST' }),
  })
}

export function useRequestOrganizationDelete() {
  return useMutation({
    mutationFn: () =>
      fetchAPI<{ message: string }>('/organization/delete-request', { method: 'POST' }),
  })
}

// Mutations
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      fetchAPI('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useActivateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/campaigns/${id}/activate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useArchiveCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/campaigns/${id}/archive`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDuplicateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/campaigns/${id}/duplicate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      name?: string
      description?: string
      primaryColor?: string
      logoUrl?: string | null
      webhookUrl?: string
      webhookSecret?: string
    }}) =>
      fetchAPI<{ campaign: {
        id: string
        name: string
        description: string | null
        status: 'draft' | 'active' | 'archived'
        slug: string
        logoUrl: string | null
        primaryColor: string | null
        webhookUrl: string | null
        webhookSecret: string | null
        createdAt: string
        updatedAt: string
      }}>(`/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] })
    },
  })
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<{ success: boolean; message?: string }>(`/campaigns/${id}/test-webhook`, { method: 'POST' }),
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) =>
      fetchAPI('/team/invite', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

export function useCancelInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/team/invite/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

export function useRevokeMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/team/members/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

export function useReactivateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`/team/members/${id}/reactivate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

// Team Campaigns Mutations
export function useCreateTeamCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; teamName: string; department?: string; emails?: string[] }) =>
      fetchAPI<{ campaign: { id: string } }>('/teams/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-campaigns'] })
    },
  })
}

// Billing & Subscription
export interface Subscription {
  id: string
  planId: 'free' | 'pro' | 'enterprise'
  planName: string
  status: 'active' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  seats: {
    included: number
    used: number
    extra: number
  }
  pricePerSeat: number
  basePrice: number
}

export interface Invoice {
  id: string
  number: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  amount: number
  currency: string
  periodStart: string
  periodEnd: string
  paidAt: string | null
  invoicePdf: string | null
  hostedInvoiceUrl: string | null
  createdAt: string
}

export interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault: boolean
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => fetchAPI<{
      subscription: Subscription | null
      usage: {
        campaigns: { used: number; limit: number | null }
        responses: { used: number; limit: number | null }
        teamMembers: { used: number; limit: number | null }
      }
    }>('/billing/subscription'),
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => fetchAPI<{
      invoices: Invoice[]
    }>('/billing/invoices'),
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['billing', 'payment-methods'],
    queryFn: () => fetchAPI<{
      paymentMethods: PaymentMethod[]
    }>('/billing/payment-methods'),
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (data: { planId: string; seats?: number }) =>
      fetchAPI<{ url: string }>('/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () =>
      fetchAPI<{ url: string }>('/billing/create-portal-session', {
        method: 'POST',
      }),
  })
}

export function usePreviewSeats() {
  return useMutation({
    mutationFn: (seats: number) =>
      fetchAPI<{
        currentSeats: number
        newSeats: number
        seatsChange: number
        prorationAmount: number
        prorationAmountFormatted: string
        monthlyChange: number
        monthlyChangeFormatted: string
        immediateCharge: boolean
        daysRemaining?: number
      }>('/billing/preview-seats', {
        method: 'POST',
        body: JSON.stringify({ seats }),
      }),
  })
}

export function useUpdateSeats() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (seats: number) =>
      fetchAPI<{ success: boolean; message: string }>('/billing/update-seats', {
        method: 'POST',
        body: JSON.stringify({ seats }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cancelAtPeriodEnd: boolean = true) =>
      fetchAPI<{ subscription: Subscription }>('/billing/cancel', {
        method: 'POST',
        body: JSON.stringify({ cancelAtPeriodEnd }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchAPI<{ subscription: Subscription }>('/billing/reactivate', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })
}

export function useSyncSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchAPI<{ subscription: Subscription | null }>('/billing/sync', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] })
    },
  })
}

// API Keys & Usage
export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface ApiUsage {
  credits: {
    balance: number
    weeklyUsed: number
    weeklyLimit: number
    weeklyRemaining: number
    totalPurchased: number
    totalUsed: number
    weekResetsAt: number
  }
  apiEnabled: boolean
  recentCallsCount: number
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => fetchAPI<{
      keys: ApiKey[]
    }>('/api-keys'),
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; expiresAt?: string }) =>
      fetchAPI<{
        success: boolean
        key: string
        apiKey: ApiKey
        warning: string
      }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<{ success: boolean; message: string }>(`/api-keys/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}

export function useApiUsage() {
  return useQuery({
    queryKey: ['api-usage'],
    queryFn: () => fetchAPI<ApiUsage>('/billing/api-usage'),
  })
}
