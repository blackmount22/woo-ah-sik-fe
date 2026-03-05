import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wooahsik.com"),
  title: "우아식 - 우리아이식단",
  description: "우리 아이의 건강한 식단을 관리해보세요",
  openGraph: {
    title: "우아식 - 우리아이식단",
    description: "우리 아이의 건강한 식단을 관리해보세요",
    url: "https://wooahsik.com",
    siteName: "우아식",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "우아식 - 우리아이식단",
    description: "우리 아이의 건강한 식단을 관리해보세요",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF6B6B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6924139569926505"
          crossOrigin="anonymous"
        />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "우아식 - 우리아이식단",
              url: "https://wooahsik.com",
              description:
                "우리 아이의 생년월일을 입력하면 이유식 단계에 맞는 주간 식단표, 월간 식단표, 분유량을 자동으로 생성해주는 무료 육아 도우미 서비스입니다.",
              applicationCategory: "HealthApplication",
              operatingSystem: "All",
              inLanguage: "ko",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
              featureList: [
                "이유식 단계별 주간 식단표 생성",
                "월간 식단표 생성",
                "분유량 계산",
                "냉장고 재료 기반 맞춤 레시피",
                "다자녀 통합 식단 관리",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
