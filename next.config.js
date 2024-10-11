/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_HEALTHLAKE_DATASTORE_ID: process.env.AWS_HEALTHLAKE_DATASTORE_ID,
    AWS_HEALTHLAKE_ENDPOINT: process.env.AWS_HEALTHLAKE_ENDPOINT,
  },
}

module.exports = nextConfig