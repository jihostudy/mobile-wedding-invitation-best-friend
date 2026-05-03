import * as Sentry from '@sentry/nextjs'
import { sharedSentryConfig } from '@/lib/sentry-config'

Sentry.init(sharedSentryConfig)
