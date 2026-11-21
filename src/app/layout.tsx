import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { getSiteUrl } from "@/lib/site-url";
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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "마이링크 | 나만의 올인원 프로필 링크",
    template: "%s | 마이링크",
  },
  description: "구글 소셜 로그인으로 1분 만에 완성하는 나만의 프로필 및 멀티링크 페이지",
  applicationName: "마이링크",
  keywords: [
    "마이링크",
    "프로필 링크",
    "멀티링크",
    "링크트리",
    "포트폴리오",
    "인스타그램 링크",
    "크리에이터 링크",
    "SNS 링크 모음",
  ],
  authors: [{ name: "마이링크 팀" }],
  creator: "마이링크",
  publisher: "마이링크",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "마이링크 | 나만의 올인원 프로필 링크",
    description: "구글 소셜 로그인으로 1분 만에 완성하는 나만의 프로필 및 멀티링크 페이지",
    url: "/",
    siteName: "마이링크",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "마이링크 | 나만의 올인원 프로필 링크",
    description: "구글 소셜 로그인으로 1분 만에 완성하는 나만의 프로필 및 멀티링크 페이지",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased bg-[#f9fafb] text-[#191f28]">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
