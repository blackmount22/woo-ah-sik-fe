// 개월수 계산
export function calcMonths(year: number, month: number, day: number): number {
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  return Math.max(0, months);
}

// 이유식 단계
export interface Stage {
  name: string;
  mealsPerDay: string;
  description: string;
  hasMenu: boolean;
}

export function getStage(months: number): Stage {
  if (months <= 3)
    return {
      name: "모유/분유기",
      mealsPerDay: "수유",
      description: "모유 또는 분유 수유 중입니다.",
      hasMenu: false,
    };
  if (months <= 5)
    return {
      name: "초기 이유식",
      mealsPerDay: "1일 1회",
      description: "미음 위주의 초기 이유식 단계입니다.",
      hasMenu: true,
    };
  if (months <= 7)
    return {
      name: "중기 이유식",
      mealsPerDay: "1일 1~2회",
      description: "묽은 죽 위주의 중기 이유식 단계입니다.",
      hasMenu: true,
    };
  if (months <= 9)
    return {
      name: "후기 이유식",
      mealsPerDay: "1일 2~3회",
      description: "된죽/무른밥의 후기 이유식 단계입니다.",
      hasMenu: true,
    };
  if (months <= 11)
    return {
      name: "완료기 이유식",
      mealsPerDay: "1일 3회",
      description: "진밥과 반찬의 완료기 이유식 단계입니다.",
      hasMenu: true,
    };
  if (months <= 35)
    return {
      name: "유아식",
      mealsPerDay: "1일 3회 + 간식",
      description: "밥, 국, 반찬의 유아식 단계입니다.",
      hasMenu: true,
    };
  return {
    name: "일반 유아식",
    mealsPerDay: "1일 3회 + 간식",
    description: "일반 유아식을 먹을 수 있는 단계입니다.",
    hasMenu: true,
  };
}

// 분유량 계산
export interface FormulaAmount {
  dailyTotal: number;
  perFeedingMin: number;
  perFeedingMax: number;
  feedingsPerDay: number;
  intervalDesc: string;
}

export function calcFormulaAmount(
  months: number,
  weightKg: number
): FormulaAmount {
  // 체중 기준 하루 권장량 (150ml/kg), 4개월 미만은 1000ml 초과 금지
  const rawDaily = Math.round(weightKg * 150);
  const dailyTotal = Math.min(rawDaily, 1000);

  // 월령별 수유 횟수·간격
  let intervalDesc: string;
  let feedingsPerDay: number;

  if (months < 1) {
    feedingsPerDay = 8;
    intervalDesc = "3시간";
  } else if (months < 2) {
    feedingsPerDay = 6;
    intervalDesc = "4시간";
  } else if (months < 3) {
    feedingsPerDay = 5;
    intervalDesc = "약 5시간";
  } else {
    feedingsPerDay = 5;
    intervalDesc = "약 5시간";
  }

  // 체중 기반 1회 적정량 계산 (10ml 단위, 하루 총량 초과 방지)
  const perFeedingMax = Math.floor(dailyTotal / feedingsPerDay / 10) * 10;
  const perFeedingMin = Math.max(perFeedingMax - 20, 10);

  return { dailyTotal, perFeedingMin, perFeedingMax, feedingsPerDay, intervalDesc };
}

// 식단 데이터 풀
interface MealPool {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snack: string[];
}

