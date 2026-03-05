"use client";

import { useMemo } from "react";

interface Dish {
  name: string;
  role: "staple" | "main" | "soup" | "side";
}

interface Meal {
  dishes: Dish[];
  ingredients: string[];
  tip: string;
}

type MealTime = "아침" | "점심" | "저녁";

const MEALS: Record<MealTime, Meal[]> = {
  아침: [
    {
      dishes: [
        { name: "달걀볶음밥", role: "main" },
        { name: "두부된장국", role: "soup" },
        { name: "브로콜리무침", role: "side" },
      ],
      ingredients: ["달걀 2개", "밥 1공기", "당근 1/4개", "두부 1/4모", "된장 1큰술", "브로콜리 50g", "간장·참기름"],
      tip: "달걀은 스크램블 상태로 먼저 익혀두었다가 밥과 섞으면 더 고소하게 완성돼요.",
    },
    {
      dishes: [
        { name: "닭고기야채죽", role: "main" },
        { name: "달걀말이", role: "side" },
        { name: "김", role: "side" },
      ],
      ingredients: ["닭다리살 50g", "쌀 1/2컵", "당근 1/4개", "양파 1/4개", "달걀 2개", "참기름·소금", "김 1장"],
      tip: "죽은 끓이는 내내 계속 저어야 냄비 바닥에 눌어붙지 않아요.",
    },
    {
      dishes: [
        { name: "치즈 스크램블 토스트", role: "main" },
        { name: "방울토마토", role: "side" },
        { name: "우유", role: "side" },
      ],
      ingredients: ["식빵 2장", "달걀 2개", "슬라이스치즈 1장", "방울토마토 5개", "우유 1컵", "버터 약간"],
      tip: "달걀은 약불에서 천천히 저어야 부드럽고 촉촉한 스크램블이 완성돼요.",
    },
  ],
  점심: [
    {
      dishes: [
        { name: "밥", role: "staple" },
        { name: "소고기된장찌개", role: "soup" },
        { name: "달걀찜", role: "side" },
        { name: "애호박볶음", role: "side" },
      ],
      ingredients: ["소고기 50g", "된장 1.5큰술", "두부 1/4모", "애호박 1/4개", "달걀 2개", "감자 1/2개", "대파"],
      tip: "된장찌개에 감자를 함께 넣으면 국물이 걸쭉하고 달콤해져요.",
    },
    {
      dishes: [
        { name: "밥", role: "staple" },
        { name: "닭고기야채볶음", role: "main" },
        { name: "콩나물국", role: "soup" },
        { name: "두부조림", role: "side" },
      ],
      ingredients: ["닭가슴살 70g", "양파 1/4개", "당근 1/4개", "콩나물 100g", "두부 1/4모", "간장 2큰술", "참기름"],
      tip: "닭고기는 미리 끓는 물에 한 번 데쳐서 잡내를 없애주세요.",
    },
    {
      dishes: [
        { name: "밥", role: "staple" },
        { name: "소고기미역국", role: "soup" },
        { name: "감자조림", role: "side" },
        { name: "달걀말이", role: "side" },
      ],
      ingredients: ["소고기 50g", "미역 10g", "감자 1개", "달걀 2개", "간장·참기름", "설탕 약간"],
      tip: "미역은 참기름에 소고기와 함께 먼저 볶은 뒤 물을 부어야 국물이 진해요.",
    },
  ],
  저녁: [
    {
      dishes: [
        { name: "밥", role: "staple" },
        { name: "소고기무국", role: "soup" },
        { name: "삼치구이", role: "main" },
        { name: "시금치나물", role: "side" },
      ],
      ingredients: ["소고기 50g", "무 1/4개", "삼치 1토막", "시금치 100g", "간장·참기름", "소금"],
      tip: "무는 나박나박 얇게 썰어야 빨리 익고 아이가 먹기 좋게 부드러워요.",
    },
    {
      dishes: [
        { name: "밥", role: "staple" },
        { name: "닭고기콩나물국", role: "soup" },
        { name: "달걀찜", role: "main" },
        { name: "오이무침", role: "side" },
      ],
      ingredients: ["닭다리살 70g", "콩나물 100g", "달걀 3개", "오이 1/2개", "간장·참기름", "소금"],
      tip: "콩나물국은 뚜껑을 닫고 끓여야 비린내 없이 시원한 국물이 나와요.",
    },
    {
      dishes: [
        { name: "밥", role: "staple" },
        { name: "돼지고기두부조림", role: "main" },
        { name: "미역국", role: "soup" },
        { name: "브로콜리무침", role: "side" },
      ],
      ingredients: ["돼지고기(앞다리살) 70g", "두부 1/2모", "미역 10g", "브로콜리 80g", "간장 2큰술", "설탕 1큰술", "참기름"],
      tip: "두부는 키친타올로 물기를 제거한 뒤 조리해야 간이 잘 배고 부서지지 않아요.",
    },
  ],
};

const MEAL_TIME_ICON: Record<MealTime, string> = {
  아침: "🌅",
  점심: "☀️",
  저녁: "🌙",
};

const ROLE_STYLE: Record<Dish["role"], string> = {
  staple: "bg-amber-50 text-amber-700 border border-amber-200",
  main:   "bg-primary/10 text-primary border border-primary/20",
  soup:   "bg-blue-50 text-blue-600 border border-blue-200",
  side:   "bg-green-50 text-green-700 border border-green-200",
};

const ROLE_LABEL: Record<Dish["role"], string> = {
  staple: "주식",
  main:   "메인",
  soup:   "국·찌개",
  side:   "반찬",
};

function getCurrentMealTime(): MealTime {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "아침";
  if (h >= 11 && h < 16) return "점심";
  return "저녁";
}

interface Props {
  onClose: () => void;
}

export default function TodayMenuModal({ onClose }: Props) {
  const mealTime = getCurrentMealTime();
  const meal = useMemo(() => {
    const options = MEALS[mealTime];
    return options[Math.floor(Math.random() * options.length)];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{MEAL_TIME_ICON[mealTime]}</span>
            <div>
              <h2 className="text-base font-bold text-text leading-tight">오늘의 추천 메뉴</h2>
              <p className="text-xs text-text-light">{mealTime} · 만 3세 이상 · 순한맛</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* 메뉴 구성 */}
          <section>
            <p className="text-xs font-semibold text-text-light uppercase tracking-wide mb-2">오늘의 식단 구성</p>
            <div className="flex flex-wrap gap-2">
              {meal.dishes.map((dish) => (
                <span
                  key={dish.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${ROLE_STYLE[dish.role]}`}
                >
                  <span className="text-[10px] font-bold opacity-60">{ROLE_LABEL[dish.role]}</span>
                  {dish.name}
                </span>
              ))}
            </div>
          </section>

          {/* 재료 */}
          <section>
            <p className="text-xs font-semibold text-text-light uppercase tracking-wide mb-2">필요한 재료</p>
            <div className="flex flex-wrap gap-1.5">
              {meal.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-text-light"
                >
                  {ing}
                </span>
              ))}
            </div>
          </section>

          {/* 조리 팁 */}
          <section className="flex gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-lg shrink-0">💡</span>
            <p className="text-sm text-amber-800 leading-relaxed">{meal.tip}</p>
          </section>

          {/* 안내 */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            매운 재료 없이 구성된 순한맛 식단이에요.
            <br />
            알레르기 재료는 미리 확인해주세요.
          </p>
        </div>

        {/* 하단 버튼 */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
