import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 컨테이너 배포용 최소 standalone 서버 출력
  output: "standalone",

  // Categories, series and collections all became tags; keep their old
  // addresses working. Slugs that no longer match a tag are mapped explicitly.
  async redirects() {
    return [
      { source: "/categories/dev", destination: "/posts", permanent: true },
      { source: "/categories/life", destination: "/tags/daily", permanent: true },
      { source: "/categories/:slug", destination: "/tags/:slug", permanent: true },
      { source: "/series", destination: "/", permanent: true },
      { source: "/series/:slug", destination: "/tags/:slug", permanent: true },
      { source: "/collections/all", destination: "/posts", permanent: true },
      { source: "/collections/tech-articles", destination: "/tags/tech-article", permanent: true },
      { source: "/collections/:slug", destination: "/tags/:slug", permanent: true },
      { source: "/tags/development", destination: "/posts", permanent: true },
    ];
  },
};

export default nextConfig;
