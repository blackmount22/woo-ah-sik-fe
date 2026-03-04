// 재료 키워드별 1회 식사 기여 영양 추정치 (근사값)
// carbs/protein/fat: g | vitA: μg RAE | vitC: mg | vitD: μg | calcium: mg | iron: mg

interface RawNutrition {
  carbs: number;
  protein: number;
  fat: number;
  vitA: number;
  vitC: number;
  vitD: number;
  calcium: number;
  iron: number;
}

const INGREDIENT_SCORES: [string, Partial<RawNutrition>][] = [
  // ── 곡류 / 탄수화물 ──
  ["쌀",       { carbs: 12, protein: 1.5, fat: 0.2, vitA: 0,  vitC: 0,  vitD: 0,  calcium: 2,  iron: 1   }],
  ["찹쌀",     { carbs: 13, protein: 1.3, fat: 0.2, vitA: 0,  vitC: 0,  vitD: 0,  calcium: 1,  iron: 1   }],
  ["오트밀",   { carbs: 10, protein: 3,   fat: 1.5, vitA: 0,  vitC: 0,  vitD: 0,  calcium: 4,  iron: 8   }],
  ["감자",     { carbs: 8,  protein: 0.8, fat: 0.1, vitA: 0,  vitC: 12, vitD: 0,  calcium: 2,  iron: 2   }],
  ["고구마",   { carbs: 10, protein: 0.7, fat: 0.1, vitA: 40, vitC: 6,  vitD: 0,  calcium: 3,  iron: 2   }],
  ["우동",     { carbs: 18, protein: 2,   fat: 0.3, vitA: 0,  vitC: 0,  vitD: 0,  calcium: 2,  iron: 1   }],
  ["파스타",   { carbs: 20, protein: 3,   fat: 1,   vitA: 0,  vitC: 0,  vitD: 0,  calcium: 3,  iron: 2   }],
  // ── 단백질 ──
  ["소고기",   { carbs: 0,  protein: 8,   fat: 3,   vitA: 2,  vitC: 0,  vitD: 1,  calcium: 2,  iron: 18  }],
  ["닭고기",   { carbs: 0,  protein: 7.5, fat: 1.5, vitA: 2,  vitC: 0,  vitD: 1,  calcium: 2,  iron: 8   }],
  ["돼지고기", { carbs: 0,  protein: 7,   fat: 5,   vitA: 1,  vitC: 0,  vitD: 1,  calcium: 2,  iron: 8   }],
  ["연어",     { carbs: 0,  protein: 7,   fat: 4,   vitA: 3,  vitC: 0,  vitD: 30, calcium: 2,  iron: 4   }],
  ["대구살",   { carbs: 0,  protein: 6,   fat: 0.5, vitA: 1,  vitC: 0,  vitD: 10, calcium: 2,  iron: 3   }],
  ["갈치",     { carbs: 0,  protein: 6,   fat: 3,   vitA: 2,  vitC: 0,  vitD: 12, calcium: 3,  iron: 4   }],
  ["생선",     { carbs: 0,  protein: 5.5, fat: 2,   vitA: 2,  vitC: 0,  vitD: 10, calcium: 3,  iron: 3   }],
  ["두부",     { carbs: 0.5,protein: 4,   fat: 2.5, vitA: 0,  vitC: 0,  vitD: 0,  calcium: 12, iron: 6   }],
  ["달걀",     { carbs: 0.2,protein: 4,   fat: 2.5, vitA: 8,  vitC: 0,  vitD: 10, calcium: 2,  iron: 5   }],
  ["멸치",     { carbs: 0,  protein: 5,   fat: 1.5, vitA: 2,  vitC: 0,  vitD: 8,  calcium: 30, iron: 5   }],
  ["어묵",     { carbs: 4,  protein: 3,   fat: 1,   vitA: 0,  vitC: 0,  vitD: 3,  calcium: 4,  iron: 2   }],
  // ── 채소 ──
  ["당근",     { carbs: 1.5,protein: 0.3, fat: 0,   vitA: 42, vitC: 4,  vitD: 0,  calcium: 2,  iron: 1.5 }],
  ["브로콜리", { carbs: 1,  protein: 1,   fat: 0.1, vitA: 10, vitC: 45, vitD: 0,  calcium: 6,  iron: 2.5 }],
  ["시금치",   { carbs: 0.6,protein: 1,   fat: 0.1, vitA: 35, vitC: 15, vitD: 0,  calcium: 8,  iron: 12  }],
  ["애호박",   { carbs: 1,  protein: 0.4, fat: 0,   vitA: 4,  vitC: 8,  vitD: 0,  calcium: 1.5,iron: 1.5 }],
  ["단호박",   { carbs: 3,  protein: 0.4, fat: 0,   vitA: 28, vitC: 6,  vitD: 0,  calcium: 3,  iron: 2   }],
  ["양배추",   { carbs: 1,  protein: 0.5, fat: 0,   vitA: 2,  vitC: 22, vitD: 0,  calcium: 4,  iron: 1.5 }],
  ["청경채",   { carbs: 0.7,protein: 0.5, fat: 0,   vitA: 18, vitC: 12, vitD: 0,  calcium: 7,  iron: 3   }],
  ["배추",     { carbs: 0.8,protein: 0.3, fat: 0,   vitA: 2,  vitC: 15, vitD: 0,  calcium: 3.5,iron: 1.5 }],
  ["무",       { carbs: 0.8,protein: 0.2, fat: 0,   vitA: 0,  vitC: 9,  vitD: 0,  calcium: 1.5,iron: 1   }],
  ["양파",     { carbs: 1.5,protein: 0.2, fat: 0,   vitA: 0,  vitC: 4,  vitD: 0,  calcium: 1,  iron: 1   }],
  ["비타민",   { carbs: 0.7,protein: 0.4, fat: 0,   vitA: 12, vitC: 18, vitD: 0,  calcium: 4,  iron: 2   }],
  ["완두콩",   { carbs: 2.5,protein: 1.2, fat: 0.1, vitA: 3,  vitC: 8,  vitD: 0,  calcium: 1.5,iron: 5   }],
  ["옥수수",   { carbs: 3.5,protein: 0.7, fat: 0.4, vitA: 3,  vitC: 3,  vitD: 0,  calcium: 1,  iron: 2.5 }],
  ["미역",     { carbs: 0.5,protein: 0.4, fat: 0,   vitA: 5,  vitC: 1.5,vitD: 0,  calcium: 8,  iron: 4   }],
  ["콜리플라워",{ carbs: 0.8,protein: 0.6,fat: 0,   vitA: 0,  vitC: 28, vitD: 0,  calcium: 2.5,iron: 2   }],
  ["콩나물",   { carbs: 0.6,protein: 0.8, fat: 0.2, vitA: 0,  vitC: 6,  vitD: 0,  calcium: 3,  iron: 2   }],
  ["감자",     { carbs: 8,  protein: 0.8, fat: 0.1, vitA: 0,  vitC: 12, vitD: 0,  calcium: 2,  iron: 2   }],
  ["표고버섯", { carbs: 0.8,protein: 0.7, fat: 0.1, vitA: 0,  vitC: 2,  vitD: 4,  calcium: 1,  iron: 2   }],
  // ── 과일 ──
  ["바나나",   { carbs: 4,  protein: 0.2, fat: 0,   vitA: 0,  vitC: 4,  vitD: 0,  calcium: 0.5,iron: 1.5 }],
  ["배",       { carbs: 2.5,protein: 0.1, fat: 0,   vitA: 0,  vitC: 2,  vitD: 0,  calcium: 0.5,iron: 0.5 }],
  ["사과",     { carbs: 2.5,protein: 0.1, fat: 0,   vitA: 0,  vitC: 2.5,vitD: 0,  calcium: 0.5,iron: 0.5 }],
  ["딸기",     { carbs: 1.5,protein: 0.2, fat: 0,   vitA: 0.5,vitC: 30, vitD: 0,  calcium: 1,  iron: 1.5 }],
  ["수박",     { carbs: 2,  protein: 0.1, fat: 0,   vitA: 4,  vitC: 6,  vitD: 0,  calcium: 0.5,iron: 0.5 }],
  ["포도",     { carbs: 3,  protein: 0.2, fat: 0,   vitA: 0.3,vitC: 2,  vitD: 0,  calcium: 1,  iron: 1   }],
  // ── 유제품 ──
  ["요거트",   { carbs: 2,  protein: 2,   fat: 1,   vitA: 2.5,vitC: 0,  vitD: 2.5,calcium: 15, iron: 1   }],
  ["치즈",     { carbs: 0.3,protein: 3,   fat: 4,   vitA: 6,  vitC: 0,  vitD: 1,  calcium: 28, iron: 1   }],
];

