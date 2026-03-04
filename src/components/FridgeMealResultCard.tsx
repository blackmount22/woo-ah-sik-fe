"use client";

import type { FridgeMealResult } from "@/lib/fridgeMeal";

const mealTimeIcons: Record<string, string> = {
  아침: "🌅",
  점심: "☀️",
  저녁: "🌙",
};

const roleConfig: Record<string, { label: string; color: string }> = {
  main: { label: "메인반찬", color: "bg-primary/10 text-primary border-primary/20" },
  side: { label: "반찬",     color: "bg-secondary/10 text-secondary border-secondary/20" },
  soup: { label: "국",       color: "bg-blue-50 text-blue-600 border-blue-200" },
};

interface Props {
  result: FridgeMealResult;
}

export default function FridgeMealResultCard({ result }: Props) {
  const {
    mealTime, menuName, ingredients, stageName, months, childLabel,
    skipped, hasUsableIngredients, dishes,
  } = result;
  const icon = mealTimeIcons[mealTime] ?? "🍽️";
  const isOlderStage = ["완료기 이유식", "유아식", "일반 유아식"].includes(stageName);

  return (
    <div className="w-full rounded-2xl bg-white border border-border shadow-sm overflow-hidden">

      {/* 사용 불가 재료 경고 */}
      {skipped.length > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1.5">⚠️ 다음 재료는 사용하지 않았어요</p>
          <div className="flex flex-col gap-1">
            {skipped.map((s, i) => (
              <p key={i} className="text-xs text-amber-600 leading-relaxed">
                <span className="font-semibold">{s.name}</span> — {s.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 사용 가능한 재료 없음 안내 */}
      {!hasUsableIngredients && (
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-700 leading-relaxed">
            💡 입력한 재료 중 아이에게 적합한 것이 없어 기본 야채죽 레시피를 안내해드려요.
          </p>
        </div>
      )}

      {/* 헤더 */}
      <div className="px-5 py-4 bg-primary/5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-light">{childLabel}</p>
            <p className="text-sm font-semibold text-primary mt-0.5">
              {stageName} · {months}개월
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
              {icon} 오늘 {mealTime}
            </span>
          </div>
        </div>
      </div>

      {/* 오늘의 식단 요약 */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-xs text-text-light mb-2">오늘의 식단</p>
        <div className="flex flex-wrap gap-1.5">
          {/* 밥 (완료기이유식+ 단계만) */}
          {isOlderStage && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
              🍚 밥
            </span>
          )}
          {dishes.map((dish, i) => {
            const cfg = roleConfig[dish.role];
            return (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
              >
                {dish.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* 사용 재료 */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-xs font-semibold text-text-light uppercase tracking-wide mb-2">
          사용 재료
        </p>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* 각 반찬별 조리법 */}
      {dishes.map((dish, idx) => {
        const cfg = roleConfig[dish.role];
        const isLast = idx === dishes.length - 1;
        return (
          <div
            key={idx}
            className={`px-5 py-4 ${!isLast ? "border-b border-border" : ""}`}
          >
            {/* 반찬 헤더 */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                {cfg.label}
              </span>
              <p className="text-base font-bold text-text">{dish.name}</p>
            </div>

            {/* 조리 순서 */}
            <ol className="flex flex-col gap-2">
              {dish.steps.map((step, j) => (
                <li key={j} className="flex gap-2 text-sm text-text leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {j + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {/* Tip */}
            {dish.tip && (
              <div className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-xs text-accent font-semibold mb-0.5">Tip</p>
                <p className="text-xs text-text-light leading-relaxed">{dish.tip}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
