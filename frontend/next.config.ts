import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "export",
    allowedDevOrigins: ["wails.localhost"],
    eslint:{
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
