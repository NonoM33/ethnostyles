// Common types shared between frontend and backend
// Types will be added in subsequent stories

// User roles
export type UserRole = 'admin' | 'viewer'

// Campaign status
export type CampaignStatus = 'draft' | 'active' | 'archived'

// Response status
export type ResponseStatus = 'partial' | 'complete'

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}
