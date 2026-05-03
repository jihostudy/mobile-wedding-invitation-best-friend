import * as Sentry from '@sentry/nextjs'

type SupabaseErrorContext = {
  operation: string
  table?: string
  extra?: Record<string, unknown>
}

export function captureSupabaseError(
  error: unknown,
  context: SupabaseErrorContext
) {
  if (!error) return

  Sentry.captureException(error, {
    tags: {
      source: 'supabase',
      operation: context.operation,
      ...(context.table ? { table: context.table } : {}),
    },
    extra: context.extra,
  })
}
