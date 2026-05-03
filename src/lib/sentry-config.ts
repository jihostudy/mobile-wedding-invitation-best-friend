import type { BrowserOptions, NodeOptions } from '@sentry/nextjs'

type SharedOptions = Pick<
  NodeOptions & BrowserOptions,
  'dsn' | 'environment' | 'enabled' | 'tracesSampleRate' | 'sendDefaultPii' | 'ignoreErrors'
>

export const sharedSentryConfig: SharedOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0,
  sendDefaultPii: false,
  ignoreErrors: [
    'Non-Error promise rejection captured',
    /^AbortError/,
  ],
}
