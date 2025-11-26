/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,   // ← QUAN TRỌNG: KHÔNG ĐỂ NEXT.JS TỐI ƯU ẢNH TỪ CLOUDINARY
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
