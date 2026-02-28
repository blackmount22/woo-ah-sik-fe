// 식재료 추출 및 구매 링크 유틸리티

export interface IngredientItem {
  name: string;
  emoji: string;
  quantity: string;  // 예: "약 200g", "약 3개"
  meals: string[];   // 이 식재료가 사용되는 메뉴명 목록
}

export interface CategoryGroup {
  category: string;
  emoji: string;
  items: IngredientItem[];
}

// 식재료 정보 (카테고리 + 이모지)
const INGREDIENT_INFO: Record<string, { category: string; emoji: string }> = {
  // 육류
  소고기: { category: "육류", emoji: "🥩" },
  닭고기: { category: "육류", emoji: "🍗" },
  돼지고기: { category: "육류", emoji: "🥓" },
  // 생선·해산물
  연어: { category: "생선·해산물", emoji: "🐟" },
  대구: { category: "생선·해산물", emoji: "🐟" },
  갈치: { category: "생선·해산물", emoji: "🐟" },
  고등어: { category: "생선·해산물", emoji: "🐟" },
  삼치: { category: "생선·해산물", emoji: "🐟" },
  생선: { category: "생선·해산물", emoji: "🐟" },
  참치: { category: "생선·해산물", emoji: "🐟" },
  새우: { category: "생선·해산물", emoji: "🦐" },
  어묵: { category: "생선·해산물", emoji: "🍢" },
  // 채소
  당근: { category: "채소", emoji: "🥕" },
  감자: { category: "채소", emoji: "🥔" },
  고구마: { category: "채소", emoji: "🍠" },
  브로콜리: { category: "채소", emoji: "🥦" },
  시금치: { category: "채소", emoji: "🥬" },
  애호박: { category: "채소", emoji: "🥒" },
  단호박: { category: "채소", emoji: "🎃" },
  양배추: { category: "채소", emoji: "🥬" },
  청경채: { category: "채소", emoji: "🥬" },
  배추: { category: "채소", emoji: "🥬" },
  무: { category: "채소", emoji: "🌿" },
  양파: { category: "채소", emoji: "🧅" },
  완두콩: { category: "채소", emoji: "🌱" },
  콜리플라워: { category: "채소", emoji: "🥦" },
  콩나물: { category: "채소", emoji: "🌱" },
  미역: { category: "채소", emoji: "🌿" },
  옥수수: { category: "채소", emoji: "🌽" },
  비타민채소: { category: "채소", emoji: "🥬" },
  // 달걀·두부
  두부: { category: "달걀·두부", emoji: "⬜" },
  계란: { category: "달걀·두부", emoji: "🥚" },
  // 과일
  바나나: { category: "과일", emoji: "🍌" },
  사과: { category: "과일", emoji: "🍎" },
  배: { category: "과일", emoji: "🍐" },
  귤: { category: "과일", emoji: "🍊" },
  딸기: { category: "과일", emoji: "🍓" },
  아보카도: { category: "과일", emoji: "🥑" },
  // 유제품
  치즈: { category: "유제품", emoji: "🧀" },
  우유: { category: "유제품", emoji: "🥛" },
  요거트: { category: "유제품", emoji: "🥛" },
  // 곡류
  쌀: { category: "곡류", emoji: "🌾" },
  찹쌀: { category: "곡류", emoji: "🌾" },
  오트밀: { category: "곡류", emoji: "🌾" },
};

// 1회 식단당 대략적인 식재료 사용량
const INGREDIENT_AMOUNT: Record<
  string,
  { amount: number; unit: "g" | "ml" | "개" | "장" }
> = {
  // 육류
  소고기: { amount: 50, unit: "g" },
  닭고기: { amount: 50, unit: "g" },
  돼지고기: { amount: 60, unit: "g" },
  // 생선·해산물
  연어: { amount: 60, unit: "g" },
  대구: { amount: 60, unit: "g" },
  갈치: { amount: 70, unit: "g" },
  고등어: { amount: 70, unit: "g" },
  삼치: { amount: 70, unit: "g" },
  생선: { amount: 70, unit: "g" },
  참치: { amount: 50, unit: "g" },
  새우: { amount: 50, unit: "g" },
  어묵: { amount: 50, unit: "g" },
  // 채소
  당근: { amount: 40, unit: "g" },
  감자: { amount: 70, unit: "g" },
  고구마: { amount: 70, unit: "g" },
  브로콜리: { amount: 40, unit: "g" },
  시금치: { amount: 30, unit: "g" },
  애호박: { amount: 40, unit: "g" },
  단호박: { amount: 60, unit: "g" },
  양배추: { amount: 40, unit: "g" },
  청경채: { amount: 30, unit: "g" },
  배추: { amount: 50, unit: "g" },
  무: { amount: 50, unit: "g" },
  양파: { amount: 40, unit: "g" },
  완두콩: { amount: 30, unit: "g" },
  콜리플라워: { amount: 40, unit: "g" },
  콩나물: { amount: 50, unit: "g" },
  미역: { amount: 15, unit: "g" },
  옥수수: { amount: 40, unit: "g" },
  비타민채소: { amount: 30, unit: "g" },
  // 달걀·두부
  두부: { amount: 60, unit: "g" },
  계란: { amount: 1, unit: "개" },
  // 과일
  바나나: { amount: 1, unit: "개" },
  사과: { amount: 1, unit: "개" },
  배: { amount: 1, unit: "개" },
  귤: { amount: 2, unit: "개" },
  딸기: { amount: 5, unit: "개" },
  아보카도: { amount: 1, unit: "개" },
  // 유제품
  치즈: { amount: 1, unit: "장" },
  우유: { amount: 200, unit: "ml" },
  요거트: { amount: 1, unit: "개" },
  // 곡류
  쌀: { amount: 50, unit: "g" },
  찹쌀: { amount: 50, unit: "g" },
  오트밀: { amount: 30, unit: "g" },
};

