"use client";

import { useEffect } from "react";
import type { Recipe } from "@/lib/recipes";

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  // ESC 키로 닫기 + 스크롤 방지
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 본체 */}
      <div
        className="relative w-full max-w-md max-h-[85vh] bg-bg rounded-t-3xl sm:rounded-3xl overflow-y-auto shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="sticky top-0 bg-bg pt-3 pb-2 flex justify-center rounded-t-3xl z-10">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-text pr-2">{recipe.name}</h3>
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

          {/* 재료 */}
          <section className="mb-5">
            <h4 className="text-sm font-bold text-primary mb-2">재료</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white rounded-full text-xs text-text border border-border"
                >
                  {ing}
                </span>
              ))}
            </div>
          </section>

          {/* 조리 순서 */}
          <section className="mb-5">
            <h4 className="text-sm font-bold text-primary mb-2">조리 순서</h4>
            <ol className="flex flex-col gap-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-text leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* 팁 */}
          {recipe.tip && (
            <section className="p-3 bg-secondary/10 rounded-xl border border-secondary/30">
              <p className="text-xs text-text">
                <span className="font-bold text-secondary">TIP </span>
                {recipe.tip}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
