// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs')

function getSupabaseHostname() {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'https://zddrhpffvxmmutgegofm.supabase.co',
    ).hostname
  } catch {
    return 'zddrhpffvxmmutgegofm.supabase.co'
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: getSupabaseHostname(),
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: 'jihostudy',
  project: 'wedding-invitation',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
