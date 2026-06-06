"use client";

import { useEffect, useState } from "react";
import { getRecipe } from "@/lib/recipes";
import type { Recipe } from "@/lib/recipes";
import RecipeModal from "./RecipeModal";

interface NewMenuSection {
  stage: string;
  emoji: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  menus: string[];
}

const NEW_MENU_SECTIONS: NewMenuSection[] = [
  {
    stage: "중기 이유식",
    emoji: "🥣",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    menus: ["닭고기두부죽", "대구살애호박죽", "연어당근죽", "두부당근죽"],
  },
  {
    stage: "후기 이유식",
    emoji: "🍲",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-400",
    menus: ["소고기청경채무른밥", "닭고기미역무른밥"],
  },
  {
    stage: "완료기 이유식",
    emoji: "🍱",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    menus: [
      "참치야채밥",
      "계란찜 + 밥",
      "들깨미역국 + 밥",
      "소고기표고버섯볶음 + 밥",
    ],
  },
  {
    stage: "유아식 · 일반 유아식",
    emoji: "🍽️",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
    menus: [
      "참치볶음밥",
      "순두부찌개 + 밥",
      "고등어조림 + 밥",
      "고등어구이 + 밥",
      "삼치구이 + 밥",
      "새우볶음밥",
      "만두국",
      "닭고기오므라이스",
      "함박스테이크 + 밥 + 된장국 + 브로콜리무침",
      "소고기불고기 + 밥 + 콩나물국 + 시금치나물",
      "스파게티 + 브로콜리무침 + 수프",
      "콩나물비빔밥 + 달걀국 + 두부조림",
      "닭고기된장찌개 + 밥 + 애호박볶음",
      "소고기수제비국 + 달걀찜",
      "콩나물국밥",
      "버섯소고기덮밥 + 된장국 + 달걀찜",
      "참치김밥 + 달걀국 + 브로콜리무침",
      "생선전 + 밥 + 된장국 + 브로콜리무침",
      "닭고기치즈구이 + 밥 + 미역국 + 브로콜리무침",
      "두부된장찌개 + 밥 + 애호박볶음 + 달걀찜",
    ],
  },
  {
    stage: "간식",
    emoji: "🍎",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
    menus: [
      "샌드위치 + 우유",
      "과일 꼬치",
      "크래커 + 치즈",
      "단호박수프",
      "과일요거트 파르페",
      "고구마 라테",
      "팬케이크 (간식)",
      "치즈 토스트",
      "과일 스무디",
      "야채달걀찜",
      "닭가슴살 볼",
      "과일화채",
      "고구마케이크",
      "두유 스무디",
    ],
  },
];

const TOTAL = NEW_MENU_SECTIONS.reduce((s, sec) => s + sec.menus.length, 0);

/** "A + B + C" → 메인 요리 "A", 곁들임 ["B", "C"] */
function splitMenuName(key: string): { main: string; sides: string[] } {
  const parts = key.split(" + ");
  return { main: parts[0], sides: parts.slice(1) };
}

interface NewMenuModalProps {
  onClose: () => void;
}

export default function NewMenuModal({ onClose }: NewMenuModalProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleMenuClick = (key: string) => {
    const recipe = getRecipe(key);
    if (recipe) setSelectedRecipe(recipe);
  };

  const handleRecipeClose = () => {
    setSelectedRecipe(null);
    // RecipeModal 언마운트 시 body overflow 복구 방지
    requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        {/* 배경 */}
        <div className="absolute inset-0 bg-black/40" />

        {/* 모달 */}
        <div
          className="relative w-full max-w-md max-h-[90vh] bg-bg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 핸들 */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* 헤더 */}
          <div className="shrink-0 px-5 pt-1 pb-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h2 className="text-lg font-bold text-text">새로 추가된 레시피</h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold">
                    +{TOTAL}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-light ml-7">
                  메뉴를 탭하면 레시피를 바로 볼 수 있어요
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-border text-text-light hover:text-text transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 내용 스크롤 영역 */}
          <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
            {NEW_MENU_SECTIONS.map((sec) => (
              <div key={sec.stage}>
                {/* 섹션 헤더 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sec.dot}`} />
                  <span className="text-sm font-bold text-text">{sec.emoji} {sec.stage}</span>
                  <span
                    className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${sec.bg} ${sec.text}`}
                  >
                    +{sec.menus.length}개
                  </span>
                </div>

                {/* 메뉴 카드 그리드 */}
                <div className="grid grid-cols-2 gap-2">
                  {sec.menus.map((key) => {
                    const { main, sides } = splitMenuName(key);
                    const hasRecipe = !!getRecipe(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => hasRecipe && handleMenuClick(key)}
                        className={`text-left px-3 py-2.5 rounded-xl border transition-all active:scale-[0.97] ${
                          hasRecipe
                            ? `${sec.bg} ${sec.border} hover:brightness-95 cursor-pointer`
                            : "bg-gray-50 border-gray-200 cursor-default opacity-60"
                        }`}
                      >
                        <p className={`text-xs font-bold leading-snug ${hasRecipe ? sec.text : "text-gray-400"}`}>
                          {main}
                        </p>
                        {sides.length > 0 && (
                          <p className="mt-0.5 text-[10px] text-text-light leading-snug truncate">
                            + {sides.join(", ")}
                          </p>
                        )}
                        {hasRecipe && (
                          <p className={`mt-1 text-[10px] font-semibold ${sec.text} opacity-60`}>
                            레시피 보기 →
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 하단 여백 */}
            <div className="h-2" />
          </div>
        </div>
      </div>

      {/* 레시피 상세 모달 */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={handleRecipeClose} />
      )}
    </>
  );
}
