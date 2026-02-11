import { getRecipe } from "./recipes";

// 식품위생법 기준 알레르기 유발 식품
export interface Allergen {
  name: string;
  icon: string;
  keywords: string[];
}

export const allergenList: Allergen[] = [
  {
    name: "난류",
    icon: "🥚",
    keywords: ["계란", "달걀", "메추리알"],
  },
  {
    name: "우유",
    icon: "🥛",
    keywords: ["우유", "요거트", "치즈", "시리얼"],
  },
  {
    name: "대두",
    icon: "🫘",
    keywords: ["두부", "된장", "간장", "콩나물"],
  },
  {
    name: "밀",
    icon: "🌾",
    keywords: ["국수", "우동", "과자", "쿠키", "소면"],
  },
  {
    name: "소고기",
    icon: "🐄",
    keywords: ["소고기"],
  },
  {
    name: "돼지고기",
    icon: "🐷",
    keywords: ["돼지고기", "제육"],
  },
  {
    name: "닭고기",
    icon: "🐔",
    keywords: ["닭고기", "닭가슴살", "닭볶음"],
  },
  {
    name: "연어",
    icon: "🐟",
    keywords: ["연어"],
  },
  {
    name: "대구",
    icon: "🐟",
    keywords: ["대구"],
  },
  {
    name: "갈치",
    icon: "🐟",
    keywords: ["갈치"],
  },
  {
    name: "생선",
    icon: "🐟",
    keywords: ["생선"],
  },
  {
    name: "어묵",
    icon: "🍢",
    keywords: ["어묵"],
  },
];

export interface AllergenMatch {
  name: string;
  icon: string;
}

// 메뉴명 + 레시피 재료에서 알레르기 유발 식품 검출
export function getAllergenMatches(menuName: string): AllergenMatch[] {
  const recipe = getRecipe(menuName);
  const searchText = recipe
    ? menuName + " " + recipe.ingredients.join(" ")
    : menuName;

  const matched: AllergenMatch[] = [];

  for (const allergen of allergenList) {
    const found = allergen.keywords.some((kw) => searchText.includes(kw));
    if (found) {
      matched.push({ name: allergen.name, icon: allergen.icon });
    }
  }

  return matched;
}
