"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleAdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 초기화 에러 무시
    }
  }, []);

  return (
    <div className="w-full flex justify-center mt-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "100px" }}
        data-ad-client="ca-pub-6924139569926505"
        data-ad-slot="6498299319"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
