"use client";

import { useState } from "react";

type ModalType = "privacy" | "terms" | "guide" | null;

const CLOSE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const STAGES = [
  { stage: "모유/분유기", months: "0~3개월", icon: "🍼", features: ["분유량 자동 계산 (체중 입력 필요)"] },
  { stage: "초기 이유식", months: "4~5개월", icon: "🥣", features: ["주간 식단표", "월간 식단표", "냉장고 파먹기"] },
  { stage: "중기 이유식", months: "6~7개월", icon: "🥣", features: ["주간 식단표", "월간 식단표", "냉장고 파먹기"] },
  { stage: "후기 이유식", months: "8~9개월", icon: "🍚", features: ["주간 식단표", "월간 식단표", "냉장고 파먹기"] },
  { stage: "완료기 이유식", months: "10~11개월", icon: "🍚", features: ["주간 식단표", "월간 식단표", "냉장고 파먹기"] },
  { stage: "유아식", months: "12~35개월", icon: "🍱", features: ["주간 식단표", "월간 식단표", "냉장고 파먹기"] },
  { stage: "일반 유아식", months: "36개월 이상", icon: "🍱", features: ["주간 식단표", "월간 식단표", "냉장고 파먹기"] },
];

const FEATURES = [
  {
    icon: "📅",
    title: "주간 식단표",
    desc: "이번 주 7일간의 아침·점심·저녁 식단을 자동으로 생성해요. 각 메뉴를 탭하면 레시피 검색 또는 유튜브 영상으로 바로 연결됩니다.",
  },
  {
    icon: "📆",
    title: "월간 식단표",
    desc: "이번 달 전체 식단을 달력 형태로 한눈에 볼 수 있어요.",
  },
  {
    icon: "🍼",
    title: "분유량 계산",
    desc: "모유/분유기 아기의 체중을 입력하면 하루 권장 분유량과 수유 횟수를 자동으로 계산해드려요.",
  },
  {
    icon: "🧊",
    title: "냉장고 파먹기",
    desc: "냉장고에 있는 재료를 직접 입력하면, 아이 발달 단계에 맞는 맞춤 반찬·레시피를 즉석에서 만들어드려요.",
  },
  {
    icon: "🖨️",
    title: "출력 · 공유",
    desc: "완성된 식단표를 이미지로 저장하거나 카카오톡·링크로 공유할 수 있어요.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "다자녀 통합 관리",
    desc: "최대 4명의 자녀를 동시에 입력하면 각 아이의 발달 단계에 맞는 식단을 한 번에 확인할 수 있어요. 같은 단계의 아이는 통합 식단으로 제공됩니다.",
  },
];

