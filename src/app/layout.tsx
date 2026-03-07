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
  title: "우아식 - 우리아이식단 | 이유식 식단표 자동 생성",
  description:
    "아이의 생년월일을 입력하면 이유식 단계에 맞는 주간·월간 식단표와 분유량을 자동으로 계산해드립니다. 초기·중기·후기·완료기 이유식, 유아식까지 단계별 맞춤 식단과 냉장고 파먹기 레시피, 다자녀 통합 관리를 무료로 제공합니다.",
  keywords: [
    "이유식",
    "이유식 식단표",
    "이유식 레시피",
    "이유식 계획표",
    "초기 이유식",
    "중기 이유식",
    "후기 이유식",
    "완료기 이유식",
    "유아식",
    "분유량 계산",
    "아기 식단",
    "냉장고 파먹기",
    "다자녀 식단",
    "이유식 추천",
    "우아식",
  ],
  openGraph: {
    title: "우아식 - 우리아이식단 | 이유식 식단표 자동 생성",
    description:
      "아이의 생년월일을 입력하면 이유식 단계에 맞는 주간·월간 식단표와 분유량을 자동으로 계산해드립니다. 초기·중기·후기·완료기 이유식, 유아식까지 단계별 맞춤 식단과 냉장고 파먹기 레시피를 무료로 제공합니다.",
    url: "https://wooahsik.com",
    siteName: "우아식",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "우아식 - 우리아이식단 | 이유식 식단표 자동 생성",
    description:
      "아이의 생년월일을 입력하면 이유식 단계에 맞는 주간·월간 식단표와 분유량을 자동으로 계산해드립니다.",
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
                "아이의 생년월일을 입력하면 이유식 발달 단계에 맞는 주간·월간 식단표와 분유량을 자동으로 계산해주는 무료 육아 도우미 서비스입니다. 초기·중기·후기·완료기 이유식, 유아식까지 단계별 맞춤 식단을 제공하며, 냉장고에 남은 재료로 맞춤 레시피를 생성하는 냉장고 파먹기 기능도 지원합니다.",
              applicationCategory: "HealthApplication",
              operatingSystem: "All",
              inLanguage: "ko",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
              featureList: [
                "초기 이유식 단계별 주간 식단표 자동 생성 (4~5개월)",
                "중기 이유식 주간·월간 식단표 생성 (6~7개월)",
                "후기 이유식 식단표 및 간식 추천 (8~9개월)",
                "완료기 이유식 식단 관리 (10~11개월)",
                "유아식 및 일반 유아식 식단표 (12개월 이상)",
                "체중 기반 분유량 자동 계산",
                "냉장고 재료 기반 맞춤 이유식 레시피",
                "다자녀 통합 식단 관리 (최대 4명)",
                "이유식 영양 성분 분석",
              ],
              audience: {
                "@type": "Audience",
                audienceType: "부모, 영유아 보호자",
              },
              keywords: "이유식,이유식 식단표,이유식 레시피,분유량 계산,유아식,냉장고 파먹기",
            }),
          }}
        />
        {/* FAQ 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "이유식은 몇 개월부터 시작해야 하나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "소아과 전문의들은 생후 4~6개월 사이에 이유식을 시작하도록 권장합니다. 아이가 목을 가눌 수 있고, 음식에 관심을 보이며, 음식을 혀로 밀어내는 반사가 줄어들었을 때가 적절한 시기입니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "분유량은 어떻게 계산되나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "우아식은 체중(kg) × 150ml를 하루 기준 분유량으로 계산하며, 월령에 따른 수유 횟수와 1회 적정량을 함께 안내합니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "냉장고 파먹기 기능은 무엇인가요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "냉장고에 있는 재료를 직접 입력하면 아이의 발달 단계에 맞는 오늘의 맞춤 레시피를 즉석에서 생성해드립니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "여러 아이의 식단을 동시에 관리할 수 있나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "최대 4명의 자녀를 동시에 입력할 수 있으며, 각 아이의 발달 단계에 맞는 식단을 한 번에 확인할 수 있습니다.",
                  },
                },
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
