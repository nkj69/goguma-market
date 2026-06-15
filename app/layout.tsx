import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고구마마켓 🍠",
  description: "우리 동네 따뜻한 중고거래, 고구마마켓",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