const mealPools: Record<string, MealPool> = {
  "초기 이유식": {
    breakfast: [
      "쌀미음",
      "찹쌀미음",
      "오트밀미음",
      "감자미음",
      "고구마미음",
      "애호박미음",
      "브로콜리미음",
      "당근미음",
      "단호박미음",
      "시금치미음",
      "배미음",
      "바나나미음",
      "소고기미음",
      "양파미음",
    ],
    lunch: [
      "쌀미음",
      "찹쌀미음",
      "감자미음",
      "고구마미음",
      "애호박미음",
      "양배추미음",
      "청경채미음",
      "당근미음",
      "무미음",
      "단호박미음",
      "콜리플라워미음",
      "배미음",
      "완두콩미음",
      "소고기미음",
    ],
    dinner: [],
    snack: [],
  },
  "중기 이유식": {
    breakfast: [
      "소고기당근죽",
      "닭고기감자죽",
      "소고기애호박죽",
      "소고기브로콜리죽",
      "닭고기양배추죽",
      "소고기시금치죽",
      "닭고기고구마죽",
      "소고기단호박죽",
      "닭고기무죽",
      "소고기오트밀야채죽",
      "연어감자죽",
      "소고기두부죽",
      "닭고기시금치죽",
      "소고기옥수수죽",
    ],
    lunch: [
      "소고기배추죽",
      "소고기무죽",
      "닭고기단호박죽",
      "소고기청경채죽",
      "닭고기비타민죽",
      "소고기양파죽",
      "소고기완두콩죽",
      "닭고기브로콜리죽",
      "소고기감자죽",
      "대구살당근죽",
      "닭고기당근죽",
      "소고기미역죽",
      "소고기고구마죽",
      "닭고기애호박죽",
    ],
    dinner: [],
    snack: [],
  },
  "후기 이유식": {
    breakfast: [
      "소고기야채된죽",
      "닭고기감자무른밥",
      "소고기당근무른밥",
      "연어브로콜리죽",
      "소고기시금치무른밥",
      "닭고기단호박된죽",
      "소고기애호박무른밥",
      "닭고기브로콜리무른밥",
      "대구살감자된죽",
      "소고기양배추된죽",
      "연어야채무른밥",
      "닭고기시금치무른밥",
      "소고기오트밀야채된죽",
      "소고기무된죽",
    ],
    lunch: [
      "소고기배추무른밥",
      "닭고기양배추무른밥",
      "대구살야채죽",
      "소고기두부무른밥",
      "닭고기완두콩무른밥",
      "소고기고구마무른밥",
      "연어감자무른밥",
      "닭고기두부무른밥",
      "소고기무무른밥",
      "대구살브로콜리무른밥",
      "소고기양파무른밥",
      "닭고기고구마된죽",
      "소고기단호박무른밥",
      "연어당근무른밥",
    ],
    dinner: [
      "소고기무른밥 + 배추국",
      "닭고기무른밥 + 미역국",
      "소고기야채무른밥",
      "두부야채무른밥",
      "소고기감자무른밥",
      "닭고기당근무른밥",
      "소고기단호박무른밥",
      "닭고기야채무른밥 + 국",
      "소고기배추무른밥 + 미역국",
      "대구살무른밥 + 배추국",
      "소고기브로콜리무른밥 + 국",
      "닭고기감자무른밥 + 미역국",
      "두부당근무른밥 + 국",
      "소고기양파무른밥 + 국",
    ],
    snack: [
      "바나나",
      "찐고구마",
      "사과퓨레",
      "배퓨레",
      "찐감자",
      "떡뻥",
      "아기과자",
      "단호박찜",
      "당근스틱",
      "찐브로콜리",
      "아보카도",
      "감자볼",
      "고구마볼",
      "과일요거트",
    ],
  },
  "완료기 이유식": {
    breakfast: [
      "소고기야채진밥",
      "닭고기볶음밥",
      "소고기당근밥 + 미역국",
      "계란야채죽",
      "소고기시금치밥",
      "닭고기감자밥",
      "소고기브로콜리밥",
      "소고기고구마밥",
      "연어볶음밥",
      "소고기두부밥",
      "계란볶음밥",
      "닭고기단호박밥",
      "소고기감자밥 + 배추국",
      "닭고기시금치밥",
    ],
    lunch: [
      "소고기완자 + 진밥",
      "닭고기야채볶음밥",
      "소고기배추국 + 밥",
      "두부조림 + 진밥",
      "소고기미역국 + 밥",
      "닭고기무국 + 밥",
      "연어야채밥",
      "닭고기감자조림 + 밥",
      "소고기된장국 + 밥",
      "연어감자밥 + 국",
      "대구야채밥",
      "소고기두부조림 + 밥",
      "닭고기단호박밥 + 국",
      "소고기고구마조림 + 밥",
    ],
    dinner: [
      "소고기무국 + 진밥",
      "닭볶음탕 + 밥",
      "소고기감자조림 + 밥",
      "두부된장국 + 밥",
      "소고기야채국 + 밥",
      "닭고기미역국 + 밥",
      "소고기시금치국 + 밥",
      "닭고기야채국 + 밥",
      "소고기애호박국 + 밥",
      "연어진밥 + 미역국",
      "두부완자 + 밥",
      "소고기고구마국 + 밥",
      "닭고기된장국 + 밥",
      "소고기당근조림 + 밥",
    ],
    snack: [
      "고구마스틱",
      "바나나",
      "떡",
      "사과",
      "아기요거트",
      "찐옥수수",
      "치즈",
      "감자스틱",
      "단호박스틱",
      "딸기요거트",
      "두부볼",
      "야채스틱",
      "바나나팬케이크",
      "고구마치즈볼",
    ],
  },
  유아식: {
    breakfast: [
      "계란말이 + 밥 + 된장국",
      "소고기볶음밥 + 미역국",
      "주먹밥 + 소고기무국",
      "야채죽 + 계란찜",
      "채소볶음밥 + 달걀국",
      "잔치국수",
      "소고기비빔밥",
      "김치볶음밥 + 계란후라이",
      "감자전 + 밥 + 국",
      "소고기덮밥",
      "치즈밥 + 미역국",
      "계란덮밥 + 된장국",
      "닭고기죽",
      "소고기김밥",
    ],
    lunch: [
      "소고기야채카레 + 밥",
      "닭고기덮밥 + 배추국",
      "소고기미역국 + 밥 + 계란말이",
      "어묵국 + 밥 + 멸치볶음",
      "돼지고기감자국 + 밥",
      "소고기된장찌개 + 밥",
      "볶음우동 + 달걀국",
      "닭고기카레 + 밥",
      "소고기국수",
      "제육볶음 + 밥 + 국",
      "생선까스 + 밥 + 국",
      "소고기잡채밥",
      "미트볼파스타",
      "소고기우동",
    ],
    dinner: [
      "생선구이 + 밥 + 시금치나물",
      "소고기장조림 + 밥 + 된장국",
      "닭고기야채볶음 + 밥 + 국",
      "두부조림 + 밥 + 미역국",
      "소고기떡국",
      "돼지고기간장불고기 + 밥 + 콩나물국",
      "갈치구이 + 밥 + 무국",
      "닭고기장조림 + 밥 + 국",
      "소고기야채볶음 + 밥 + 국",
      "돼지고기김치찌개 + 밥",
      "생선조림 + 밥 + 국",
      "소고기감자조림 + 밥 + 된장국",
      "닭고기카레 + 밥 + 샐러드",
      "제육볶음 + 밥 + 된장국",
    ],
    snack: [
      "과일 (사과, 배, 귤)",
      "고구마 + 우유",
      "요거트 + 시리얼",
      "바나나 + 치즈",
      "떡 + 우유",
      "찐옥수수",
      "과일주스 + 쿠키",
      "감자전",
      "호떡",
      "미니김밥",
      "과일샐러드",
      "두유 + 과자",
      "치즈스틱",
      "고구마맛탕",
    ],
  },
  "일반 유아식": {
    breakfast: [
      "계란말이 + 밥 + 된장국",
      "소고기볶음밥 + 미역국",
      "주먹밥 + 소고기무국",
      "야채죽 + 계란찜",
      "채소볶음밥 + 달걀국",
      "잔치국수",
      "소고기비빔밥",
      "김치볶음밥 + 계란후라이",
      "감자전 + 밥 + 국",
      "소고기덮밥",
      "치즈밥 + 미역국",
      "계란덮밥 + 된장국",
      "닭고기죽",
      "소고기김밥",
    ],
    lunch: [
      "소고기야채카레 + 밥",
      "닭고기덮밥 + 배추국",
      "소고기미역국 + 밥 + 계란말이",
      "어묵국 + 밥 + 멸치볶음",
      "돼지고기감자국 + 밥",
      "소고기된장찌개 + 밥",
      "볶음우동 + 달걀국",
      "닭고기카레 + 밥",
      "소고기국수",
      "제육볶음 + 밥 + 국",
      "생선까스 + 밥 + 국",
      "소고기잡채밥",
      "미트볼파스타",
      "소고기우동",
    ],
    dinner: [
      "생선구이 + 밥 + 시금치나물",
      "소고기장조림 + 밥 + 된장국",
      "닭고기야채볶음 + 밥 + 국",
      "두부조림 + 밥 + 미역국",
      "소고기떡국",
      "돼지고기간장불고기 + 밥 + 콩나물국",
      "갈치구이 + 밥 + 무국",
      "닭고기장조림 + 밥 + 국",
      "소고기야채볶음 + 밥 + 국",
      "돼지고기김치찌개 + 밥",
      "생선조림 + 밥 + 국",
      "소고기감자조림 + 밥 + 된장국",
      "닭고기카레 + 밥 + 샐러드",
      "제육볶음 + 밥 + 된장국",
    ],
    snack: [
      "과일 (사과, 배, 귤)",
      "고구마 + 우유",
      "요거트 + 시리얼",
      "바나나 + 치즈",
      "떡 + 우유",
      "찐옥수수",
      "과일주스 + 쿠키",
      "감자전",
      "호떡",
      "미니김밥",
      "과일샐러드",
      "두유 + 과자",
      "치즈스틱",
      "고구마맛탕",
    ],
  },
};

