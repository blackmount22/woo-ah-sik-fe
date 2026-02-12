"use client";

import { useState, useEffect, useRef } from "react";
import ChildCountSelector from "@/components/ChildCountSelector";
import BirthDateInput from "@/components/BirthDateInput";
import WeightInput from "@/components/WeightInput";
import WeeklyMealPlan from "@/components/WeeklyMealPlan";
import FormulaResult from "@/components/FormulaResult";
import AdBanner from "@/components/AdBanner";
import {
  calcMonths,
  getStage,
  generateWeeklyPlan,
  calcFormulaAmount,
  type DayMeal,
  type Stage,
  type FormulaAmount,
} from "@/lib/mealPlan";

const AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
const AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "";

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
  weightKg?: number;
  formula?: FormulaAmount;
}

const childLabels = ["첫째 아이", "둘째 아이", "셋째 아이", "넷째 아이"];

const STORAGE_KEY = "woo-ah-sik-child-data";

const defaultBirthDates = (): BirthDate[] =>
  Array.from({ length: 4 }, () => ({ year: "", month: "", day: "" }));
const defaultWeights = (): string[] => Array(4).fill("");

export default function Home() {
  const [childCount, setChildCount] = useState(1);
  const [birthDates, setBirthDates] = useState<BirthDate[]>(defaultBirthDates);
  const [weights, setWeights] = useState<string[]>(defaultWeights);
  const [plans, setPlans] = useState<ChildPlan[] | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const skipSave = useRef(false);

  // localStorage에서 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.childCount) setChildCount(data.childCount);
        if (data.birthDates) setBirthDates(data.birthDates);
        if (data.weights) setWeights(data.weights);
        if (data.plans) setPlans(data.plans);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    if (!hydrated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ childCount, birthDates, weights, plans })
    );
  }, [childCount, birthDates, weights, plans, hydrated]);

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

  const handleWeightChange = (index: number, value: string) => {
    setWeights((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // 생년월일이 완전히 입력된 아이의 월령 계산 (분유기 아기 감지용)
  const isFormulaChild = (index: number) => {
    const d = birthDates[index];
    if (!d.year || !d.month || !d.day) return false;
    const months = calcMonths(Number(d.year), Number(d.month), Number(d.day));
    return !getStage(months).hasMenu;
  };

  const isFormComplete = birthDates
    .slice(0, childCount)
    .every((d, i) => {
      const dateComplete = d.year && d.month && d.day;
      if (!dateComplete) return false;
      // 분유기 아기는 몸무게도 입력 필요
      if (isFormulaChild(i)) return weights[i] !== "" && Number(weights[i]) > 0;
      return true;
    });

  const handleSubmit = () => {
    if (!isFormComplete) return;

    const selected = birthDates.slice(0, childCount);
    const generated = selected.map((d, i) => {
      const months = calcMonths(Number(d.year), Number(d.month), Number(d.day));
      const stage = getStage(months);
      const weeklyPlan = generateWeeklyPlan(months);

      const plan: ChildPlan = {
        label: childLabels[i],
        months,
        stage,
        weeklyPlan,
      };

      // 분유기 아기면 분유량 계산 결과 포함
      if (!stage.hasMenu && weights[i]) {
        const weightKg = Number(weights[i]);
        plan.weightKg = weightKg;
        plan.formula = calcFormulaAmount(months, weightKg);
      }

      return plan;
    });

    setPlans(generated);
  };

  const handleReset = () => {
    skipSave.current = true;
    setChildCount(1);
    setBirthDates(defaultBirthDates());
    setWeights(defaultWeights());
    setPlans(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 식단표 결과 화면
  if (plans) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8 pb-20 sm:py-16">
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
          {plans.map((plan, i) =>
            plan.formula && plan.weightKg ? (
              <FormulaResult
                key={i}
                childLabel={plan.label}
                months={plan.months}
                stage={plan.stage}
                weightKg={plan.weightKg}
                formula={plan.formula}
              />
            ) : (
              <WeeklyMealPlan
                key={i}
                childLabel={plan.label}
                months={plan.months}
                stage={plan.stage}
                weeklyPlan={plan.weeklyPlan}
              />
            )
          )}

          {/* 다시 선택하기 버튼 */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
          >
            다시 선택하기
          </button>
        </main>

        {AD_CLIENT && AD_SLOT && (
          <AdBanner adClient={AD_CLIENT} adSlot={AD_SLOT} />
        )}
      </div>
    );
  }

  // 입력 폼 화면
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 pb-20 sm:py-16">
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
            <div key={i} className="flex flex-col gap-4">
              <BirthDateInput
                index={i}
                year={birthDates[i].year}
                month={birthDates[i].month}
                day={birthDates[i].day}
                onChange={(field, value) =>
                  handleBirthDateChange(i, field, value)
                }
              />
              {isFormulaChild(i) && (
                <WeightInput
                  index={i}
                  weight={weights[i]}
                  onChange={(value) => handleWeightChange(i, value)}
                />
              )}
            </div>
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

      {AD_CLIENT && AD_SLOT && (
        <AdBanner adClient={AD_CLIENT} adSlot={AD_SLOT} />
      )}
    </div>
  );
}
