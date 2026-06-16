import type { Metadata } from "next";
import "./globals.css";
import ViewToggle from "@/app/components/ViewToggle";

export const metadata: Metadata = {
  title: "고구마마켓 🍠",
  description: "우리 동네 따뜻한 중고거래, 고구마마켓",
};

// 첫 렌더 전에 저장된 화면 폭을 적용해 깜빡임 방지
const initWidth = `
(function(){
  try {
    var m = localStorage.getItem('goguma-view') || 'mobile';
    var w = m === 'wide' ? '48rem' : '26rem';
    document.documentElement.style.setProperty('--app-w', w);
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: initWidth }} />
      </head>
      <body className="min-h-screen">
        {/* 둥실둥실 떠다니는 배경 장식 */}
        <div className="deco-layer" aria-hidden="true">
          <span className="deco deco-1">🍃</span>
          <span className="deco deco-2">✨</span>
          <span className="deco deco-3">💚</span>
          <span className="deco deco-4">🌿</span>
          <span className="deco deco-5">🌟</span>
          <span className="deco deco-6">🩵</span>
        </div>

        <div className="app-content">{children}</div>

        {/* 화면 폭 전환 버튼 */}
        <ViewToggle />
      </body>
    </html>
  );
}