// 배열 셔플 (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 풀에서 n개 겹치지 않게 선택
function pickN(pool: string[], n: number): string[] {
  if (pool.length === 0) return Array(n).fill("");
  const shuffled = shuffle(pool);
  return Array.from({ length: n }, (_, i) => shuffled[i % shuffled.length]);
}

function pickSeven(pool: string[]): string[] {
  return pickN(pool, 7);
}

export interface DayMeal {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

export function generateWeeklyPlan(months: number): DayMeal[] {
  const stage = getStage(months);
  if (!stage.hasMenu) return [];

  const pool = mealPools[stage.name];
  if (!pool) return [];

  const breakfasts = pickSeven(pool.breakfast);
  const lunches = pickSeven(pool.lunch);
  const dinners = pickSeven(pool.dinner);
  const snacks = pickSeven(pool.snack);

  return dayNames.map((day, i) => ({
    day,
    breakfast: breakfasts[i],
    lunch: lunches[i],
    dinner: dinners[i],
    snack: snacks[i],
  }));
}

// ── 월간 식단 ──

export interface MonthDayMeal {
  date: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

export interface MonthPlan {
  year: number;
  month: number;
  days: MonthDayMeal[];
}

export function generateMonthlyPlan(months: number): MonthPlan | null {
  const stage = getStage(months);
  if (!stage.hasMenu) return null;

  const pool = mealPools[stage.name];
  if (!pool) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const breakfasts = pickN(pool.breakfast, daysInMonth);
  const lunches = pickN(pool.lunch, daysInMonth);
  const dinners = pickN(pool.dinner, daysInMonth);
  const snacks = pickN(pool.snack, daysInMonth);

  const days: MonthDayMeal[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: i + 1,
    breakfast: breakfasts[i],
    lunch: lunches[i],
    dinner: dinners[i],
    snack: snacks[i],
  }));

