/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FEISHU_WEBHOOK_URL: process.env.FEISHU_WEBHOOK_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

module.exports = nextConfig 