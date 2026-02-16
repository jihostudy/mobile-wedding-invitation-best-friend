import type { Metadata } from "next";
import localFont from "next/font/local";
import { Crimson_Pro } from "next/font/google";
import OverlayProvider from "@/components/providers/OverlayProvider";
import ScrollResetProvider from "@/components/providers/ScrollResetProvider";
import ToastProvider from "@/components/common/toast/ToastProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

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
  title: "동현❤️다연의 결혼식에 초대합니다",
  description: "2025년 3월 1일 토요일 오후 2시 50분",
  keywords: ["결혼", "청첩장", "모바일청첩장", "웨딩"],
  openGraph: {
    title: "동현❤️다연의 결혼식에 초대합니다",
    description: "2025년 3월 1일 토요일 오후 2시 50분",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
