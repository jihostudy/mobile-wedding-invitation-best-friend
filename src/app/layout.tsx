import type { Metadata } from "next";
import localFont from "next/font/local";
import { Crimson_Pro } from "next/font/google";
import OverlayProvider from "@/components/providers/OverlayProvider";
import ScrollResetProvider from "@/components/providers/ScrollResetProvider";
import ToastProvider from "@/components/common/toast/ToastProvider";
import "./globals.css";

const tmoneyRoundWind = localFont({
  src: "../../public/fonts/TmoneyRoundWindRegular.ttf",
  variable: "--font-tmoney",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

const nanumHyejun = localFont({
  src: "../../public/fonts/Nanum_HyeJun.ttf",
  variable: "--font-hyejun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "김민섭 ♥ 전이서 결혼합니다",
  description: "2025년 3월 1일 토요일 오후 2시 50분",
  keywords: ["결혼", "청첩장", "모바일청첩장", "웨딩"],
  openGraph: {
    title: "김민섭 ♥ 전이서 결혼합니다",
    description: "2025년 3월 1일 토요일 오후 2시 50분",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/images/placeholder-couple.svg",
        width: 1200,
        height: 630,
        alt: "김민섭 ♥ 전이서 결혼식 청첩장",
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
      className={`${tmoneyRoundWind.variable} ${crimsonPro.variable} ${nanumHyejun.variable}`}
    >
      <body className={`${tmoneyRoundWind.className} antialiased bg-[#eee]`}>
        <ScrollResetProvider />
        <OverlayProvider>
          <ToastProvider>{children}</ToastProvider>
        </OverlayProvider>
      </body>
    </html>
  );
}
