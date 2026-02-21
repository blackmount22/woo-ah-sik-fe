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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
