import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 우아식",
  description: "우아식 서비스의 개인정보 수집·이용·보관에 관한 방침을 안내합니다.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. 수집하는 정보",
    content: (
      <>
        <p>
          우아식은 서버나 데이터베이스에 사용자 정보를 저장하지 않습니다.
          서비스 이용 시 입력하는 아이의 생년월일은{" "}
          <strong className="text-text font-semibold">사용자 기기(브라우저 로컬스토리지)</strong>에만 저장되며,
          외부 서버로 전송되지 않습니다.
        </p>
      </>
    ),
  },
  {
    title: "2. 정보 저장 위치 및 삭제 방법",
    content: (
      <ul className="space-y-2">
        {[
          ["저장 위치", "사용자 기기 (브라우저 로컬스토리지)"],
          ["저장 정보", "아이의 생년월일, 체중 (입력 시)"],
          ["외부 전송", "없음"],
          ["삭제 방법", "브라우저 설정 → 사이트 데이터 삭제, 또는 앱 내 「다시 선택하기」 버튼 클릭"],
        ].map(([label, desc]) => (
          <li key={label} className="flex gap-2">
            <span className="shrink-0 font-semibold text-text w-24">{label}</span>
            <span>{desc}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "3. 제3자 서비스 (광고)",
    content: (
      <>
        <p>
          본 서비스는 <strong className="text-text font-semibold">카카오 애드핏</strong> 및{" "}
          <strong className="text-text font-semibold">구글 애드센스</strong> 광고를 포함합니다.
          해당 광고 플랫폼은 자체 쿠키·개인정보 정책에 따라 사용자 정보를 처리할 수 있습니다.
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <a
              href="https://policy.kakao.com/kr/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors"
            >
              카카오 개인정보처리방침 →
            </a>
          </li>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors"
            >
              구글 개인정보처리방침 →
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. 쿠키(Cookie) 사용",
    content: (
      <p>
        우아식은 서비스 자체적으로 쿠키를 수집하지 않습니다.
        다만 광고 제공을 위해 카카오 애드핏·구글 애드센스가 쿠키를 사용할 수 있으며,
        사용자는 브라우저 설정에서 쿠키를 거부할 수 있습니다.
        단, 쿠키를 거부하는 경우 일부 광고 기능이 제한될 수 있습니다.
      </p>
    ),
  },
  {
    title: "5. 아동의 개인정보 보호",
    content: (
      <p>
        우아식은 만 14세 미만 아동의 개인정보를 직접 수집하지 않습니다.
        아이의 생년월일 및 체중 정보는 보호자가 입력하며,
        해당 정보는 기기 내에만 저장되고 서버로 전송되지 않습니다.
      </p>
    ),
  },
  {
    title: "6. 방침의 변경",
    content: (
      <p>
        본 개인정보 처리방침은 서비스 정책 변경 시 사전 공지 후 개정될 수 있습니다.
        변경 사항은 본 페이지를 통해 확인하실 수 있습니다.
      </p>
    ),
  },
  {
    title: "7. 문의",
    content: (
      <>
        <p>개인정보 관련 문의는 아래 이메일로 연락주세요.</p>
        <a
          href="mailto:moongang1022@naver.com"
          className="mt-2 inline-block text-primary font-semibold underline underline-offset-2 hover:text-primary-dark transition-colors"
        >
          moongang1022@naver.com
        </a>
      </>
    ),
  },
];

export default function PolicyPage() {
  const lastUpdated = "2026년 3월";

  return (
    <div className="min-h-screen bg-bg">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-light hover:bg-gray-100 transition-colors"
            aria-label="홈으로"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-text">개인정보 처리방침</h1>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* 상단 요약 카드 */}
        <div className="mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-bold text-text mb-1">우아식은 개인정보를 서버에 저장하지 않습니다</p>
              <p className="text-sm text-text-light leading-relaxed">
                입력하신 아이의 정보는 사용자 기기 내에만 저장되며 외부로 전송되지 않습니다.
                언제든 브라우저 설정에서 직접 삭제할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 업데이트 날짜 */}
        <p className="text-xs text-gray-400 mb-6">최종 업데이트: {lastUpdated}</p>

        {/* 섹션 목록 */}
        <div className="space-y-8">
          {SECTIONS.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-sm font-bold text-text mb-3 pb-2 border-b border-border">
                {title}
              </h2>
              <div className="text-sm text-text-light leading-relaxed">
                {content}
              </div>
            </section>
          ))}
        </div>

        {/* 주의 안내 */}
        <div className="mt-10 p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
          제공되는 식단 및 영양 정보는 일반적인 이유식 가이드라인 기반의 참고 자료입니다.
          아이의 건강 상태, 알레르기, 특수 식이 요건에 따라 소아과 의사 또는 영양사와 상담하시기 바랍니다.
        </div>

        {/* 홈으로 버튼 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="mt-12 py-6 text-center text-xs text-gray-400 border-t border-border">
        © {new Date().getFullYear()} 우아식. All rights reserved.
      </footer>
    </div>
  );
}
