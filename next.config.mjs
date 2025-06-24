/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'd198g8637lsfvs.cloudfront.net',
      'd1332u4stxguh3.cloudfront.net',
      'd2ntslqmfg7dws.cloudfront.net',
    ],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/video/:path*',
        destination: 'https://d1332u4stxguh3.cloudfront.net/:path*', // Proxy to CloudFront
      },
      {
        source: '/interactivevideo/:path*',
        destination: 'https://d1332u4stxguh3.cloudfront.net/:path*',
      },
      {
        source: '/audio/:path*',
        destination: 'https://d1332u4stxguh3.cloudfront.net/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/app/:path*',
        headers: [
          {
            key: 'Keep-Alive',
            value: 'timeout=900, max=1000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
