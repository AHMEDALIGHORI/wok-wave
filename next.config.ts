import type { NextConfig } from 'next';
const config: NextConfig = {
  async headers() {
    return [{source:'/frames/:path*',headers:[{key:'Cache-Control',value:'public, max-age=86400, stale-while-revalidate=604800'}]}];
  },
};
export default config;
