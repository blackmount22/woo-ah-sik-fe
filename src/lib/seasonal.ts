// 월별 제철 재료 (한국 기준)
const seasonalMap: Record<number, string[]> = {
  1: ["무", "배추", "시금치", "귤", "대구", "딸기"],
  2: ["시금치", "딸기", "무", "배추", "대구"],
  3: ["시금치", "양배추", "딸기", "미나리", "청경채"],
  4: ["시금치", "양배추", "완두콩", "딸기", "청경채"],
  5: ["감자", "양배추", "완두콩", "애호박", "양파"],
  6: ["감자", "애호박", "옥수수", "양파", "브로콜리"],
  7: ["옥수수", "감자", "애호박", "고구마", "브로콜리"],
  8: ["옥수수", "고구마", "배", "단호박", "애호박"],
  9: ["고구마", "배", "사과", "단호박", "연어"],
  10: ["사과", "배", "단호박", "고구마", "무", "갈치"],
  11: ["사과", "배추", "무", "시금치", "귤", "갈치"],
  12: ["배추", "무", "시금치", "귤", "대구"],
};

export interface SeasonalMatch {
  ingredients: string[];
}

// 메뉴명에서 제철 재료 찾기
export function getSeasonalMatch(menuName: string): SeasonalMatch | null {
  const month = new Date().getMonth() + 1;
  const seasonalIngredients = seasonalMap[month] ?? [];

  const matched = seasonalIngredients.filter((ing) => menuName.includes(ing));

  if (matched.length === 0) return null;
  return { ingredients: matched };
}

// 현재 월의 제철 재료 목록
export function getCurrentSeasonalIngredients(): string[] {
  const month = new Date().getMonth() + 1;
  return seasonalMap[month] ?? [];
}
