/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_HEALTHLAKE_DATASTORE_ID: process.env.AWS_HEALTHLAKE_DATASTORE_ID,
    AWS_HEALTHLAKE_ROLE_ARN: process.env.AWS_HEALTHLAKE_ROLE_ARN,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_KMS_KEY_ID: process.env.AWS_KMS_KEY_ID,
  },
}

module.exports = nextConfig