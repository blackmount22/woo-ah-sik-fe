"use client";

import { useState, useEffect, useRef } from "react";
import ChildCountSelector from "@/components/ChildCountSelector";
import BirthDateInput from "@/components/BirthDateInput";
import WeightInput from "@/components/WeightInput";
import WeeklyMealPlan from "@/components/WeeklyMealPlan";
import FormulaResult from "@/components/FormulaResult";
import KakaoAdBanner from "@/components/KakaoAdBanner";
import InstallButton from "@/components/InstallButton";
import {
  calcMonths,
  getStage,
  generateWeeklyPlan,
  generateMonthlyPlan,
  calcFormulaAmount,
  groupChildrenByStage,
  generateWeeklyPlanFromPool,
  generateMonthlyPlanFromPool,
  generateWeeklyPlanFromMergedPool,
  generateMonthlyPlanFromMergedPool,
  areMergeableStages,
  mergeWeeklyPlanForChild,
  mergeMonthlyPlanForChild,
  getCanonicalStageName,
  getStageOrder,
  type DayMeal,
  type MonthPlan,
  type Stage,
  type FormulaAmount,
  type ChildInfo,
} from "@/lib/mealPlan";

interface BirthDate {
  year: string;
  month: string;
  day: string;
}

interface UnifiedGroup {
  baseStageName: string;
  groupSize: number;
  childLabels: string[];
}

interface ChildPlan {
  label: string;
  months: number;
  stage: Stage;
  weeklyPlan: DayMeal[];
  monthlyPlan: MonthPlan | null;
  weightKg?: number;
  formula?: FormulaAmount;
  unifiedGroup?: UnifiedGroup;
  combinedChildren?: { label: string; months: number }[];
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
  const [futureDateAlert, setFutureDateAlert] = useState<string | null>(null);
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
        if (data.plans) {
          // 기존 데이터에 monthlyPlan이 없으면 생성
          const migrated = data.plans.map((p: ChildPlan) => {
            if (p.stage.hasMenu && !p.monthlyPlan) {
              return { ...p, monthlyPlan: generateMonthlyPlan(p.months) };
            }
            return p;
          });
          setPlans(migrated);
        }
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

