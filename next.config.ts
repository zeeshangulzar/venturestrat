import type { NextConfig } from "next";

const bucket = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION;

const extraHosts = bucket
  ? [
      `${bucket}.s3.amazonaws.com`,
      ...(region ? [`${bucket}.s3.${region}.amazonaws.com`] : []),
    ]
  : [];

const presetHosts = [
  "d1qb2nb5cznatu.cloudfront.net",
  "d18zd1fdi56ai5.cloudfront.net",
  "res.cloudinary.com",
  "res-1.cloudinary.com",
  "res-2.cloudinary.com",
  "res-3.cloudinary.com",
  "res-4.cloudinary.com",
  "res-5.cloudinary.com",
  "venturestrat-staging.s3.us-east-1.amazonaws.com",
  "img.clerk.com",
];

// ---------------------------------------------------------------------------
// Load CSP domains from ENV
// ---------------------------------------------------------------------------
const FRONTEND_DOMAINS = (process.env.NEXT_PUBLIC_CSP_FRONTEND_DOMAINS || "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const CLERK_DOMAINS = (process.env.NEXT_PUBLIC_CSP_CLERK_DOMAINS || "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const BACKEND_DOMAINS = (process.env.NEXT_PUBLIC_CSP_BACKEND_DOMAINS || "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const noStoreHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0, private" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const imageHosts = Array.from(new Set([...presetHosts, ...extraHosts]));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },

  async headers() {
    const FRONTEND_SRC = FRONTEND_DOMAINS.join(" ");
    const CLERK_SRC = CLERK_DOMAINS.join(" ");
    const BACKEND_SRC = BACKEND_DOMAINS.join(" ");
    const IMG_CONNECT_SRC = imageHosts.map((h) => `https://${h}`).join(" ");

    // ⭐ Build img-src list dynamically (fixing “images not loading” issue)
    const IMG_SRC = imageHosts
      .map((h) => `https://${h}`)
      .join(" ");

    const ContentSecurityPolicy = `
      default-src 'self' ${FRONTEND_SRC};

      script-src 'self' 'unsafe-inline' 'unsafe-eval'
        ${FRONTEND_SRC}
        ${CLERK_SRC};

      worker-src 'self' blob:;
      connect-src 'self'
        ${FRONTEND_SRC}
        ${CLERK_SRC}
        ${BACKEND_SRC}
        ${IMG_CONNECT_SRC};

      img-src 'self' data: blob: ${IMG_SRC};
      
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      
      font-src 'self' data: https://fonts.gstatic.com;
    `.replace(/\s{2,}/g, " ").trim();

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Access-Control-Allow-Origin", value: "https://www.venturestrat.ai" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), fullscreen=(self)" },
        ],
      },
      {
        source: "/(sign-in|sign-up|forgot-password)(.*)",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
