/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wtvjbyocbpiitjjqsoul.supabase.co'
      }
    ]
  }
}

module.exports = nextConfig