export default function SiteFooter() {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="w-full mt-12 pb-8 px-4 flex flex-col items-center gap-3">
        {/* 링크 행 */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-text-light">
          <button
            type="button"
            onClick={() => setModal("guide")}
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            서비스 사용법
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => setModal("privacy")}
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            개인정보 처리방침
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => setModal("terms")}
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            이용약관
          </button>
          <span className="text-border">|</span>
          {/* 이메일 문의 */}
          <a
            href="mailto:moongang1022@naver.com"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            title="이메일 문의"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            문의하기
          </a>
          {/* GitHub */}
          <a
            href="https://github.com/blackmount22"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            title="GitHub"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>

        {/* 카피라이트 */}
        <p className="text-[11px] text-gray-300">
          © {new Date().getFullYear()} 우아식. All rights reserved.
        </p>
      </footer>

      {/* ── 서비스 사용법 모달 ── */}
      {modal === "guide" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md max-h-[88vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-text">📖 서비스 사용법</h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all"
              >
                {CLOSE_ICON}
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 text-sm text-text-light leading-relaxed">

              {/* 사용 순서 */}
              <section>
                <h3 className="font-bold text-text mb-3">사용 순서</h3>
                <ol className="space-y-3">
                  {[
                    { step: "1", title: "자녀 수 선택", desc: "화면 상단에서 자녀 수를 선택하세요. 최대 4명까지 한 번에 입력할 수 있어요." },
                    { step: "2", title: "생년월일 입력", desc: "각 아이의 생년월일을 입력하세요. 개월 수를 자동으로 계산해 적합한 단계를 판별합니다." },
                    { step: "3", title: "체중 입력 (분유기만)", desc: "모유/분유기 아기는 체중을 함께 입력해야 분유량을 계산할 수 있어요." },
                    { step: "4", title: "시작하기 클릭", desc: "버튼을 누르면 식단 생성 방식을 선택하는 팝업이 나타납니다." },
                    { step: "5", title: "식단 확인", desc: "아이 단계에 맞는 식단표 또는 분유량이 자동으로 표시됩니다." },
                  ].map(({ step, title, desc }) => (
                    <li key={step} className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        {step}
                      </span>
                      <div>
                        <p className="font-semibold text-text">{title}</p>
                        <p className="text-xs mt-0.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* 단계별 제공 기능 */}
              <section>
                <h3 className="font-bold text-text mb-3">단계별 제공 기능</h3>
                <div className="space-y-2">
                  {STAGES.map(({ stage, months, icon, features }) => (
                    <div key={stage} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <span className="text-xl shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold text-text text-sm">{stage}</span>
                          <span className="text-xs text-gray-400">{months}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {features.map((f) => (
                            <span
                              key={f}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 주요 기능 설명 */}
              <section>
                <h3 className="font-bold text-text mb-3">주요 기능 안내</h3>
                <div className="space-y-3">
                  {FEATURES.map(({ icon, title, desc }) => (
                    <div key={title} className="flex gap-3">
                      <span className="text-lg shrink-0">{icon}</span>
                      <div>
                        <p className="font-semibold text-text">{title}</p>
                        <p className="text-xs mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 안내 문구 */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
                제공되는 식단은 일반적인 이유식 가이드라인 기반의 참고 정보입니다. 아이의 건강 상태에 따라 소아과 의사 또는 영양사와 상담하시기 바랍니다.
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 개인정보 처리방침 모달 ── */}
      {modal === "privacy" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-text">🔒 개인정보 처리방침</h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all"
              >
                {CLOSE_ICON}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm text-text-light leading-relaxed">
              <p className="text-xs text-gray-400">최종 업데이트: {new Date().getFullYear()}년</p>

              <section>
                <h3 className="font-bold text-text mb-1">1. 수집하는 정보</h3>
                <p>우아식은 서버나 데이터베이스에 사용자 정보를 저장하지 않습니다. 서비스 이용 시 입력하는 아이의 생년월일은 <strong>사용자 기기(브라우저 로컬스토리지)</strong>에만 저장되며, 외부 서버로 전송되지 않습니다.</p>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">2. 정보 저장 위치</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>저장 위치: 사용자 기기 (브라우저 로컬스토리지)</li>
                  <li>저장 정보: 아이의 생년월일, 체중 (입력 시)</li>
                  <li>외부 전송: 없음</li>
                  <li>삭제 방법: 브라우저 설정 → 사이트 데이터 삭제, 또는 앱 내 「다시 선택하기」</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">3. 광고</h3>
                <p>본 서비스는 카카오 애드핏 및 구글 애드센스 광고를 포함합니다. 해당 광고 플랫폼은 자체 쿠키 정책에 따라 사용자 정보를 처리할 수 있습니다. 자세한 사항은 각 플랫폼의 개인정보처리방침을 참고해주세요.</p>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">4. 문의</h3>
                <p>개인정보 관련 문의는 아래 이메일로 연락주세요.</p>
                <a href="mailto:moongang1022@naver.com" className="text-primary font-medium">moongang1022@naver.com</a>
              </section>
            </div>
            <div className="shrink-0 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 이용약관 모달 ── */}
      {modal === "terms" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-text">📋 이용약관</h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all"
              >
                {CLOSE_ICON}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm text-text-light leading-relaxed">
              <p className="text-xs text-gray-400">최종 업데이트: {new Date().getFullYear()}년</p>

              <section>
                <h3 className="font-bold text-text mb-1">1. 서비스 소개</h3>
                <p>우아식은 아이의 생년월일 기반으로 이유식 단계에 맞는 식단표와 분유량을 제안하는 무료 육아 도우미 서비스입니다.</p>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">2. 서비스 이용</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>본 서비스는 육아 참고용 정보를 제공하며, 의학적 진단이나 처방을 대체하지 않습니다.</li>
                  <li>제공되는 식단은 일반적인 이유식 가이드라인에 기반하며, 아이의 건강 상태에 따라 전문가와 상담을 권장합니다.</li>
                  <li>알레르기, 특수 식이 요건 등은 반드시 소아과 의사 또는 영양사와 확인하시기 바랍니다.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">3. 면책 사항</h3>
                <p>우아식은 제공된 식단 정보 사용으로 인한 직접적·간접적 손해에 대해 책임을 지지 않습니다. 모든 식단 결정의 최종 판단은 보호자 및 전문가에게 있습니다.</p>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">4. 지적 재산권</h3>
                <p>서비스 내 콘텐츠(디자인, 텍스트, 아이콘 등)의 저작권은 우아식에 귀속됩니다. 무단 복제 및 재배포를 금합니다.</p>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">5. 약관 변경</h3>
                <p>약관은 서비스 개선을 위해 사전 고지 없이 변경될 수 있습니다. 변경된 약관은 서비스 내 공지 후 효력이 발생합니다.</p>
              </section>

              <section>
                <h3 className="font-bold text-text mb-1">6. 문의</h3>
                <a href="mailto:moongang1022@naver.com" className="text-primary font-medium">moongang1022@naver.com</a>
              </section>
            </div>
            <div className="shrink-0 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
