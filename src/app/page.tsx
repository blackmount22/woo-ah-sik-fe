"use client";

import { useState, useEffect, useRef } from "react";
import ChildCountSelector from "@/components/ChildCountSelector";
import BirthDateInput from "@/components/BirthDateInput";
import WeightInput from "@/components/WeightInput";
import WeeklyMealPlan from "@/components/WeeklyMealPlan";
import FormulaResult from "@/components/FormulaResult";
import KakaoAdBanner from "@/components/KakaoAdBanner";
import GoogleAdBanner from "@/components/GoogleAdBanner";
import SiteFooter from "@/components/SiteFooter";
import InstallButton from "@/components/InstallButton";
import FridgeMealModal from "@/components/FridgeMealModal";
import FridgeMealResultCard from "@/components/FridgeMealResultCard";
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
import {
  generateFridgeMeals,
  getCurrentMealTime,
  type FridgeIngredient,
  type FridgeMealResult,
} from "@/lib/fridgeMeal";

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

// 생년월일 배열로부터 식단을 생성하는 순수 함수 (handleSubmit과 localStorage 복원 공용)
function buildPlans(
  selectedBirthDates: BirthDate[],
  selectedWeights: string[]
): ChildPlan[] {
  const allChildren = selectedBirthDates.map((d, i) => {
    const months = calcMonths(Number(d.year), Number(d.month), Number(d.day));
    const stage = getStage(months);
    return { index: i, label: childLabels[i], months, stage };
  });

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
      const plan: ChildPlan = {
        label: child.label,
        months: child.months,
        stage: child.stage,
        weeklyPlan: [],
        monthlyPlan: null,
      };
      if (selectedWeights[child.index]) {
        const weightKg = Number(selectedWeights[child.index]);
        plan.weightKg = weightKg;
        plan.formula = calcFormulaAmount(child.months, weightKg);
      }
      formulaResults.push(plan);
    }
  }

  const groups = groupChildrenByStage(menuChildren);
  const menuResults: ChildPlan[] = [];

  for (const group of groups) {
    if (group.children.length === 1) {
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

      const byStage = new Map<string, ChildInfo[]>();
      for (const child of group.children) {
        const key = getCanonicalStageName(child.stageName);
        const arr = byStage.get(key) || [];
        arr.push(child);
        byStage.set(key, arr);
      }

      for (const [canonicalStage, stageChildren] of byStage) {
        const baseChild = stageChildren.reduce((min, c) =>
          getStageOrder(c.stageName) <= getStageOrder(min.stageName) ? c : min
        );
        const stage = getStage(baseChild.months);
        const weeklyPlan = mergeWeeklyPlanForChild(sharedWeekly, canonicalStage);
        const monthlyPlan = sharedMonthly
          ? mergeMonthlyPlanForChild(sharedMonthly, canonicalStage)
          : null;

        if (stageChildren.length === 1) {
          menuResults.push({
            label: stageChildren[0].label,
            months: stageChildren[0].months,
            stage,
            weeklyPlan,
            monthlyPlan,
            unifiedGroup,
          });
        } else {
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

  const allResults = [...formulaResults, ...menuResults];
  const indexMap = new Map(allChildren.map((c) => [c.label, c.index]));
  const getMinIndex = (plan: ChildPlan) =>
    plan.combinedChildren
      ? Math.min(...plan.combinedChildren.map((c) => indexMap.get(c.label) ?? 0))
      : (indexMap.get(plan.label) ?? 0);
  allResults.sort((a, b) => getMinIndex(a) - getMinIndex(b));

  return allResults;
}

export default function Home() {
  const [childCount, setChildCount] = useState(1);
  const [birthDates, setBirthDates] = useState<BirthDate[]>(defaultBirthDates);
  const [weights, setWeights] = useState<string[]>(defaultWeights);
  const [plans, setPlans] = useState<ChildPlan[] | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [futureDateAlert, setFutureDateAlert] = useState<string | null>(null);
  const skipSave = useRef(false);

  // 냉장고 파먹기 관련 상태
  const [showModeModal, setShowModeModal] = useState(false);
  const [showFridgeModal, setShowFridgeModal] = useState(false);
  const [fridgeResults, setFridgeResults] = useState<FridgeMealResult[] | null>(null);
  const [fridgeFormulaPlans, setFridgeFormulaPlans] = useState<ChildPlan[]>([]);
  // 모달 확인용 임시 저장
  const pendingBirthDates = useRef<BirthDate[]>([]);
  const pendingWeights = useRef<string[]>([]);

  // localStorage에서 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.childCount) setChildCount(data.childCount);
        if (data.birthDates) setBirthDates(data.birthDates);
        if (data.weights) setWeights(data.weights);
        if (data.plans && data.birthDates) {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;

          // 저장된 식단의 월이 현재 월과 다르면 생년월일 기준으로 재생성
          // (개월수·단계도 현재 날짜 기준으로 업데이트됨)
          const needsRegen = data.plans.some(
            (p: ChildPlan) =>
              p.monthlyPlan &&
              (p.monthlyPlan.year !== currentYear ||
                p.monthlyPlan.month !== currentMonth)
          );

          if (needsRegen) {
            const count = data.childCount || 1;
            setPlans(
              buildPlans(
                (data.birthDates as BirthDate[]).slice(0, count),
                ((data.weights || []) as string[]).slice(0, count)
              )
            );
          } else {
            // 기존 데이터에 monthlyPlan이 없으면 생성 (마이그레이션)
            const migrated = data.plans.map((p: ChildPlan) => {
              if (p.stage.hasMenu && !p.monthlyPlan) {
                return { ...p, monthlyPlan: generateMonthlyPlan(p.months) };
              }
              return p;
            });
            setPlans(migrated);
          }
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

    // 유효성 통과 → 모드 선택 모달 표시
    pendingBirthDates.current = selected;
    pendingWeights.current = weights.slice(0, childCount);
    setShowModeModal(true);
  };

  // 기본 식단 생성 선택
  const handleModeNormal = () => {
    setShowModeModal(false);
    setPlans(
      buildPlans(pendingBirthDates.current, pendingWeights.current)
    );
  };

  // 냉장고 파먹기 선택
  const handleModeFridge = () => {
    setShowModeModal(false);
    setShowFridgeModal(true);
  };

  // 냉장고 재료 확정 → 식단 생성
  const handleFridgeConfirm = (ingredients: FridgeIngredient[]) => {
    setShowFridgeModal(false);

    const allChildren = pendingBirthDates.current.map((d, i) => {
      const months = calcMonths(Number(d.year), Number(d.month), Number(d.day));
      const stage = getStage(months);
      return { index: i, label: childLabels[i], months, stage };
    });

    const menuChildren = allChildren.filter((c) => c.stage.hasMenu);
    const formulaChildren = allChildren.filter((c) => !c.stage.hasMenu);

    if (menuChildren.length === 0) {
      // 모두 분유기 아기인 경우 → 기본 식단으로 대체
      setPlans(
        buildPlans(pendingBirthDates.current, pendingWeights.current)
      );
      return;
    }

    // 분유기 아이 플랜 구성 (순서 정렬용 index 포함)
    const formulaPlans: ChildPlan[] = formulaChildren.map((child) => {
      const plan: ChildPlan = {
        label: child.label,
        months: child.months,
        stage: child.stage,
        weeklyPlan: [],
        monthlyPlan: null,
      };
      const weightStr = pendingWeights.current[child.index];
      if (weightStr) {
        const weightKg = Number(weightStr);
        plan.weightKg = weightKg;
        plan.formula = calcFormulaAmount(child.months, weightKg);
      }
      return plan;
    });

    setFridgeFormulaPlans(formulaPlans);
    setFridgeResults(
      generateFridgeMeals(
        ingredients,
        menuChildren.map((c) => ({ label: c.label, months: c.months, childIndex: c.index }))
      )
    );
  };

  const handleReset = () => {
    skipSave.current = true;
    setChildCount(1);
    setBirthDates(defaultBirthDates());
    setWeights(defaultWeights());
    setPlans(null);
    setFridgeResults(null);
    setFridgeFormulaPlans([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 냉장고 파먹기 결과 화면
  if (fridgeResults) {
    const mealTimeIcon: Record<string, string> = { 아침: "🌅", 점심: "☀️", 저녁: "🌙" };
    const mealTime = fridgeResults[0]?.mealTime ?? getCurrentMealTime();

    // 식단 결과 + 분유 결과를 원래 아이 선택 순서대로 병합
    type DisplayItem =
      | { kind: "meal"; data: FridgeMealResult; sortIdx: number }
      | { kind: "formula"; data: ChildPlan; sortIdx: number };

    const combined: DisplayItem[] = [
      ...fridgeResults.map((r) => ({
        kind: "meal" as const,
        data: r,
        sortIdx: r.childIndex,
      })),
      ...fridgeFormulaPlans.map((p) => ({
        kind: "formula" as const,
        data: p,
        sortIdx: childLabels.indexOf(p.label),
      })),
    ];
    combined.sort((a, b) => a.sortIdx - b.sortIdx);

    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
        <main className="w-full max-w-md flex flex-col items-center gap-10">
          {/* 로고 */}
          <div className="text-center">
            <img src="/icons/icon-192.svg" alt="우아식 로고" className="w-16 h-16 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-primary tracking-tight">우아식</h1>
            <p className="mt-1 text-sm text-text-light">우리아이 식단표</p>
            <div className="mt-2">
              <InstallButton />
            </div>
          </div>

          {/* 타이틀 */}
          <div className="w-full text-center">
            <div className="text-3xl mb-2">{mealTimeIcon[mealTime] ?? "🍽️"}</div>
            <h2 className="text-xl font-bold text-text">
              오늘 {mealTime} 냉장고 파먹기 식단
            </h2>
            <p className="mt-1 text-sm text-text-light">
              입력하신 재료로 만든 맞춤 레시피예요
            </p>
          </div>

          {/* 결과 카드: 아이 순서대로 식단/분유 혼합 출력 */}
          {combined.map((item, i) =>
            item.kind === "formula" ? (
              item.data.formula && item.data.weightKg ? (
                <FormulaResult
                  key={i}
                  childLabel={item.data.label}
                  months={item.data.months}
                  stage={item.data.stage}
                  weightKg={item.data.weightKg}
                  formula={item.data.formula}
                />
              ) : null
            ) : (
              <FridgeMealResultCard key={i} result={item.data} />
            )
          )}

          {/* 다시 선택하기 */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
          >
            다시 선택하기
          </button>

          <KakaoAdBanner />
          <GoogleAdBanner />
        </main>
        <SiteFooter />
      </div>
    );
  }

  // 기본 식단표 결과 화면
  if (plans) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
        <main className="w-full max-w-md flex flex-col items-center gap-10">
          {/* 로고 */}
          <div className="text-center">
            <img src="/icons/icon-192.svg" alt="우아식 로고" className="w-16 h-16 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-primary tracking-tight">우아식</h1>
            <p className="mt-1 text-sm text-text-light">우리아이 식단표</p>
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
          <GoogleAdBanner />
        </main>
        <SiteFooter />
      </div>
    );
  }

  // 입력 폼 화면
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
      <main className="w-full max-w-md flex flex-col items-center gap-8">
        {/* 로고 / 타이틀 */}
        <div className="text-center">
          <img src="/icons/icon-192.svg" alt="우아식 로고" className="w-16 h-16 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-primary tracking-tight">우아식</h1>
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
        <GoogleAdBanner />

        {/* 모드 선택 모달 */}
        {showModeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-text text-center mb-1">
                오늘 식단을 어떻게 만들까요?
              </h2>
              <p className="text-sm text-text-light text-center mb-5">
                원하시는 방식을 선택해주세요
              </p>
              <div className="flex flex-col gap-3">
                {/* 냉장고 파먹기 */}
                <button
                  type="button"
                  onClick={handleModeFridge}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-[0.98] text-left"
                >
                  <span className="text-3xl flex-shrink-0">🧊</span>
                  <div>
                    <p className="font-bold text-primary text-base">냉장고 파먹기</p>
                    <p className="text-xs text-text-light mt-0.5 leading-relaxed">
                      냉장고 재료를 입력하면
                      <br />
                      오늘의 맞춤 레시피를 만들어드려요
                    </p>
                  </div>
                </button>
                {/* 기본 식단 생성 */}
                <button
                  type="button"
                  onClick={handleModeNormal}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-white hover:bg-gray-50 transition-all active:scale-[0.98] text-left"
                >
                  <span className="text-3xl flex-shrink-0">🥄</span>
                  <div>
                    <p className="font-bold text-text text-base">식단 생성</p>
                    <p className="text-xs text-text-light mt-0.5 leading-relaxed">
                      아이 나이에 맞는
                      <br />
                      주간·월간 식단표를 생성해요
                    </p>
                  </div>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowModeModal(false)}
                className="mt-4 w-full py-2.5 rounded-xl text-sm text-text-light border border-border hover:bg-gray-50 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 냉장고 파먹기 재료 입력 모달 */}
        {showFridgeModal && (
          <FridgeMealModal
            onConfirm={handleFridgeConfirm}
            onClose={() => setShowFridgeModal(false)}
          />
        )}

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
      <SiteFooter />
    </div>
  );
}
