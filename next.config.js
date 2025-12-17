/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // 静的エクスポートを有効化
    images: {
      unoptimized: true,  // 画像最適化を無効化（Cloudflare Pagesでは必要）
    },
  }
  
  module.exports = nextConfig
