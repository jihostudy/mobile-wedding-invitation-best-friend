import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Crimson_Pro } from "next/font/google";
import OverlayProvider from "@/components/providers/OverlayProvider";
import ScrollResetProvider from "@/components/providers/ScrollResetProvider";
import ToastProvider from "@/components/common/toast/ToastProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const weddingTitle = "동현 ❤️ 다연 결혼합니다";
const weddingDescription = "2026년 6월 20일 토요일 낮 12시 30분 · 루클라비더화이트";

const tmoneyRoundWind = localFont({
  src: "../../public/fonts/TmoneyRoundWindRegular.woff2",
  variable: "--font-tmoney",
  display: "swap",
  preload: true,
  fallback: ["Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "system-ui", "sans-serif"],
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-crimson",
  display: "swap",
});

const nanumHyejun = localFont({
  src: "../../public/fonts/Nanum_HyeJun.woff2",
  variable: "--font-hyejun",
  display: "swap",
  preload: true,
  fallback: ["Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "system-ui", "sans-serif"],
});

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  preload: false,
  fallback: ["Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: weddingTitle,
  description: weddingDescription,
  keywords: ["결혼", "청첩장", "모바일청첩장", "웨딩"],
  openGraph: {
    title: weddingTitle,
    description: weddingDescription,
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/images/placeholder-couple.svg",
        width: 1200,
        height: 630,
        alt: "동현❤️다연의 결혼식 청첩장",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5F1E8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${tmoneyRoundWind.variable} ${crimsonPro.variable} ${nanumHyejun.variable} ${pretendard.variable}`}
    >
      <body
        className={`${tmoneyRoundWind.className} antialiased bg-gradient-to-b from-[#f8f0e4] via-[#fdf7f0] to-[#f6ecdd]`}
      >
        <QueryProvider>
          <ScrollResetProvider />
          <ToastProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
