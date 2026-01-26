import { Type, Static } from '@sinclair/typebox'

// Common validation schemas
// Schemas will be added in subsequent stories

// API Response schemas
export const ApiErrorSchema = Type.Object({
  error: Type.String({ description: 'Error code for machine processing' }),
  message: Type.String({ description: 'Human-readable error message' }),
  details: Type.Optional(Type.Unknown({ description: 'Additional error details' })),
})

export const PaginationSchema = Type.Object({
  page: Type.Number({ minimum: 1, default: 1 }),
  limit: Type.Number({ minimum: 1, maximum: 100, default: 20 }),
  total: Type.Number({ minimum: 0 }),
})

// Type exports
export type ApiError = Static<typeof ApiErrorSchema>
export type Pagination = Static<typeof PaginationSchema>