// 사용 횟수 × 1회 분량 → 표시용 수량 문자열
function calcQuantity(ingredient: string, count: number): string {
  const info = INGREDIENT_AMOUNT[ingredient];
  if (!info) return "";

  const total = info.amount * count;

  switch (info.unit) {
    case "g": {
      const rounded = Math.ceil(total / 10) * 10;
      return rounded >= 1000
        ? `약 ${(rounded / 1000).toFixed(1).replace(".0", "")}kg`
        : `약 ${rounded}g`;
    }
    case "ml": {
      const rounded = Math.ceil(total / 50) * 50;
      return `약 ${rounded}ml`;
    }
    default: {
      // 개, 장
      const rounded = Math.ceil(total);
      return `약 ${rounded}${info.unit}`;
    }
  }
}

const CATEGORY_ORDER = [
  "육류",
  "생선·해산물",
  "채소",
  "달걀·두부",
  "과일",
  "유제품",
  "곡류",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  육류: "🥩",
  "생선·해산물": "🐟",
  채소: "🥦",
  "달걀·두부": "🥚",
  과일: "🍎",
  유제품: "🧀",
  곡류: "🌾",
};

// 식단명 전처리: 오탐 방지 및 별칭 정규화
function normalizeMealName(name: string): string {
  return name
    .replace(/무른/g, "⬜⬜")
    .replace(/닭볶음탕/g, "닭고기볶음")
    .replace(/제육/g, "돼지고기")
    .replace(/달걀/g, "계란")
    .replace(/비타민(?!채)/g, "비타민채소")
    .replace(/생선까스|생선전|생선구이|생선조림/g, "생선요리")
    .replace(/함박스테이크/g, "소고기요리");
}

// 식단명 하나에서 식재료 추출 (Longest-first 매칭)
function extractIngredients(mealName: string): string[] {
  let text = normalizeMealName(mealName);
  const found = new Set<string>();

  const sortedKeywords = Object.keys(INGREDIENT_INFO).sort(
    (a, b) => b.length - a.length
  );

  for (const keyword of sortedKeywords) {
    if (text.includes(keyword)) {
      found.add(keyword);
      text = text.split(keyword).join("⬜".repeat(keyword.length));
    }
  }

  // 밥·죽·미음·국수·우동 계열 → 쌀 추가
  if (
    (mealName.includes("죽") ||
      mealName.includes("미음") ||
      mealName.includes("밥") ||
      mealName.includes("국수") ||
      mealName.includes("우동")) &&
    !found.has("찹쌀") &&
    !found.has("오트밀")
  ) {
    found.add("쌀");
  }

  return [...found];
}

// 일주일 식단에서 식재료 추출 → 카테고리별 그룹 반환
// 각 식재료에 사용 횟수 기반 수량과 사용 메뉴명 목록 포함
export function getWeekIngredientGroups(
  weekMeals: Array<{
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  }>
): CategoryGroup[] {
  // ingredient → { count(사용 횟수), meals(메뉴명 Set) }
  const ingredientData = new Map<
    string,
    { count: number; meals: Set<string> }
  >();

  for (const day of weekMeals) {
    const meals = [day.breakfast, day.lunch, day.dinner, day.snack].filter(
      Boolean
    );
    for (const meal of meals) {
      const parts = meal.split(/\s*\+\s*/);
      for (const part of parts) {
        for (const ing of extractIngredients(part.trim())) {
          if (!ingredientData.has(ing)) {
            ingredientData.set(ing, { count: 0, meals: new Set() });
          }
          const data = ingredientData.get(ing)!;
          data.count++;
          data.meals.add(meal); // 풀 메뉴명으로 추적
        }
      }
    }
  }

  const categoryMap = new Map<string, IngredientItem[]>();
  for (const cat of CATEGORY_ORDER) {
    categoryMap.set(cat, []);
  }

  for (const [ing, data] of ingredientData) {
    const info = INGREDIENT_INFO[ing];
    if (!info) continue;
    categoryMap.get(info.category)?.push({
      name: ing,
      emoji: info.emoji,
      quantity: calcQuantity(ing, data.count),
      meals: [...data.meals],
    });
  }

  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    emoji: CATEGORY_EMOJIS[cat] || "🛒",
    items: categoryMap.get(cat) || [],
  })).filter((g) => g.items.length > 0);
}

export function getCoupangLink(ingredient: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(ingredient)}&channel=user`;
}

export function getKurlyLink(ingredient: string): string {
  return `https://www.kurly.com/search?sword=${encodeURIComponent(ingredient)}`;
}
