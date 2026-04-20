/** @type {import('next').NextConfig} */
const nextConfig = {
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
  serverExternalPackages: ["@takumi-rs/core"], 
};

export default nextConfig;