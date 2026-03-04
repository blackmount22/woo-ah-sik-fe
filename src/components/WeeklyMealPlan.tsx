"use client";

import { useState, useMemo } from "react";
import type { DayMeal, Stage, MonthPlan, MonthDayMeal } from "@/lib/mealPlan";
import { getRecipe } from "@/lib/recipes";
import type { Recipe } from "@/lib/recipes";
import { getSeasonalMatch } from "@/lib/seasonal";
import { getAllergenMatches } from "@/lib/allergens";
import { getWeekIngredientGroups, getCoupangLink, getKurlyLink } from "@/lib/ingredients";
import type { CategoryGroup } from "@/lib/ingredients";
import { calcWeekNutrition, weeklyVitaminAvg } from "@/lib/nutrition";
import type { NutritionDayResult } from "@/lib/nutrition";
import RecipeModal from "./RecipeModal";

interface UnifiedGroup {
  baseStageName: string;
  groupSize: number;
  childLabels: string[];
}

interface WeeklyMealPlanProps {
  childLabel: string;
  months: number;
  stage: Stage;
  weeklyPlan: DayMeal[];
  monthlyPlan: MonthPlan | null;
  unifiedGroup?: UnifiedGroup;
  combinedChildren?: { label: string; months: number }[];
}

type ViewMode = "weekly" | "monthly";

const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

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