    // 미래 날짜 검증
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < selected.length; i++) {
      const d = selected[i];
      const birth = new Date(Number(d.year), Number(d.month) - 1, Number(d.day));
      if (birth > today) {
        setFutureDateAlert(
          childCount > 1
            ? `${childLabels[i]}의 생년월일이 아직 지나지 않은 날짜예요.\n태어나지 않은 아이는 식단을 생성할 수 없어요.`
            : "생년월일이 아직 지나지 않은 날짜예요.\n태어나지 않은 아이는 식단을 생성할 수 없어요."
        );
        return;
      }
    }

    // 1. 모든 아이의 월령/단계 계산
    const allChildren = selected.map((d, i) => {
      const months = calcMonths(Number(d.year), Number(d.month), Number(d.day));
      const stage = getStage(months);
      return { index: i, label: childLabels[i], months, stage };
    });

    // 2. 메뉴 아이 vs 분유기 아이 분리
    const menuChildren: ChildInfo[] = [];
    const formulaResults: ChildPlan[] = [];

    for (const child of allChildren) {
      if (child.stage.hasMenu) {
        menuChildren.push({
          index: child.index,
          label: child.label,
          months: child.months,
          stageName: child.stage.name,
        });
      } else {
        // 분유기 아이: 기존 로직 유지
        const plan: ChildPlan = {
          label: child.label,
          months: child.months,
          stage: child.stage,
          weeklyPlan: [],
          monthlyPlan: null,
        };
        if (weights[child.index]) {
          const weightKg = Number(weights[child.index]);
          plan.weightKg = weightKg;
          plan.formula = calcFormulaAmount(child.months, weightKg);
        }
        formulaResults.push(plan);
      }
    }

    // 3. 호환 그룹 생성
    const groups = groupChildrenByStage(menuChildren);

    // 4. 그룹별 식단 생성
    const menuResults: ChildPlan[] = [];

    for (const group of groups) {
      if (group.children.length === 1) {
        // 단독 그룹: 기존처럼 독립 생성
        const child = group.children[0];
        const stage = getStage(child.months);
        menuResults.push({
          label: child.label,
          months: child.months,
          stage,
          weeklyPlan: generateWeeklyPlan(child.months),
          monthlyPlan: generateMonthlyPlan(child.months),
        });
      } else {
        // 통합 그룹: 공유 식단 생성
        // 유아식+일반유아식처럼 통합 병합 가능한 그룹은 두 풀을 합쳐 더 다양한 식단 제공
        const baseStageName = group.baseStageName;
        const allStageNames = group.children.map((c) => c.stageName);
        const useMerged = areMergeableStages(allStageNames);
        const sharedWeekly = useMerged
          ? generateWeeklyPlanFromMergedPool(allStageNames)
          : generateWeeklyPlanFromPool(baseStageName);
        const sharedMonthly = useMerged
          ? generateMonthlyPlanFromMergedPool(allStageNames)
          : generateMonthlyPlanFromPool(baseStageName);

        const unifiedGroup: UnifiedGroup = {
          baseStageName,
          groupSize: group.children.length,
          childLabels: group.children.map((c) => c.label),
        };

        // canonical 단계명 기준으로 서브그룹화
        // (예: 유아식 + 일반 유아식은 동일 풀이므로 하나의 카드로 통합)
        const byStage = new Map<string, ChildInfo[]>();
        for (const child of group.children) {
          const key = getCanonicalStageName(child.stageName);
          const arr = byStage.get(key) || [];
          arr.push(child);
          byStage.set(key, arr);
        }

        for (const [canonicalStage, stageChildren] of byStage) {
          // 표시용 stage: 그룹 내 가장 낮은 단계 기준
          const baseChild = stageChildren.reduce((min, c) =>
            getStageOrder(c.stageName) <= getStageOrder(min.stageName) ? c : min
          );
          const stage = getStage(baseChild.months);
          const weeklyPlan = mergeWeeklyPlanForChild(sharedWeekly, canonicalStage);
          const monthlyPlan = sharedMonthly
            ? mergeMonthlyPlanForChild(sharedMonthly, canonicalStage)
            : null;

          if (stageChildren.length === 1) {
            // 단독 단계: 개별 카드
            menuResults.push({
              label: stageChildren[0].label,
              months: stageChildren[0].months,
              stage,
              weeklyPlan,
              monthlyPlan,
              unifiedGroup,
            });
          } else {
            // 같은 (canonical) 단계 아이들: 하나의 통합 카드로 합침
            menuResults.push({
              label: stageChildren.map((c) => c.label).join(" · "),
              months: baseChild.months,
              stage,
              weeklyPlan,
              monthlyPlan,
              unifiedGroup,
              combinedChildren: stageChildren.map((c) => ({
                label: c.label,
                months: c.months,
              })),
            });
          }
        }
      }
    }

    // 5. 원래 순서대로 정렬 (index 기준, 통합 카드는 첫 아이 기준)
    const allResults = [...formulaResults, ...menuResults];
    const indexMap = new Map(allChildren.map((c) => [c.label, c.index]));
    const getMinIndex = (plan: ChildPlan) =>
      plan.combinedChildren
        ? Math.min(...plan.combinedChildren.map((c) => indexMap.get(c.label) ?? 0))
        : (indexMap.get(plan.label) ?? 0);
    allResults.sort((a, b) => getMinIndex(a) - getMinIndex(b));

    setPlans(allResults);
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
      <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
        <main className="w-full max-w-md flex flex-col items-center gap-10">
          {/* 로고 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              우아식
            </h1>
            <p className="mt-1 text-sm text-text-light">
              우리아이 식단표
            </p>
            <div className="mt-2">
              <InstallButton />
            </div>
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
                monthlyPlan={plan.monthlyPlan}
                unifiedGroup={plan.unifiedGroup}
                combinedChildren={plan.combinedChildren}
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

          <KakaoAdBanner />
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
          <div className="mt-2">
            <InstallButton />
          </div>
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

        <KakaoAdBanner />

        {/* 미래 날짜 알림 모달 */}
        {futureDateAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
              <div className="text-4xl mb-3">🍼</div>
              <p className="text-base text-text whitespace-pre-line leading-relaxed">
                {futureDateAlert}
              </p>
              <button
                type="button"
                onClick={() => setFutureDateAlert(null)}
                className="mt-5 w-full py-3 rounded-xl text-base font-bold bg-primary text-white hover:bg-primary-dark transition-all active:scale-[0.98]"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
