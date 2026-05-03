import * as Sentry from '@sentry/nextjs'
import { sharedSentryConfig } from '@/lib/sentry-config'

Sentry.init({
  ...sharedSentryConfig,
  ignoreErrors: [
    ...(sharedSentryConfig.ignoreErrors ?? []),
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Network request failed',
    'Failed to fetch',
  ],
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
  ],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
