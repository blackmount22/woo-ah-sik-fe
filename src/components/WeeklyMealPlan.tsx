"use client";

import { useState, useMemo } from "react";
import type { DayMeal, Stage } from "@/lib/mealPlan";
import { getRecipe } from "@/lib/recipes";
import type { Recipe } from "@/lib/recipes";
import { getSeasonalMatch } from "@/lib/seasonal";
import RecipeModal from "./RecipeModal";

interface WeeklyMealPlanProps {
  childLabel: string;
  months: number;
  stage: Stage;
  weeklyPlan: DayMeal[];
}

// 이번 주 월요일부터 7일간 날짜 생성
function getWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일 1=월 ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const mealIcons: Record<string, string> = {
  아침: "🌅",
  점심: "☀️",
  저녁: "🌙",
  간식: "🍪",
};

const mealColors: Record<string, string> = {
  아침: "border-secondary bg-secondary/10",
  점심: "border-accent bg-accent/10",
  저녁: "border-primary bg-primary/10",
  간식: "border-border bg-border/10",
};

const mealLabelColors: Record<string, string> = {
  아침: "text-secondary",
  점심: "text-accent",
  저녁: "text-primary",
  간식: "text-text-light",
};

export default function WeeklyMealPlan({
  childLabel,
  months,
  stage,
  weeklyPlan,
}: WeeklyMealPlanProps) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const dayOfWeek = new Date().getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  });
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  const weekDates = useMemo(() => getWeekDates(), []);

  const goPrev = () => setSelectedIndex((i) => Math.max(0, i - 1));
  const goNext = () => setSelectedIndex((i) => Math.min(6, i + 1));

  const selectedMeal = weeklyPlan[selectedIndex];

  const handleMealClick = (menuName: string) => {
    const recipe = getRecipe(menuName);
    if (recipe) setOpenRecipe(recipe);
  };

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-text">
          {childLabel} — {months}개월
        </h2>
        <span className="inline-block mt-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
          {stage.name}
        </span>
        <p className="mt-2 text-sm text-text-light">
          {stage.description} ({stage.mealsPerDay})
        </p>
      </div>

      {/* 모유/분유기 안내 */}
      {!stage.hasMenu ? (
        <div className="p-6 bg-white rounded-2xl border border-border text-center">
          <p className="text-4xl mb-3">🍼</p>
          <p className="text-text font-semibold">모유/분유 수유 중입니다</p>
          <p className="mt-1 text-sm text-text-light">
            이유식은 만 4개월 이후부터 시작할 수 있어요.
          </p>
        </div>
      ) : (
        <>
          {/* 날짜 네비게이션 */}
          <div className="flex items-center gap-1 mb-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={selectedIndex === 0}
              className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                selectedIndex === 0
                  ? "text-border cursor-not-allowed"
                  : "text-text-light hover:bg-white hover:text-primary active:scale-90"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="flex-1 flex gap-1 overflow-x-auto">
              {weekDates.map((date, i) => {
                const isSelected = i === selectedIndex;
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={`flex-1 min-w-0 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : isToday
                          ? "bg-white text-primary border border-primary"
                          : "bg-white text-text-light hover:bg-white/80"
                    }`}
                  >
                    <span className="text-[10px] font-medium">
                      {weeklyPlan[i].day}
                    </span>
                    <span className="text-sm font-bold">
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={selectedIndex === 6}
              className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                selectedIndex === 6
                  ? "text-border cursor-not-allowed"
                  : "text-text-light hover:bg-white hover:text-primary active:scale-90"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 날짜 표시 */}
          <p className="text-center text-xs text-text-light mb-4">
            {weekDates[selectedIndex].getMonth() + 1}월{" "}
            {weekDates[selectedIndex].getDate()}일{" "}
            {weeklyPlan[selectedIndex].day}요일
          </p>

          {/* 선택된 날짜의 식단 카드 */}
          {selectedMeal && (
            <div className="flex flex-col gap-3">
              {selectedMeal.breakfast && (
                <MealCard
                  type="아침"
                  menu={selectedMeal.breakfast}
                  onClick={handleMealClick}
                />
              )}
              {selectedMeal.lunch && (
                <MealCard
                  type="점심"
                  menu={selectedMeal.lunch}
                  onClick={handleMealClick}
                />
              )}
              {selectedMeal.dinner && (
                <MealCard
                  type="저녁"
                  menu={selectedMeal.dinner}
                  onClick={handleMealClick}
                />
              )}
              {selectedMeal.snack && (
                <MealCard
                  type="간식"
                  menu={selectedMeal.snack}
                  onClick={handleMealClick}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* 레시피 모달 */}
      {openRecipe && (
        <RecipeModal
          recipe={openRecipe}
          onClose={() => setOpenRecipe(null)}
        />
      )}
    </div>
  );
}

function MealCard({
  type,
  menu,
  onClick,
}: {
  type: string;
  menu: string;
  onClick: (menu: string) => void;
}) {
  const hasRecipe = !!getRecipe(menu);
  const seasonal = getSeasonalMatch(menu);

  return (
    <button
      type="button"
      onClick={() => onClick(menu)}
      className={`w-full text-left p-4 rounded-2xl border-l-4 ${mealColors[type]} transition-all ${
        hasRecipe
          ? "cursor-pointer hover:shadow-md active:scale-[0.98]"
          : "cursor-default"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{mealIcons[type]}</span>
          <span className={`text-sm font-bold ${mealLabelColors[type]}`}>
            {type}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {seasonal && (
            <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/30 font-semibold">
              🌿 제철
            </span>
          )}
          {hasRecipe && (
            <span className="text-[10px] text-text-light bg-white px-2 py-0.5 rounded-full border border-border">
              레시피 보기
            </span>
          )}
        </div>
      </div>
      <p className="text-text font-medium pl-7">{menu}</p>
      {seasonal && (
        <p className="text-[11px] text-accent mt-1 pl-7">
          제철 재료: {seasonal.ingredients.join(", ")}
        </p>
      )}
    </button>
  );
}
