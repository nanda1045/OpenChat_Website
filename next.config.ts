import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in the
  // parent directory was causing Next to infer the wrong root (build warning).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
