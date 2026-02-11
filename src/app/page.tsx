"use client";

import { useState } from "react";
import ChildCountSelector from "@/components/ChildCountSelector";
import BirthDateInput from "@/components/BirthDateInput";
import WeeklyMealPlan from "@/components/WeeklyMealPlan";
import {
  calcMonths,
  getStage,
  generateWeeklyPlan,
  type DayMeal,
  type Stage,
} from "@/lib/mealPlan";

interface BirthDate {
  year: string;
  month: string;
  day: string;
}

interface ChildPlan {
  label: string;
  months: number;
  stage: Stage;
  weeklyPlan: DayMeal[];
}

const childLabels = ["첫째 아이", "둘째 아이", "셋째 아이", "넷째 아이"];

export default function Home() {
  const [childCount, setChildCount] = useState(1);
  const [birthDates, setBirthDates] = useState<BirthDate[]>(
    Array.from({ length: 4 }, () => ({ year: "", month: "", day: "" }))
  );
  const [plans, setPlans] = useState<ChildPlan[] | null>(null);

  const handleChildCountChange = (count: number) => {
    setChildCount(count);
  };

  const handleBirthDateChange = (
    index: number,
    field: "year" | "month" | "day",
    value: string
  ) => {
    setBirthDates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "month" || field === "year") {
        next[index].day = "";
      }
      return next;
    });
  };

  const isFormComplete = birthDates
    .slice(0, childCount)
    .every((d) => d.year && d.month && d.day);

  const handleSubmit = () => {
    if (!isFormComplete) return;

    const selected = birthDates.slice(0, childCount);
    const generated = selected.map((d, i) => {
      const months = calcMonths(Number(d.year), Number(d.month), Number(d.day));
      const stage = getStage(months);
      const weeklyPlan = generateWeeklyPlan(months);
      return {
        label: childLabels[i],
        months,
        stage,
        weeklyPlan,
      };
    });

    setPlans(generated);
  };

  const handleReset = () => {
    setPlans(null);
  };

  // 식단표 결과 화면
  if (plans) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
        <main className="w-full max-w-md flex flex-col items-center gap-10">
          {/* 로고 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              우아식
            </h1>
            <p className="mt-1 text-sm text-text-light">
              일주일 식단표
            </p>
          </div>

          {/* 자녀별 식단표 */}
          {plans.map((plan, i) => (
            <WeeklyMealPlan
              key={i}
              childLabel={plan.label}
              months={plan.months}
              stage={plan.stage}
              weeklyPlan={plan.weeklyPlan}
            />
          ))}

          {/* 다시 선택하기 버튼 */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
          >
            다시 선택하기
          </button>
        </main>
      </div>
    );
  }

  // 입력 폼 화면
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
      <main className="w-full max-w-md flex flex-col items-center gap-8">
        {/* 로고 / 타이틀 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            우아식
          </h1>
          <p className="mt-1 text-sm text-text-light">우리아이식단</p>
        </div>

        {/* 서비스 소개 */}
        <p className="text-center text-text-light leading-relaxed text-sm">
          우리 아이의 나이에 맞는
          <br />
          건강한 식단을 추천해드려요.
        </p>

        {/* 자녀 수 선택 */}
        <ChildCountSelector
          count={childCount}
          onChange={handleChildCountChange}
        />

        {/* 생년월일 입력 */}
        <div className="w-full flex flex-col gap-4">
          {Array.from({ length: childCount }, (_, i) => (
            <BirthDateInput
              key={i}
              index={i}
              year={birthDates[i].year}
              month={birthDates[i].month}
              day={birthDates[i].day}
              onChange={(field, value) =>
                handleBirthDateChange(i, field, value)
              }
            />
          ))}
        </div>

        {/* 시작하기 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
            isFormComplete
              ? "bg-primary text-white shadow-lg hover:bg-primary-dark active:scale-[0.98]"
              : "bg-border text-text-light cursor-not-allowed"
          }`}
        >
          시작하기
        </button>
      </main>
    </div>
  );
}