const ZERO: RawNutrition = { carbs: 0, protein: 0, fat: 0, vitA: 0, vitC: 0, vitD: 0, calcium: 0, iron: 0 };

function parseMealNutrition(mealName: string): RawNutrition {
  if (!mealName) return { ...ZERO };
  // 기본 쌀 베이스 (미음/죽/무른밥/진밥/밥 등 모두 쌀 기반)
  const base: RawNutrition = { carbs: 3, protein: 0.5, fat: 0.2, vitA: 0, vitC: 0, vitD: 0, calcium: 1, iron: 0.5 };
  for (const [keyword, values] of INGREDIENT_SCORES) {
    if (mealName.includes(keyword)) {
      base.carbs    += values.carbs    ?? 0;
      base.protein  += values.protein  ?? 0;
      base.fat      += values.fat      ?? 0;
      base.vitA     += values.vitA     ?? 0;
      base.vitC     += values.vitC     ?? 0;
      base.vitD     += values.vitD     ?? 0;
      base.calcium  += values.calcium  ?? 0;
      base.iron     += values.iron     ?? 0;
    }
  }
  return base;
}

function addNutrition(a: RawNutrition, b: RawNutrition): RawNutrition {
  return {
    carbs:   a.carbs   + b.carbs,
    protein: a.protein + b.protein,
    fat:     a.fat     + b.fat,
    vitA:    a.vitA    + b.vitA,
    vitC:    a.vitC    + b.vitC,
    vitD:    a.vitD    + b.vitD,
    calcium: a.calcium + b.calcium,
    iron:    a.iron    + b.iron,
  };
}