// 월간 데이터를 월요일 시작 주 단위로 분할
function buildMonthWeeks(plan: MonthPlan): (MonthDayMeal | null)[][] {
  const firstDow = (new Date(plan.year, plan.month - 1, 1).getDay() + 6) % 7;
  const weeks: (MonthDayMeal | null)[][] = [];
  let week: (MonthDayMeal | null)[] = Array(firstDow).fill(null);

  for (const day of plan.days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

// 날짜 → 주 인덱스 계산
function dateToWeekIdx(plan: MonthPlan, date: number): number {
  const firstDow = (new Date(plan.year, plan.month - 1, 1).getDay() + 6) % 7;
  return Math.floor((firstDow + date - 1) / 7);
}

export default function WeeklyMealPlan({
  childLabel,
  months,
  stage,
  weeklyPlan,
  monthlyPlan,
  unifiedGroup,
  combinedChildren,
}: WeeklyMealPlanProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [selectedDate, setSelectedDate] = useState<number>(
    new Date().getDate()
  );
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // 월간 데이터를 주 단위로 분할
  const monthWeeks = useMemo(
    () => (monthlyPlan ? buildMonthWeeks(monthlyPlan) : []),
    [monthlyPlan]
  );

  // 선택된 날짜가 속한 주 인덱스 (파생)
  const weekIdx = monthlyPlan
    ? dateToWeekIdx(monthlyPlan, selectedDate)
    : 0;
  const currentWeek = monthWeeks[weekIdx] ?? [];

  // 현재 주의 실제 식단 데이터 (null 제외)
  const weekMeals = currentWeek
    .filter((d): d is MonthDayMeal => d !== null)
    .map((d) => ({
      breakfast: d.breakfast,
      lunch: d.lunch,
      dinner: d.dinner,
      snack: d.snack,
    }));

  // 선택된 날짜의 식단
  const selectedDayMeal =
    monthlyPlan?.days.find((d) => d.date === selectedDate) ?? null;

  // 선택된 날짜의 요일명
  const selectedDayName = monthlyPlan
    ? dayNames[
        (new Date(monthlyPlan.year, monthlyPlan.month - 1, selectedDate).getDay() + 6) % 7
      ]
    : "";

  const handleMealClick = (menuName: string) => {
    const recipe = getRecipe(menuName);
    if (recipe) setOpenRecipe(recipe);
  };

  const totalDays = monthlyPlan?.days.length ?? 0;
  const goPrev = () => setSelectedDate((d) => Math.max(1, d - 1));
  const goNext = () => setSelectedDate((d) => Math.min(totalDays, d + 1));

  const today = new Date();
  const isCurrentMonth = monthlyPlan
    ? today.getFullYear() === monthlyPlan.year &&
      today.getMonth() + 1 === monthlyPlan.month
    : false;
  const todayDate = today.getDate();

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="text-center mb-5">
        {combinedChildren ? (
          <>
            <h2 className="text-xl font-bold text-text">
              {combinedChildren.map((c) => c.label).join(" · ")}
            </h2>
            <p className="text-sm text-text-light mt-0.5">
              {combinedChildren.map((c) => `${c.months}개월`).join(" · ")}
            </p>
          </>
        ) : (
          <h2 className="text-xl font-bold text-text">
            {childLabel} — {months}개월
          </h2>
        )}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
            {stage.name}
          </span>
          {combinedChildren && unifiedGroup && (
            <span className="inline-block px-3 py-1 rounded-full bg-accent text-white text-xs font-semibold">
              통합 식단
            </span>
          )}
        </div>
        {combinedChildren && unifiedGroup && (
          <p className="mt-1 text-xs text-accent">
            {unifiedGroup.baseStageName} 기준 · {unifiedGroup.childLabels.join(", ")}
          </p>
        )}
        <p className="mt-2 text-sm text-text-light">
          {stage.description} ({stage.mealsPerDay})
        </p>
      </div>

      {/* 통합 식단 안내 */}
      {stage.hasMenu && combinedChildren && unifiedGroup && (
        <p className="text-[11px] text-accent text-center mb-2">
          * 통합 식단 — {unifiedGroup.baseStageName} 기준으로 {unifiedGroup.childLabels.join(", ")}의 식단을 통합하여 제공합니다.
        </p>
      )}

      {/* 알레르기 유의 안내 */}
      {stage.hasMenu && (
        <p className="text-[11px] text-primary text-center mb-4">
          * 알레르기 유의 — 식단에 포함된 알레르기 유발 식품을 확인해주세요.
        </p>
      )}

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
          {/* 뷰 모드 토글 */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                viewMode === "weekly"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-text-light border border-border hover:border-primary/30"
              }`}
            >
              일주일
            </button>
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                viewMode === "monthly"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-text-light border border-border hover:border-primary/30"
              }`}
            >
              한 달
            </button>
          </div>

          {/* 출력 버튼 — 한 달 뷰일 때만 노출 */}
          {viewMode === "monthly" && monthlyPlan && (
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-border text-text-light text-sm font-semibold hover:border-primary/40 hover:text-primary transition-all shadow-sm active:scale-95"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                출력
              </button>
            </div>
          )}

          {viewMode === "weekly" && monthlyPlan ? (
            <>
              {/* 월 표시 */}
              <p className="text-center text-xs text-text-light mb-3">
                {monthlyPlan.year}년 {monthlyPlan.month}월
              </p>

              {/* 주간 네비게이션 */}
              <div className="flex items-center gap-1 mb-4">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={selectedDate <= 1}
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                    selectedDate <= 1
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

                <div className="flex-1 flex gap-1">
                  {currentWeek.map((day, i) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${i}`}
                          className="flex-1 min-w-0 py-2 px-1"
                        />
                      );
                    }
                    const isSelected = day.date === selectedDate;
                    const isToday = isCurrentMonth && day.date === todayDate;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDate(day.date)}
                        className={`flex-1 min-w-0 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-md"
                            : isToday
                              ? "bg-white text-primary border border-primary"
                              : "bg-white text-text-light hover:bg-white/80"
                        }`}
                      >
                        <span className="text-[10px] font-medium">
                          {dayNames[i]}
                        </span>
                        <span className="text-sm font-bold">{day.date}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={selectedDate >= totalDays}
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                    selectedDate >= totalDays
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
                {monthlyPlan.month}월 {selectedDate}일 {selectedDayName}요일
              </p>

              {/* 선택된 날짜의 식단 카드 */}
              {selectedDayMeal && (
                <div className="flex flex-col gap-3">
                  {selectedDayMeal.breakfast && (
                    <MealCard
                      type="아침"
                      menu={selectedDayMeal.breakfast}
                      onClick={handleMealClick}
                    />
                  )}
                  {selectedDayMeal.lunch && (
                    <MealCard
                      type="점심"
                      menu={selectedDayMeal.lunch}
                      onClick={handleMealClick}
                    />
                  )}
                  {selectedDayMeal.dinner && (
                    <MealCard
                      type="저녁"
                      menu={selectedDayMeal.dinner}
                      onClick={handleMealClick}
                    />
                  )}
                  {selectedDayMeal.snack && (
                    <MealCard
                      type="간식"
                      menu={selectedDayMeal.snack}
                      onClick={handleMealClick}
                    />
                  )}
                </div>
              )}

              {/* 식재료 구매 + 영양 성분 버튼 */}
              {weekMeals.length > 0 && (
                <div className="mt-5 flex justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowShoppingModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-primary/20 text-primary font-bold text-sm shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    식재료 구매
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNutritionModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-accent/30 text-accent font-bold text-sm shadow-sm hover:border-accent/50 hover:bg-accent/5 transition-all active:scale-95"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 20V10" />
                      <path d="M12 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                    영양 성분
                  </button>
                </div>
              )}
            </>
          ) : (
            monthlyPlan && (
              <MonthlyCalendar
                monthlyPlan={monthlyPlan}
                monthWeeks={monthWeeks}
                selectedDay={selectedDate}
                onSelectDay={setSelectedDate}
                selectedDayMeal={selectedDayMeal}
                onMealClick={handleMealClick}
              />
            )
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

      {/* 공유 / 출력 모달 */}
      {showPrintModal && monthlyPlan && (
        <PrintModal
          monthlyPlan={monthlyPlan}
          monthWeeks={monthWeeks}
          childLabel={childLabel}
          stage={stage}
          combinedChildren={combinedChildren}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* 식재료 구매 모달 */}
      {showShoppingModal && monthlyPlan && (
        <ShoppingModal
          weekMeals={weekMeals}
          monthlyPlan={monthlyPlan}
          currentWeek={currentWeek}
          onClose={() => setShowShoppingModal(false)}
        />
      )}

      {/* 영양 성분 대시보드 모달 */}
      {showNutritionModal && monthlyPlan && (
        <NutritionModal
          currentWeek={currentWeek}
          stageName={stage.name}
          monthlyPlan={monthlyPlan}
          onClose={() => setShowNutritionModal(false)}
        />
      )}
    </div>
  );
}

// ── 월간 달력 ──

function MonthlyCalendar({
  monthlyPlan,
  monthWeeks,
  selectedDay,
  onSelectDay,
  selectedDayMeal,
  onMealClick,
}: {
  monthlyPlan: MonthPlan;
  monthWeeks: (MonthDayMeal | null)[][];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedDayMeal: MonthDayMeal | null;
  onMealClick: (menu: string) => void;
}) {
  const { year, month } = monthlyPlan;

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  const selectedDayOfWeek =
    dayNames[(new Date(year, month - 1, selectedDay).getDay() + 6) % 7];

  return (
    <div>
      {/* 월 표시 */}
      <p className="text-center text-sm font-bold text-text mb-3">
        {year}년 {month}월
      </p>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-text-light py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-[3px]">
        {monthWeeks.flat().map((dayData, cellIndex) => {
          if (!dayData) {
            return <div key={cellIndex} className="min-h-[92px]" />;
          }

          const isToday = isCurrentMonth && dayData.date === todayDate;
          const isSelected = dayData.date === selectedDay;

          return (
            <button
              key={cellIndex}
              type="button"
              onClick={() => onSelectDay(dayData.date)}
              className={`min-h-[92px] p-1 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : isToday
                    ? "border-primary/40 bg-white"
                    : "border-border/40 bg-white hover:border-primary/20"
              }`}
            >
              <div
                className={`text-[10px] font-bold text-center mb-1 ${
                  isSelected
                    ? "text-primary"
                    : isToday
                      ? "text-primary"
                      : "text-text"
                }`}
              >
                {dayData.date}
              </div>
              <div className="flex flex-col gap-[3px]">
                {dayData.breakfast && (
                  <p className="text-[8px] leading-snug text-text border-l-2 border-secondary pl-[3px] truncate">
                    {dayData.breakfast}
                  </p>
                )}
                {dayData.lunch && (
                  <p className="text-[8px] leading-snug text-text border-l-2 border-accent pl-[3px] truncate">
                    {dayData.lunch}
                  </p>
                )}
                {dayData.dinner && (
                  <p className="text-[8px] leading-snug text-text border-l-2 border-primary pl-[3px] truncate">
                    {dayData.dinner}
                  </p>
                )}
                {dayData.snack && (
                  <p className="text-[8px] leading-snug text-text border-l-2 border-gray-300 pl-[3px] truncate">
                    {dayData.snack}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-3 mt-3 mb-4">
        {[
          { label: "아침", color: "bg-secondary" },
          { label: "점심", color: "bg-accent" },
          { label: "저녁", color: "bg-primary" },
          { label: "간식", color: "bg-gray-400" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-text-light">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 선택된 날짜 상세 */}
      {selectedDayMeal && (
        <div>
          <p className="text-center text-xs font-semibold text-text mb-3">
            {month}월 {selectedDay}일 {selectedDayOfWeek}요일
          </p>
          <div className="flex flex-col gap-3">
            {selectedDayMeal.breakfast && (
              <MealCard
                type="아침"
                menu={selectedDayMeal.breakfast}
                onClick={onMealClick}
              />
            )}
            {selectedDayMeal.lunch && (
              <MealCard
                type="점심"
                menu={selectedDayMeal.lunch}
                onClick={onMealClick}
              />
            )}
            {selectedDayMeal.dinner && (
              <MealCard
                type="저녁"
                menu={selectedDayMeal.dinner}
                onClick={onMealClick}
              />
            )}
            {selectedDayMeal.snack && (
              <MealCard
                type="간식"
                menu={selectedDayMeal.snack}
                onClick={onMealClick}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 식단 카드 ──

function MealCard({
  type,
  menu,
  onClick,
}: {
  type: string;
  menu: string;
  onClick: (menu: string) => void;
}) {
  // " + " 로 분리된 다중 메뉴 지원
  const dishParts = menu.split(" + ");
  const mainDish  = dishParts[0];
  const isMulti   = dishParts.length > 1;

  const hasRecipe = !!getRecipe(mainDish);
  const seasonal  = getSeasonalMatch(menu);
  const allergens = getAllergenMatches(menu);

  return (
    <button
      type="button"
      onClick={() => onClick(mainDish)}
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
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(mainDish + " 만들기 레시피")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 hover:bg-red-100 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            영상
          </a>
        </div>
      </div>

      {/* 단일 메뉴 or 다중 반찬 */}
      {isMulti ? (
        <div className="flex flex-wrap gap-1.5 pl-7 mt-0.5">
          {dishParts.map((dish, i) => (
            <span
              key={i}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                i === 0
                  ? "bg-white text-text border-border font-bold"
                  : "bg-white/60 text-text-light border-border/70"
              }`}
            >
              {dish}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-text font-medium pl-7">{menu}</p>
      )}

      {seasonal && (
        <p className="text-[11px] text-accent mt-1 pl-7">
          제철 재료: {seasonal.ingredients.join(", ")}
        </p>
      )}
      {allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pl-7">
          {allergens.map((a) => (
            <span
              key={a.name}
              className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 font-medium"
            >
              {a.icon} {a.name}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// ── 공유/출력 모달 ──

function buildShareText(
  monthlyPlan: import("@/lib/mealPlan").MonthPlan,
  title: string,
  stage: import("@/lib/mealPlan").Stage
): string {
  const lines: string[] = [
    `🍼 ${title} 이유식 식단표`,
    `📅 ${monthlyPlan.year}년 ${monthlyPlan.month}월 · ${stage.name}`,
    "",
  ];
  const wdays = ["월", "화", "수", "목", "금", "토", "일"];
  for (const d of monthlyPlan.days) {
    const dow = wdays[(new Date(monthlyPlan.year, monthlyPlan.month - 1, d.date).getDay() + 6) % 7];
    const parts: string[] = [`${d.date}일(${dow})`];
    if (d.breakfast) parts.push(`아침: ${d.breakfast}`);
    if (d.lunch) parts.push(`점심: ${d.lunch}`);
    if (d.dinner) parts.push(`저녁: ${d.dinner}`);
    if (d.snack) parts.push(`간식: ${d.snack}`);
    lines.push(parts.join(" | "));
  }
  lines.push("", "— 우아식 (woo-ah-sik)");
  return lines.join("\n");
}

function PrintModal({
  monthlyPlan,
  monthWeeks,
  childLabel,
  stage,
  combinedChildren,
  onClose,
}: {
  monthlyPlan: import("@/lib/mealPlan").MonthPlan;
  monthWeeks: (import("@/lib/mealPlan").MonthDayMeal | null)[][];
  childLabel: string;
  stage: import("@/lib/mealPlan").Stage;
  combinedChildren?: { label: string; months: number }[];
  onClose: () => void;
}) {
  const { year, month } = monthlyPlan;
  const title = combinedChildren
    ? combinedChildren.map((c) => c.label).join(" · ")
    : childLabel;

  const handleShare = async () => {
    const text = buildShareText(monthlyPlan, title, stage);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} ${year}년 ${month}월 식단표`,
          text,
        });
      } catch {
        // 사용자가 취소하거나 오류 발생 시 클립보드로 폴백
        await navigator.clipboard.writeText(text);
        alert("식단표가 클립보드에 복사되었습니다!");
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("식단표가 클립보드에 복사되었습니다!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const mealDotColors: Record<string, string> = {
    breakfast: "bg-orange-400",
    lunch: "bg-green-500",
    dinner: "bg-red-400",
    snack: "bg-gray-400",
  };

  return (
    <>
      {/* 화면 전용: 어두운 오버레이 (인쇄 시 숨김) */}
      <div
        className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-5xl max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-gray-100">
            {/* 제목 행 */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-gray-800">
                {year}년 {month}월 식단표 미리보기
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* 액션 버튼 행 */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-xs sm:text-sm font-semibold hover:border-primary/40 hover:text-primary transition-all"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                공유
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold shadow hover:bg-primary-dark transition-all active:scale-95"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                PDF 출력
              </button>
              <p className="ml-auto text-[10px] text-gray-400 hidden sm:block">
                * 화면 미리보기용입니다. 인쇄 시 달력 형식으로 출력됩니다.
              </p>
            </div>
          </div>

          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto">
            {/* 모바일: 일별 세로 리스트 */}
            <div className="block sm:hidden px-4 py-3">
              <MobilePrintList
                year={year}
                month={month}
                title={title}
                stage={stage}
                monthWeeks={monthWeeks}
              />
            </div>
            {/* 데스크탑: 달력 그리드 */}
            <div className="hidden sm:block p-5">
              <PrintCalendarContent
                year={year}
                month={month}
                title={title}
                stage={stage}
                monthWeeks={monthWeeks}
                mealDotColors={mealDotColors}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 인쇄 전용 영역 — 화면에서는 숨김, 인쇄 시 표시 */}
      <div className="print-meal-modal" style={{ display: "none" }}>
        <div style={{ padding: "6mm 8mm" }}>
          <PrintCalendarContent
            year={year}
            month={month}
            title={title}
            stage={stage}
            monthWeeks={monthWeeks}
            mealDotColors={mealDotColors}
          />
        </div>
      </div>
    </>
  );
}

// 모바일용 일별 리스트 (달력 그리드 대신)
function MobilePrintList({
  year,
  month,
  title,
  stage,
  monthWeeks,
}: {
  year: number;
  month: number;
  title: string;
  stage: import("@/lib/mealPlan").Stage;
  monthWeeks: (import("@/lib/mealPlan").MonthDayMeal | null)[][];
}) {
  const wdays = ["월", "화", "수", "목", "금", "토", "일"];
  const allDays = monthWeeks
    .flat()
    .filter((d): d is import("@/lib/mealPlan").MonthDayMeal => d !== null);

  const mealRows = [
    { key: "breakfast" as const, label: "아침", dot: "bg-orange-400" },
    { key: "lunch" as const, label: "점심", dot: "bg-green-500" },
    { key: "dinner" as const, label: "저녁", dot: "bg-red-400" },
    { key: "snack" as const, label: "간식", dot: "bg-gray-400" },
  ];

  return (
    <div>
      {/* 헤더 */}
      <div className="text-center mb-4">
        <p className="text-base font-bold text-gray-800">
          🍼 {title} 이유식 식단표
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {year}년 {month}월 &nbsp;·&nbsp; {stage.name} ({stage.mealsPerDay})
        </p>
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {mealRows.map((m) => (
          <div key={m.key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${m.dot}`} />
            <span className="text-[10px] text-gray-500">{m.label}</span>
          </div>
        ))}
      </div>

      {/* 일별 카드 */}
      <div className="space-y-2">
        {allDays.map((day) => {
          const dow =
            wdays[
              (new Date(year, month - 1, day.date).getDay() + 6) % 7
            ];
          const hasAny =
            day.breakfast || day.lunch || day.dinner || day.snack;
          if (!hasAny) return null;
          return (
            <div
              key={day.date}
              className="bg-gray-50 rounded-xl px-3 py-2.5"
            >
              <p className="text-xs font-bold text-gray-700 mb-1.5">
                {month}월 {day.date}일{" "}
                <span className="text-gray-400">({dow})</span>
              </p>
              <div className="space-y-1">
                {mealRows.map(({ key, label, dot }) =>
                  day[key] ? (
                    <div key={key} className="flex items-start gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${dot} mt-[5px] shrink-0`}
                      />
                      <p className="text-[11px] text-gray-600 leading-snug">
                        <span className="font-semibold text-gray-700">
                          {label}
                        </span>{" "}
                        {day[key]}
                      </p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-4">
        우아식 — 아이의 건강한 한 달 식단을 응원합니다 🍼
      </p>
    </div>
  );
}

// 달력 내용 (화면 미리보기 + 인쇄 모두 공유)
function PrintCalendarContent({
  year,
  month,
  title,
  stage,
  monthWeeks,
  mealDotColors,
}: {
  year: number;
  month: number;
  title: string;
  stage: import("@/lib/mealPlan").Stage;
  monthWeeks: (import("@/lib/mealPlan").MonthDayMeal | null)[][];
  mealDotColors: Record<string, string>;
}) {
  const wdays = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div style={{ fontFamily: "sans-serif", color: "#1a1a1a" }}>
      {/* 제목 */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
          🍼 {title} 이유식 식단표
        </h1>
        <p style={{ fontSize: "13px", color: "#555", margin: "3px 0 0" }}>
          {year}년 {month}월 &nbsp;·&nbsp; {stage.name} ({stage.mealsPerDay})
        </p>
      </div>

      {/* 범례 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "8px",
          fontSize: "11px",
          color: "#555",
        }}
      >
        {[
          { label: "아침", color: "#fb923c" },
          { label: "점심", color: "#22c55e" },
          { label: "저녁", color: "#f87171" },
          { label: "간식", color: "#9ca3af" },
        ].map((item) => (
          <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: item.color,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* 달력 테이블 */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {wdays.map((d) => (
              <th
                key={d}
                style={{
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  padding: "5px 2px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#374151",
                  width: "14.28%",
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((dayData, di) => {
                if (!dayData) {
                  return (
                    <td
                      key={di}
                      style={{
                        border: "1px solid #e5e7eb",
                        background: "#fafafa",
                        minHeight: "70px",
                        height: "70px",
                      }}
                    />
                  );
                }
                return (
                  <td
                    key={di}
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "4px 5px",
                      verticalAlign: "top",
                      minHeight: "70px",
                    }}
                  >
                    {/* 날짜 */}
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: "3px",
                      }}
                    >
                      {dayData.date}
                    </div>
                    {/* 식단 목록 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {dayData.breakfast && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "3px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#fb923c",
                              marginTop: "3px",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "10px", lineHeight: 1.35, color: "#374151", wordBreak: "keep-all" }}>
                            {dayData.breakfast}
                          </span>
                        </div>
                      )}
                      {dayData.lunch && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "3px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#22c55e",
                              marginTop: "3px",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "10px", lineHeight: 1.35, color: "#374151", wordBreak: "keep-all" }}>
                            {dayData.lunch}
                          </span>
                        </div>
                      )}
                      {dayData.dinner && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "3px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#f87171",
                              marginTop: "3px",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "10px", lineHeight: 1.35, color: "#374151", wordBreak: "keep-all" }}>
                            {dayData.dinner}
                          </span>
                        </div>
                      )}
                      {dayData.snack && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "3px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#9ca3af",
                              marginTop: "3px",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "10px", lineHeight: 1.35, color: "#374151", wordBreak: "keep-all" }}>
                            {dayData.snack}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 하단 문구 */}
      <p
        style={{
          textAlign: "center",
          fontSize: "10px",
          color: "#9ca3af",
          marginTop: "8px",
        }}
      >
        우아식 — 아이의 건강한 한 달 식단을 응원합니다 🍼
      </p>
    </div>
  );
}

// ── 식재료 구매 모달 ──

function ShoppingModal({
  weekMeals,
  monthlyPlan,
  currentWeek,
  onClose,
}: {
  weekMeals: Array<{ breakfast: string; lunch: string; dinner: string; snack: string }>;
  monthlyPlan: MonthPlan;
  currentWeek: (MonthDayMeal | null)[];
  onClose: () => void;
}) {
  const groups: CategoryGroup[] = useMemo(
    () => getWeekIngredientGroups(weekMeals),
    [weekMeals]
  );
  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);

  // 현재 주의 날짜 범위 계산
  const weekDates = currentWeek
    .filter((d): d is MonthDayMeal => d !== null)
    .map((d) => d.date);
  const weekStart = weekDates.length > 0 ? Math.min(...weekDates) : 0;
  const weekEnd = weekDates.length > 0 ? Math.max(...weekDates) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[88vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-text flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              이번 주 식재료 목록
            </h2>
            <p className="text-xs text-text-light mt-0.5">
              {monthlyPlan.month}월 {weekStart}일 ~ {weekEnd}일 · 총{" "}
              <span className="font-semibold text-primary">{totalCount}</span>가지
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 식재료 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {groups.length === 0 ? (
            <p className="text-center text-text-light text-sm py-10">
              식재료 정보를 찾을 수 없습니다.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.category}>
                {/* 카테고리 헤더 */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{group.emoji}</span>
                  <span className="text-xs font-bold text-text-light tracking-wide">
                    {group.category}
                  </span>
                  <span className="text-[10px] text-text-light bg-gray-100 rounded-full px-1.5 py-0.5">
                    {group.items.length}
                  </span>
                </div>

                {/* 식재료 행 */}
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl bg-gray-50 px-3 pt-2.5 pb-2"
                    >
                      {/* 이름·수량·구매 버튼 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none shrink-0">
                            {item.emoji}
                          </span>
                          <span className="text-sm font-semibold text-text">
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="text-xs font-medium text-primary shrink-0">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <a
                            href={getCoupangLink(item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-full transition-colors active:scale-95 inline-block"
                          >
                            쿠팡
                          </a>
                          <a
                            href={getKurlyLink(item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-2.5 py-1 rounded-full transition-colors active:scale-95 inline-block"
                          >
                            컬리
                          </a>
                        </div>
                      </div>
                      {/* 사용 메뉴명 */}
                      {item.meals.length > 0 && (
                        <p className="text-[10px] text-text-light mt-1 ml-6 leading-relaxed">
                          {item.meals.slice(0, 2).join(", ")}
                          {item.meals.length > 2 &&
                            ` 외 ${item.meals.length - 2}개`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 안내 */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100">
          <p className="text-[10px] text-text-light text-center">
            * 링크 클릭 시 해당 쇼핑몰 검색 결과로 이동합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 영양 성분 대시보드 모달 ──

function NutritionModal({
  currentWeek,
  stageName,
  monthlyPlan,
  onClose,
}: {
  currentWeek: (MonthDayMeal | null)[];
  stageName: string;
  monthlyPlan: MonthPlan;
  onClose: () => void;
}) {
  const weekData: NutritionDayResult[] = useMemo(
    () =>
      calcWeekNutrition(
        currentWeek.map((d) =>
          d
            ? { breakfast: d.breakfast, lunch: d.lunch, dinner: d.dinner, snack: d.snack }
            : null
        ),
        stageName
      ),
    [currentWeek, stageName]
  );

  const vitAvg = useMemo(() => weeklyVitaminAvg(weekData), [weekData]);

  // 탄단지 최대값 (막대 높이 정규화용)
  const maxMacro = Math.max(
    ...weekData.filter((d) => !d.empty).map((d) => d.carbs + d.protein + d.fat),
    1
  );

  const vitamins = [
    { key: "vitA",    label: "비타민 A",  val: vitAvg.vitA,    color: "bg-orange-400",  icon: "🥕" },
    { key: "vitC",    label: "비타민 C",  val: vitAvg.vitC,    color: "bg-green-500",   icon: "🍊" },
    { key: "vitD",    label: "비타민 D",  val: vitAvg.vitD,    color: "bg-yellow-400",  icon: "☀️" },
    { key: "calcium", label: "칼슘",      val: vitAvg.calcium, color: "bg-blue-400",    icon: "🥛" },
    { key: "iron",    label: "철분",      val: vitAvg.iron,    color: "bg-red-400",     icon: "🥩" },
  ] as const;

  function barColor(pct: number) {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-400";
    return "bg-red-400";
  }

  // 현재 주 날짜 범위
  const weekDates = currentWeek
    .filter((d): d is MonthDayMeal => d !== null)
    .map((d) => d.date);
  const weekStart = weekDates.length > 0 ? Math.min(...weekDates) : 0;
  const weekEnd   = weekDates.length > 0 ? Math.max(...weekDates) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-text flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
              이번 주 영양 성분 대시보드
            </h2>
            <p className="text-xs text-text-light mt-0.5">
              {monthlyPlan.month}월 {weekStart}일 ~ {weekEnd}일 · {stageName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* ── 탄·단·지 막대 차트 ── */}
          <section>
            <h3 className="text-sm font-bold text-text mb-1">탄·단·지 일별 섭취량</h3>
            <p className="text-xs text-text-light mb-4">막대가 높을수록 해당일 섭취량이 많아요</p>

            {/* 범례 */}
            <div className="flex gap-4 mb-3">
              {[
                { color: "bg-orange-400", label: "탄수화물" },
                { color: "bg-blue-500",   label: "단백질" },
                { color: "bg-purple-400", label: "지방" },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1 text-xs text-text-light">
                  <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  {l.label}
                </span>
              ))}
            </div>

            {/* 막대 그래프 */}
            <div className="relative">
              {/* y축 가이드라인 */}
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25].map((pct) => (
                  <div key={pct} className="flex items-center gap-1">
                    <span className="text-[8px] text-gray-300 w-4 text-right shrink-0">{pct}%</span>
                    <div className="flex-1 border-t border-dashed border-gray-100" />
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-1.5 pl-6 border-b border-gray-200" style={{ height: 152 }}>
                {weekData.map((day) => {
                  const total = day.carbs + day.protein + day.fat;
                  const BAR_MAX_PX = 120; // 라벨 영역 제외한 최대 막대 높이(px)
                  const barPx = day.empty ? 0 : Math.max(Math.round((total / maxMacro) * BAR_MAX_PX), 6);
                  return (
                    <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full flex flex-col-reverse rounded-t overflow-hidden transition-all duration-500"
                        style={{ height: barPx }}
                        title={day.empty ? "" : `탄${day.carbs}g 단${day.protein}g 지${day.fat}g`}
                      >
                        {!day.empty && total > 0 && (
                          <>
                            <div style={{ flex: day.carbs   }} className="bg-orange-400" />
                            <div style={{ flex: day.protein }} className="bg-blue-500" />
                            <div style={{ flex: day.fat     }} className="bg-purple-400" />
                          </>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium ${day.empty ? "text-gray-300" : "text-text-light"}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 수치 요약 */}
            <div className="mt-2 grid grid-cols-7 gap-1 pl-6">
              {weekData.map((day) => (
                <div key={day.label} className="text-center">
                  {!day.empty ? (
                    <p className="text-[9px] text-text-light leading-tight">
                      {day.carbs + day.protein + day.fat}g
                    </p>
                  ) : (
                    <p className="text-[9px] text-gray-200">—</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── 주요 영양소 주간 평균 충족도 ── */}
          <section>
            <h3 className="text-sm font-bold text-text mb-1">주요 영양소 주간 충족도</h3>
            <p className="text-xs text-text-light mb-4">이번 주 하루 평균 권장량 대비 충족도예요</p>

            <div className="space-y-3.5">
              {vitamins.map((vit) => (
                <div key={vit.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text flex items-center gap-1.5">
                      <span>{vit.icon}</span>
                      <span className="font-medium">{vit.label}</span>
                    </span>
                    <span className={`text-sm font-bold ${
                      vit.val >= 80 ? "text-green-600" :
                      vit.val >= 50 ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {vit.val}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(vit.val)}`}
                      style={{ width: `${vit.val}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-light mt-1">
                    {vit.val >= 80 ? "✅ 충분히 섭취하고 있어요" :
                     vit.val >= 50 ? "🟡 조금 더 섭취하면 좋아요" :
                                     "🔴 보충이 필요해요"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 안내 */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[10px] text-text-light leading-relaxed">
              💡 영양 성분은 식재료 구성 기준 <strong>근사치</strong>이며 실제와 다를 수 있어요.
              정확한 영양 섭취는 소아과 전문의와 상담하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
