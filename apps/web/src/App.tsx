import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './lib/auth'
import { SidebarProvider } from './components/Sidebar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
import { DashboardLayout } from './components/DashboardLayout'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, AcceptInvitationPage } from './features/auth'
import { DashboardPage } from './features/dashboard'
import { TeamPage } from './features/team'
import { CampaignsPage } from './features/campaigns/CampaignsPage'
import { CampaignSettingsPage } from './features/campaigns/CampaignSettingsPage'
import { CampaignDashboardPage } from './features/campaigns/CampaignDashboardPage'
import { QuestionnaireLandingPage } from './features/questionnaire/QuestionnaireLandingPage'
import { QuestionnairePage } from './features/questionnaire/QuestionnairePage'
import { QuestionnaireResultsPage } from './features/questionnaire/QuestionnaireResultsPage'
import { PublicProfilePage } from './features/questionnaire/PublicProfilePage'
import { DeleteConfirmPage } from './features/questionnaire/DeleteConfirmPage'
import { OrganizationSettingsPage, DeleteAccountConfirmPage } from './features/settings'
import { TeamCampaignsPage } from './features/teams/TeamCampaignsPage'
import { TeamDashboardPage } from './features/teams/TeamDashboardPage'
import { AnalyticsPage } from './features/analytics/AnalyticsPage'
import { BillingPage } from './features/billing'
import { LandingPage } from './pages/LandingPage'

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LandingPage />
}

// Protected layout that wraps DashboardLayout with auth check
function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/invitation"
        element={
          <PublicRoute>
            <AcceptInvitationPage />
          </PublicRoute>
        }
      />

      {/* Protected routes with shared DashboardLayout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignSettingsPage />} />
        <Route path="/campaigns/:id/dashboard" element={<CampaignDashboardPage />} />
        <Route path="/settings" element={<OrganizationSettingsPage />} />
        <Route path="/teams" element={<TeamCampaignsPage />} />
        <Route path="/teams/:id" element={<TeamDashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/billing" element={<BillingPage />} />
      </Route>

      {/* Public questionnaire routes */}
      <Route path="/q/:slug" element={<QuestionnaireLandingPage />} />
      <Route path="/q/:slug/questions" element={<QuestionnairePage />} />
      <Route path="/q/:slug/results/:respondentId" element={<QuestionnaireResultsPage />} />
      {/* Public profile share page */}
      <Route path="/profile/:respondentId" element={<PublicProfilePage />} />
      {/* RGPD delete confirmation */}
      <Route path="/delete-confirm" element={<DeleteConfirmPage />} />
      {/* Account deletion confirmation */}
      <Route path="/delete-account-confirm" element={<DeleteAccountConfirmPage />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <AppRoutes />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
