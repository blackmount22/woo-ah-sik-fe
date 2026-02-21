"use client";

import { useEffect, useRef } from "react";

export default function KakaoAdBanner() {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    adRef.current?.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center mt-10">
      <ins
        ref={adRef}
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit="DAN-IQQFyJ3CrWiZrrht"
        data-ad-width="300"
        data-ad-height="250"
      />
    </div>
  );
}