  return { year, month, days };
}

// ── 통합 식단 ──

// 단계 순서 매핑
const STAGE_ORDER: Record<string, number> = {
  "모유/분유기": 0,
  "초기 이유식": 1,
  "중기 이유식": 2,
  "후기 이유식": 3,
  "완료기 이유식": 4,
  "유아식": 5,
  "일반 유아식": 6,
};

export function getStageOrder(stageName: string): number {
  return STAGE_ORDER[stageName] ?? -1;
}

// 아이 정보 인터페이스
export interface ChildInfo {
  index: number;
  label: string;
  months: number;
  stageName: string;
}

// 호환 그룹
export interface StageGroup {
  children: ChildInfo[];
  baseStageName: string; // 그룹 내 가장 낮은(어린) 단계
}

// 인접 단계(±1)만 통합, greedy 방식
export function groupChildrenByStage(children: ChildInfo[]): StageGroup[] {
  if (children.length === 0) return [];

  // 단계 순서로 정렬
  const sorted = [...children].sort(
    (a, b) => getStageOrder(a.stageName) - getStageOrder(b.stageName)
  );

  const groups: StageGroup[] = [];
  let current: StageGroup = {
    children: [sorted[0]],
    baseStageName: sorted[0].stageName,
  };

  for (let i = 1; i < sorted.length; i++) {
    const prevOrder = getStageOrder(current.baseStageName);
    const curOrder = getStageOrder(sorted[i].stageName);
    // 그룹 내 최소(base)와의 차이가 2 이하면 통합
    if (curOrder - prevOrder <= 2) {
      current.children.push(sorted[i]);
    } else {
      groups.push(current);
      current = {
        children: [sorted[i]],
        baseStageName: sorted[i].stageName,
      };
    }
  }
  groups.push(current);

  return groups;
}

