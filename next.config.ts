import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	experimental: {
		typedEnv: true,
	},
	 images: {
        formats: ['image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 64, 96, 128, 256],
        minimumCacheTTL: 300,
    },
};

export default nextConfig;
