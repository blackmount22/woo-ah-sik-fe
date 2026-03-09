"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): "ios" | "android" | "other" {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other" | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if (localStorage.getItem("pwa-install-dismissed")) {
      setDismissed(true);
      return;
    }

    const p = detectPlatform();
    setPlatform(p);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (platform === "ios") {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (installed || dismissed || platform === null) return null;

  // iOS는 항상 버튼 표시, Android는 beforeinstallprompt 이벤트 대기
  const showButton = platform === "ios" || !!deferredPrompt;
  if (!showButton) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium
          text-white bg-primary rounded-full shadow-sm
          hover:bg-primary-dark active:scale-95
          transition-all duration-150 animate-pulse-slow"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        앱 다운로드
      </button>

      {/* iOS 홈 화면 추가 가이드 모달 */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white rounded-t-2xl p-6 w-full max-w-sm mx-auto pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900">홈 화면에 추가</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <ol className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span>
                  Safari 하단 가운데{" "}
                  <strong className="text-gray-900">공유 버튼 (□↑)</strong>을 탭하세요
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span>
                  스크롤해서{" "}
                  <strong className="text-gray-900">"홈 화면에 추가"</strong>를 선택하세요
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span>
                  오른쪽 상단 <strong className="text-gray-900">"추가"</strong>를 탭하세요
                </span>
              </li>
            </ol>

            <p className="mt-4 text-xs text-gray-400 text-center">
              * Safari 브라우저에서만 홈 화면 추가가 가능합니다
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-medium text-sm"
              >
                다시 보지 않기
              </button>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
