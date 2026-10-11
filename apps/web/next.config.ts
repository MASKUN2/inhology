import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 컨테이너 배포용 최소 standalone 서버 출력
  output: "standalone",

  // Categories became tags and series became collections; keep their old addresses
  // working. The two category slugs that differ from their tag's slug are mapped
  // explicitly.
  async redirects() {
    return [
      { source: "/categories/dev", destination: "/tags/development", permanent: true },
      { source: "/categories/life", destination: "/tags/daily", permanent: true },
      { source: "/categories/:slug", destination: "/tags/:slug", permanent: true },
      { source: "/series", destination: "/", permanent: true },
      { source: "/series/:slug", destination: "/collections/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
