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
    ],
    lunch: [
      "쌀미음",
      "찹쌀미음",
      "감자미음",
      "고구마미음",
      "애호박미음",
      "양배추미음",
      "청경채미음",
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
    ],
    lunch: [
      "소고기배추죽",
      "소고기무죽",
      "닭고기단호박죽",
      "소고기청경채죽",
      "닭고기비타민죽",
      "소고기양파죽",
      "소고기완두콩죽",
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
    ],
    lunch: [
      "소고기배추무른밥",
      "닭고기양배추무른밥",
      "대구살야채죽",
      "소고기두부무른밥",
      "닭고기완두콩무른밥",
      "소고기고구마무른밥",
      "연어감자무른밥",
    ],
    dinner: [
      "소고기무른밥 + 배추국",
      "닭고기무른밥 + 미역국",
      "소고기야채무른밥",
      "두부야채무른밥",
      "소고기감자무른밥",
      "닭고기당근무른밥",
      "소고기단호박무른밥",
    ],
    snack: [
      "바나나",
      "찐고구마",
      "사과퓨레",
      "배퓨레",
      "찐감자",
      "떡뻥",
      "아기과자",
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
    ],
    lunch: [
      "소고기완자 + 진밥",
      "닭고기야채볶음밥",
      "소고기배추국 + 밥",
      "두부조림 + 진밥",
      "소고기미역국 + 밥",
      "닭고기무국 + 밥",
      "연어야채밥",
    ],
    dinner: [
      "소고기무국 + 진밥",
      "닭볶음탕 + 밥",
      "소고기감자조림 + 밥",
      "두부된장국 + 밥",
      "소고기야채국 + 밥",
      "닭고기미역국 + 밥",
      "소고기시금치국 + 밥",
    ],
    snack: [
      "고구마스틱",
      "바나나",
      "떡",
      "사과",
      "아기요거트",
      "찐옥수수",
      "치즈",
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
    ],
    lunch: [
      "소고기야채카레 + 밥",
      "닭고기덮밥 + 배추국",
      "소고기미역국 + 밥 + 계란말이",
      "어묵국 + 밥 + 멸치볶음",
      "돼지고기감자국 + 밥",
      "소고기된장찌개 + 밥",
      "볶음우동 + 달걀국",
    ],
    dinner: [
      "생선구이 + 밥 + 시금치나물",
      "소고기장조림 + 밥 + 된장국",
      "닭고기야채볶음 + 밥 + 국",
      "두부조림 + 밥 + 미역국",
      "소고기떡국",
      "돼지고기간장불고기 + 밥 + 콩나물국",
      "갈치구이 + 밥 + 무국",
    ],
    snack: [
      "과일 (사과, 배, 귤)",
      "고구마 + 우유",
      "요거트 + 시리얼",
      "바나나 + 치즈",
      "떡 + 우유",
      "찐옥수수",
      "과일주스 + 쿠키",
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
    ],
    lunch: [
      "소고기야채카레 + 밥",
      "닭고기덮밥 + 배추국",
      "소고기미역국 + 밥 + 계란말이",
      "어묵국 + 밥 + 멸치볶음",
      "돼지고기감자국 + 밥",
      "소고기된장찌개 + 밥",
      "볶음우동 + 달걀국",
    ],
    dinner: [
      "생선구이 + 밥 + 시금치나물",
      "소고기장조림 + 밥 + 된장국",
      "닭고기야채볶음 + 밥 + 국",
      "두부조림 + 밥 + 미역국",
      "소고기떡국",
      "돼지고기간장불고기 + 밥 + 콩나물국",
      "갈치구이 + 밥 + 무국",
    ],
    snack: [
      "과일 (사과, 배, 귤)",
      "고구마 + 우유",
      "요거트 + 시리얼",
      "바나나 + 치즈",
      "떡 + 우유",
      "찐옥수수",
      "과일주스 + 쿠키",
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
