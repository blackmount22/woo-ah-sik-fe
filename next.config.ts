import type { NextConfig } from "next";

const nextConfig = {
  output: 'export', // 이 설정이 중요합니다!
  images: {
    unoptimized: true, // 정적 내보내기 시 이미지 최적화 비활성화 필수
  },
}

export default nextConfig;
