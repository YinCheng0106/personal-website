/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    {
      source: "/projects/yinla-bot-website",
      destination: "/projects/yinla-bot",
      permanent: true,
    },
    {
      source: "/projects/yinla-bot-website/og",
      destination: "/projects/yinla-bot/og",
      permanent: true,
    },
  ],
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ]
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  output: "standalone",
  // Literal allowlisted content only; needed by SSR readers and gated links.
  outputFileTracingIncludes: {
    "/projects/*": ["./src/contents/case-studies/quotamew.mdx"],
    "/projects/*/case-study": ["./src/contents/case-studies/quotamew.mdx"],
    "/sitemap.xml": ["./src/contents/case-studies/quotamew.mdx"],
  },
  serverExternalPackages: ["@takumi-rs/core"], 
};

export default nextConfig;