// 지정 단계 pool에서 주간 식단 생성
export function generateWeeklyPlanFromPool(stageName: string): DayMeal[] {
  const pool = mealPools[stageName];
  if (!pool) return [];

  const breakfasts = pickSeven(pool.breakfast);
  const lunches = pickSeven(pool.lunch);
  const dinners = pickSeven(pool.dinner);
  const snacks = pickSeven(pool.snack);

  return dayNames.map((day, i) => ({
    day,
    breakfast: breakfasts[i],
    lunch: lunches[i],
    dinner: dinners[i],
    snack: snacks[i],
  }));
}

// 지정 단계 pool에서 월간 식단 생성
export function generateMonthlyPlanFromPool(stageName: string): MonthPlan | null {
  const pool = mealPools[stageName];
  if (!pool) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const breakfasts = pickN(pool.breakfast, daysInMonth);
  const lunches = pickN(pool.lunch, daysInMonth);
  const dinners = pickN(pool.dinner, daysInMonth);
  const snacks = pickN(pool.snack, daysInMonth);

  const days: MonthDayMeal[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: i + 1,
    breakfast: breakfasts[i],
    lunch: lunches[i],
    dinner: dinners[i],
    snack: snacks[i],
  }));

  return { year, month, days };
}

// 공유 식단에서 아이 자신의 단계에 맞게 보충 (주간)
// base pool에 없는 끼니(예: 초기는 dinner/snack 없음)는 아이 자체 pool에서 생성
export function mergeWeeklyPlanForChild(
  shared: DayMeal[],
  childStageName: string
): DayMeal[] {
  const childPool = mealPools[childStageName];
  if (!childPool) return shared;

  return shared.map((day) => {
    const merged = { ...day };
    // 공유 식단에서 빈 끼니를 아이 자체 pool에서 보충
    if (!merged.dinner && childPool.dinner.length > 0) {
      merged.dinner = pickN(childPool.dinner, 1)[0];
    }
    if (!merged.snack && childPool.snack.length > 0) {
      merged.snack = pickN(childPool.snack, 1)[0];
    }
    return merged;
  });
}

// 공유 식단에서 아이 자신의 단계에 맞게 보충 (월간)
export function mergeMonthlyPlanForChild(
  shared: MonthPlan,
  childStageName: string
): MonthPlan {
  const childPool = mealPools[childStageName];
  if (!childPool) return shared;

  const days = shared.days.map((day) => {
    const merged = { ...day };
    if (!merged.dinner && childPool.dinner.length > 0) {
      merged.dinner = pickN(childPool.dinner, 1)[0];
    }
    if (!merged.snack && childPool.snack.length > 0) {
      merged.snack = pickN(childPool.snack, 1)[0];
    }
    return merged;
  });

  return { ...shared, days };
}
