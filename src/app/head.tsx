/**
 * 추가 메타데이터 및 외부 스크립트 로드
 */
export default function Head() {
  return (
    <>
      {/* PWA 지원 (선택사항) */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#F5F1E8" />
      
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" href="/images/wedding-content/hero/hero-1.jpg" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
