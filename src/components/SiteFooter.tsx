"use client";

import { useState } from "react";

type ModalType = "privacy" | "terms" | null;

export default function SiteFooter() {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="w-full mt-12 pb-8 px-4 flex flex-col items-center gap-3">
        {/* 링크 행 */}
        <div className="flex items-center gap-4 text-xs text-text-light">
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
            {/* Mail icon */}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