// 이유식 단계별 하루 권장 섭취량 (보충식 기여분 기준)
const STAGE_RDI: Record<string, RawNutrition> = {
  "초기 이유식":  { carbs: 14,  protein: 3,  fat: 8,  vitA: 80,  vitC: 10, vitD: 5,  calcium: 80,  iron: 3  },
  "중기 이유식":  { carbs: 25,  protein: 6,  fat: 10, vitA: 120, vitC: 15, vitD: 5,  calcium: 130, iron: 5  },
  "후기 이유식":  { carbs: 40,  protein: 10, fat: 13, vitA: 160, vitC: 20, vitD: 5,  calcium: 180, iron: 6  },
  "완료기 이유식":{ carbs: 60,  protein: 13, fat: 15, vitA: 200, vitC: 25, vitD: 5,  calcium: 220, iron: 7  },
  "유아식":       { carbs: 100, protein: 18, fat: 22, vitA: 280, vitC: 35, vitD: 5,  calcium: 380, iron: 6  },
  "일반 유아식":  { carbs: 130, protein: 20, fat: 25, vitA: 350, vitC: 45, vitD: 10, calcium: 450, iron: 7  },
};

export interface NutritionDayResult {
  label: string;       // 월~일
  carbs: number;       // g
  protein: number;     // g
  fat: number;         // g
  vitA: number;        // % of daily RDI (0~100+)
  vitC: number;
  vitD: number;
  calcium: number;
  iron: number;
  empty: boolean;      // 데이터 없는 날 (월 경계)
}

type MealEntry = { breakfast: string; lunch: string; dinner: string; snack: string };

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function calcWeekNutrition(
  currentWeek: (MealEntry | null)[],
  stageName: string
): NutritionDayResult[] {
  const rdi = STAGE_RDI[stageName] ?? STAGE_RDI["유아식"];

  return currentWeek.map((day, i) => {
    if (!day) {
      return { label: DAY_LABELS[i], carbs: 0, protein: 0, fat: 0, vitA: 0, vitC: 0, vitD: 0, calcium: 0, iron: 0, empty: true };
    }
    const meals = [day.breakfast, day.lunch, day.dinner, day.snack]
      .filter(Boolean)
      .map(parseMealNutrition);

    const total = meals.reduce(addNutrition, { ...ZERO });

    const pct = (val: number, ref: number) =>
      ref > 0 ? Math.min(120, Math.round((val / ref) * 100)) : 0;

    return {
      label:   DAY_LABELS[i],
      carbs:   Math.round(total.carbs),
      protein: Math.round(total.protein),
      fat:     Math.round(total.fat),
      vitA:    pct(total.vitA,    rdi.vitA),
      vitC:    pct(total.vitC,    rdi.vitC),
      vitD:    pct(total.vitD,    rdi.vitD),
      calcium: pct(total.calcium, rdi.calcium),
      iron:    pct(total.iron,    rdi.iron),
      empty:   false,
    };
  });
}

export function weeklyVitaminAvg(days: NutritionDayResult[]) {
  const active = days.filter((d) => !d.empty);
  if (active.length === 0) return { vitA: 0, vitC: 0, vitD: 0, calcium: 0, iron: 0 };
  const sum = active.reduce(
    (acc, d) => ({
      vitA: acc.vitA + d.vitA,
      vitC: acc.vitC + d.vitC,
      vitD: acc.vitD + d.vitD,
      calcium: acc.calcium + d.calcium,
      iron: acc.iron + d.iron,
    }),
    { vitA: 0, vitC: 0, vitD: 0, calcium: 0, iron: 0 }
  );
  const n = active.length;
  return {
    vitA:    Math.min(100, Math.round(sum.vitA    / n)),
    vitC:    Math.min(100, Math.round(sum.vitC    / n)),
    vitD:    Math.min(100, Math.round(sum.vitD    / n)),
    calcium: Math.min(100, Math.round(sum.calcium / n)),
    iron:    Math.min(100, Math.round(sum.iron    / n)),
  };
}
