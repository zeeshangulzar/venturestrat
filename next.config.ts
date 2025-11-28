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
];

const imageHosts = Array.from(new Set([...presetHosts, ...extraHosts]));

const nextConfig: NextConfig = {
  images: {
    domains: imageHosts,
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
