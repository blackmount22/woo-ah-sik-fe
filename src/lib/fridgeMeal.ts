import { getStage } from "./mealPlan";

export interface FridgeIngredient {
  name: string;
  amount: string;
}

export interface SkippedIngredient {
  name: string;
  reason: string;
}

export interface MealDish {
  role: "main" | "side" | "soup";
  name: string;
  steps: string[];
  tip?: string;
}

export interface FridgeMealResult {
  childIndex: number;
  mealTime: "아침" | "점심" | "저녁";
  dishes: MealDish[];           // 메인반찬 + 부반찬들 (밥은 가정)
  menuName: string;             // "밥 + 소고기조림 + 시금치무침" 표시용
  ingredients: string[];
  stageName: string;
  months: number;
  childLabel: string;
  skipped: SkippedIngredient[];
  hasUsableIngredients: boolean;
}

// ── 아이에게 부적합한 재료 ──────────────────────────────
const FORBIDDEN: { keywords: string[]; reason: string; warnOnly?: boolean }[] = [
  { keywords: ["고추장", "고추가루", "고춧가루", "청양고추", "청양"],      reason: "맵고 자극적인 양념은 아이에게 적합하지 않아요" },
  { keywords: ["고추"],                                                      reason: "매운 성분이 있어 아이에게 자극적이에요" },
  { keywords: ["소주", "맥주", "막걸리", "와인", "청주", "술", "알코올"],   reason: "알코올은 아이에게 절대 금지예요" },
  { keywords: ["커피", "에스프레소", "에너지드링크", "카페인"],              reason: "카페인은 아이에게 적합하지 않아요" },
  { keywords: ["얼음"],                                                      reason: "얼음은 요리 재료가 아니에요" },
  { keywords: ["라면"],                                                      reason: "나트륨이 너무 높아 아이에게 부적합해요" },
  { keywords: ["마요네즈"],                                                  reason: "생달걀 성분으로 어린 아이에게 적합하지 않아요" },
  { keywords: ["초콜릿", "카카오"],                                          reason: "카페인과 설탕이 높아 아이에게 적합하지 않아요" },
  { keywords: ["사탕", "캔디", "젤리"],                                      reason: "과도한 당분으로 아이에게 적합하지 않아요" },
  { keywords: ["케첩"],                                                      reason: "나트륨과 당분이 높아 아이에게 적합하지 않아요" },
  { keywords: ["간장", "된장", "소금"],                                      reason: "과도한 소금은 삼가주세요. 소량 필요 시 조리 중 가감하세요", warnOnly: true },
];

// ── 재료 분류 ──────────────────────────────────────────
const PROTEINS = [
  "소고기", "쇠고기", "닭고기", "닭", "돼지고기", "돼지",
  "연어", "대구살", "대구", "갈치", "명태", "동태", "조기",
  "새우", "게살", "두부", "달걀", "계란",
];
const VEGETABLES = [
  "당근", "브로콜리", "시금치", "애호박", "단호박",
  "양배추", "청경채", "배추", "무", "양파", "대파", "파",
  "콜리플라워", "완두콩", "옥수수", "미역", "버섯", "표고버섯",
  "느타리버섯", "콩나물", "숙주", "비타민채소", "비타민",
  "감자", "고구마", "아스파라거스", "피망", "파프리카", "가지",
];
const CARBS = ["쌀", "찹쌀", "오트밀", "고구마", "감자", "빵", "떡"];
const FRUITS = ["바나나", "사과", "배", "딸기", "수박", "포도", "귤", "복숭아"];
const DAIRY = ["요거트", "치즈", "우유"];

function classify(name: string): "protein" | "vegetable" | "carb" | "fruit" | "dairy" | "other" {
  if (PROTEINS.some((k) => name.includes(k))) return "protein";
  if (VEGETABLES.some((k) => name.includes(k))) return "vegetable";
  if (CARBS.some((k) => name.includes(k))) return "carb";
  if (FRUITS.some((k) => name.includes(k))) return "fruit";
  if (DAIRY.some((k) => name.includes(k))) return "dairy";
  return "other";
}

function isForbidden(name: string): { forbidden: boolean; reason: string; warnOnly?: boolean } {
  for (const entry of FORBIDDEN) {
    if (entry.keywords.some((k) => name.includes(k))) {
      return { forbidden: true, reason: entry.reason, warnOnly: entry.warnOnly };
    }
  }
  return { forbidden: false, reason: "" };
}

// ── 단계별 최소 개월 수 조건 ──────────────────────────
function isAgeAppropriate(name: string, months: number): { ok: boolean; reason: string } {
  if ((name.includes("꿀") || name === "꿀") && months < 12) {
    return { ok: false, reason: "꿀은 12개월 미만 아이에게 보툴리누스 위험이 있어요" };
  }
  if ((name.includes("달걀") || name.includes("계란")) && months < 8) {
    return { ok: false, reason: "달걀은 8개월 이상부터 도입을 권장해요" };
  }
  if (name.includes("두부") && months < 6) {
    return { ok: false, reason: "두부는 6개월 이상부터 적합해요" };
  }
  const fishKeywords = ["연어", "대구살", "갈치", "명태", "동태", "새우", "게살"];
  if (fishKeywords.some((k) => name.includes(k)) && months < 6) {
    return { ok: false, reason: "생선은 6개월 이상부터 천천히 도입해요" };
  }
  return { ok: true, reason: "" };
}

// ── 반찬 헬퍼 ──────────────────────────────────────────
function makeVegSide(veg: FridgeIngredient): MealDish {
  const n = veg.name;
  const steamTypes = ["시금치", "브로콜리", "콩나물", "숙주", "청경채", "배추", "비타민", "무"];
  const stewTypes  = ["감자", "단호박", "애호박", "가지", "파프리카"];
  const isSteam = steamTypes.some((k) => n.includes(k));
  const isStew  = stewTypes.some((k) => n.includes(k));

  if (isSteam) {
    return {
      role: "side",
      name: `${n}무침`,
      steps: [
        `${n}을(를) 깨끗이 씻는다.`,
        "끓는 물에 30초~1분 데친 후 찬물에 헹구고 물기를 꼭 짠다.",
        "참기름 1~2방울, 소금 한 꼬집으로 가볍게 무친다.",
      ],
    };
  }
  if (isStew) {
    return {
      role: "side",
      name: `${n}조림`,
      steps: [
        `${n}을(를) 1cm 크기로 썬다.`,
        "냄비에 물 3큰술과 재료를 넣고 중불로 5분 조린다.",
        "소금 소량으로 간한다.",
      ],
    };
  }
  return {
    role: "side",
    name: `${n}볶음`,
    steps: [
      `${n}을(를) 먹기 좋은 크기로 썬다.`,
      "팬에 식용유를 약간 두르고 중불에서 2~3분 볶는다.",
      "소금 한 꼬집으로 간한다.",
    ],
  };
}

function makeEggSide(): MealDish {
  return {
    role: "side",
    name: "달걀찜",
    steps: [
      "달걀 1~2개를 풀고 물 100ml를 넣어 잘 섞는다.",
      "내열 용기에 넣고 랩을 씌워 전자레인지 2분, 또는 중탕으로 8~10분 익힌다.",
      "완전히 익으면 한 김 식혀 낸다.",
    ],
    tip: "달걀찜은 완전히 익어 떨림이 없어야 해요.",
  };
}

function makeSoupDish(veg: FridgeIngredient): MealDish {
  const n = veg.name;
  if (n.includes("미역")) {
    return {
      role: "soup",
      name: "미역국",
      steps: [
        "미역을 물에 10분 불리고 먹기 좋은 크기로 자른다.",
        "냄비에 참기름을 두르고 미역을 1분 볶은 후 물 1.5컵을 붓는다.",
        "10분간 끓인 뒤 소금 소량으로 간한다.",
      ],
    };
  }
  if (n.includes("콩나물") || n.includes("숙주")) {
    return {
      role: "soup",
      name: `${n}국`,
      steps: [
        `${n}을(를) 깨끗이 씻는다.`,
        `냄비에 물 1.5컵과 ${n}을(를) 넣고 뚜껑을 덮어 끓인다.`,
        "소금 소량으로 간한다.",
      ],
    };
  }
  if (n.includes("배추")) {
    return {
      role: "soup",
      name: "배추국",
      steps: [
        "배추를 먹기 좋은 크기로 썬다.",
        "냄비에 물 1.5컵을 붓고 배추를 넣어 끓인다.",
        "소금 소량으로 간한다.",
      ],
    };
  }
  // 국 재료가 아니면 무침/볶음으로 대체
  return makeVegSide(veg);
}

// ── 재료 세트 ──────────────────────────────────────────
interface IngredientSet {
  proteins:   FridgeIngredient[];
  vegetables: FridgeIngredient[];
  carbs:      FridgeIngredient[];
  fruits:     FridgeIngredient[];
  dairy:      FridgeIngredient[];
  others:     FridgeIngredient[];
}

// ── 메인반찬 + 부반찬 생성 ────────────────────────────
function buildMealDishes(set: IngredientSet, stageName: string, months: number): MealDish[] {
  const { proteins, vegetables, fruits, dairy } = set;
  const mainProt = proteins[0];
  const veg0     = vegetables[0];
  const veg1     = vegetables[1];

  // 단일 dish 래퍼
  const single = (name: string, steps: string[], tip?: string): MealDish[] => [
    { role: "main", name, steps, tip },
  ];

  // ─ 초기 이유식 ─────────────────────────────────────────
  if (stageName === "초기 이유식") {
    const safeIng = [...vegetables, ...proteins.filter((p) => p.name.includes("소고기"))][0];
    const ing = safeIng?.name ?? "쌀";
    return single(
      `${ing}미음`,
      [
        `${ing}을(를) 깨끗이 씻어 껍질을 제거한다.`,
        "재료를 잘게 잘라 물 100ml와 함께 냄비에 넣고 약불에서 충분히 익힌다.",
        "핸드블렌더로 곱게 갈거나 고운 체에 내려 미음 농도로 만든다.",
        "미지근하게 식혀서 아기에게 먹인다.",
      ],
      "처음 도입하는 재료는 3~4일간 다른 재료 없이 먹여 알레르기를 확인하세요.",
    );
  }

  // ─ 중기 이유식 ─────────────────────────────────────────
  if (stageName === "중기 이유식") {
    const prot = mainProt?.name ?? "";
    const veg  = veg0?.name ?? "";
    const menuName = prot && veg ? `${prot}${veg}죽` : prot ? `${prot}죽` : veg ? `${veg}죽` : "야채소고기죽";
    return single(
      menuName,
      [
        `${[prot, veg].filter(Boolean).join(", ")}을(를) 깨끗이 씻어 잘게 다진다.`,
        "불린 쌀 2큰술에 다진 재료와 물 150ml를 넣고 센불로 올린다.",
        "끓어오르면 약불로 줄이고 20분간 저어가며 끓인다.",
        "쌀이 완전히 퍼지면 불을 끄고 죽 농도로 맞춘다.",
        "미지근하게 식혀서 아기에게 먹인다.",
      ],
      "죽 농도는 숟가락으로 떴을 때 천천히 흘러내리는 정도가 적당해요.",
    );
  }

  // ─ 후기 이유식 ─────────────────────────────────────────
  if (stageName === "후기 이유식") {
    const prot = mainProt?.name ?? "";
    const veg  = veg0?.name ?? "";
    const menuName = prot && veg ? `${prot}${veg}무른밥`
                   : prot       ? `${prot}야채무른밥`
                   : veg        ? `${veg}무른밥`
                                : "야채무른밥";
    return single(
      menuName,
      [
        `${[prot, veg].filter(Boolean).join(", ")}을(를) 깨끗이 씻어 0.3~0.5cm 크기로 잘게 다진다.`,
        "불린 쌀 3큰술에 재료와 물 200ml를 넣고 끓인다.",
        "약불로 줄여 15~20분 끓여 무른밥 농도로 만든다.",
        "완전히 식혀서 아기에게 먹인다.",
      ],
      "씹는 연습을 위해 완전히 으깨지 않고 약간의 식감을 남겨도 좋아요.",
    );
  }

  // ─ 완료기 이유식: 진밥 + 반찬 1가지 ──────────────────
  if (stageName === "완료기 이유식") {
    const prot = mainProt?.name ?? "";
    const veg  = veg0?.name ?? "";
    const menuName = prot && veg ? `${prot}${veg}진밥`
                   : prot       ? `${prot}야채진밥`
                   : veg        ? `${veg}진밥`
                                : "야채진밥";
    const main: MealDish = {
      role: "main",
      name: menuName,
      steps: [
        `${[prot, veg].filter(Boolean).join(", ")}을(를) 0.5~1cm 크기로 썬다.`,
        "냄비에 쌀 반 공기와 재료를 넣고 물 1.5컵을 부어 끓인다.",
        "끓어오르면 약불로 낮춰 15분간 뚜껑 덮고 진밥 농도로 짓는다.",
        "식혀서 아기에게 먹인다.",
      ],
      tip: "어른 밥보다 물을 1.5배 더 넣어 부드럽게 지어주세요.",
    };
    // veg0는 진밥에 사용, veg1이 있으면 반찬 1가지 추가
    const side = veg1 ? makeVegSide(veg1) : null;
    return side ? [main, side] : [main];
  }

  // ─ 유아식 / 일반 유아식: 밥 + 메인반찬 + 부반찬들 ──────
  const dishes: MealDish[] = [];
  let usedVegCount = 0;

  if (mainProt) {
    const pn = mainProt.name;

    // 달걀/계란
    if (pn.includes("달걀") || pn.includes("계란")) {
      if (vegetables.length > 0) {
        const useVegs = vegetables.slice(0, 2);
        usedVegCount = useVegs.length;
        const vegStr = useVegs.map((v) => v.name).join("");
        dishes.push({
          role: "main",
          name: `${vegStr}달걀볶음밥`,
          steps: [
            `${useVegs.map((v) => v.name).join(", ")}을(를) 0.5cm 크기로 잘게 썬다.`,
            "팬에 식용유를 약간 두르고 채소를 중불에서 1~2분 볶는다.",
            "채소가 익으면 밥 2/3공기를 넣고 함께 볶는다.",
            "달걀을 풀어 넣고 젓가락으로 작게 쪼개며 완전히 익힌다.",
            "소금을 아주 소량만 넣고 식혀서 먹인다.",
          ],
          tip: "달걀은 완전히 익혀서 먹여주세요.",
        });
      } else {
        dishes.push({
          role: "main",
          name: "달걀찜",
          steps: [
            "달걀 2개를 풀고 물 200ml를 넣어 잘 섞는다.",
            "고운 체에 한 번 걸러 기포를 제거한다.",
            "내열 용기에 넣고 랩을 씌워 전자레인지 2~3분 또는 중탕으로 8~10분 익힌다.",
          ],
          tip: "달걀찜은 완전히 익어 떨림이 없어야 해요.",
        });
      }
    }

    // 소고기/쇠고기
    else if (pn.includes("소고기") || pn.includes("쇠고기")) {
      usedVegCount = veg0 ? 1 : 0;
      if (veg0) {
        dishes.push({
          role: "main",
          name: `소고기${veg0.name}조림`,
          steps: [
            "소고기는 키친타올로 핏물을 제거하고 0.5cm 크기로 잘게 썬다.",
            `${veg0.name}을(를) 0.5cm 크기로 썬다.`,
            "냄비에 물 200ml를 붓고 소고기를 넣어 중불로 끓인다.",
            "소고기가 익으면 채소를 넣고 5분 더 끓인다.",
            "간장 1/4 티스푼을 넣어 살짝 간한다.",
          ],
          tip: "소고기는 핏물을 꼭 제거하고 완전히 익혀야 해요.",
        });
      } else {
        dishes.push({
          role: "main",
          name: "소고기볶음",
          steps: [
            "소고기를 잘게 다지고 키친타올로 핏물을 닦는다.",
            "팬에 식용유를 약간 두르고 소고기를 중불에서 볶는다.",
            "간장 1/4 티스푼, 물 3큰술을 넣고 약불에서 2분 졸인다.",
          ],
          tip: "소금, 간장 간은 아주 소량만 사용하세요.",
        });
      }
    }

    // 닭고기
    else if (pn.includes("닭고기") || pn.includes("닭")) {
      usedVegCount = veg0 ? 1 : 0;
      if (veg0) {
        dishes.push({
          role: "main",
          name: `닭고기${veg0.name}조림`,
          steps: [
            "닭고기를 1cm 크기로 잘게 썰고 흐르는 물에 씻는다.",
            `${veg0.name}을(를) 1cm 크기로 썬다.`,
            "냄비에 물 200ml와 닭고기를 넣고 끓인다.",
            "닭고기가 익으면 채소를 넣고 5분 더 끓인다.",
            "간장 1/4 티스푼으로 살짝 간한다.",
          ],
          tip: "닭고기는 색이 하얗게 변할 때까지 완전히 익혀주세요.",
        });
      } else {
        dishes.push({
          role: "main",
          name: "닭고기볶음",
          steps: [
            "닭고기를 잘게 다져 흐르는 물에 씻는다.",
            "팬에 식용유를 두르고 닭고기를 중불에서 완전히 익힌다.",
            "간장 1/4 티스푼, 물 3큰술을 넣고 약불에서 2분 졸인다.",
          ],
        });
      }
    }

    // 돼지고기
    else if (pn.includes("돼지고기") || pn.includes("돼지")) {
      usedVegCount = veg0 ? 1 : 0;
      dishes.push({
        role: "main",
        name: `돼지고기${veg0 ? veg0.name : "야채"}볶음`,
        steps: [
          "돼지고기를 잘게 썰고 끓는 물에 살짝 데쳐 기름기를 뺀다.",
          veg0 ? `${veg0.name}을(를) 1cm 크기로 썬다.` : "채소를 1cm 크기로 썬다.",
          "팬에 식용유를 두르고 돼지고기를 먼저 볶은 후 채소를 넣는다.",
          "간장 1/4 티스푼, 물 2큰술을 넣고 살짝 졸인다.",
        ],
        tip: "돼지고기는 반드시 완전히 익혀야 해요.",
      });
    }

    // 두부
    else if (pn.includes("두부")) {
      usedVegCount = veg0 ? 1 : 0;
      dishes.push({
        role: "main",
        name: `두부${veg0 ? veg0.name : ""}조림`,
        steps: [
          "두부를 1cm 두께로 썰고 키친타올로 물기를 제거한다.",
          "팬에 기름을 두르고 두부를 앞뒤로 노릇하게 굽는다.",
          ...(veg0 ? [`${veg0.name}을(를) 잘게 썰어 함께 볶는다.`] : []),
          "물 3큰술, 간장 1/4 티스푼을 넣고 약불에서 2분 졸인다.",
        ],
        tip: "두부는 식으면 식감이 단단해지니 따뜻할 때 먹여주세요.",
      });
    }

    // 생선류
    else {
      const fishKw = ["연어", "대구살", "갈치", "명태", "동태"];
      if (fishKw.some((k) => pn.includes(k))) {
        usedVegCount = veg0 ? 1 : 0;
        dishes.push({
          role: "main",
          name: `${pn}${veg0 ? veg0.name : "야채"}조림`,
          steps: [
            `${pn}을(를) 흐르는 물에 씻어 1cm 크기로 자른다.`,
            ...(veg0 ? [`${veg0.name}을(를) 잘게 썬다.`] : []),
            "냄비에 물 200ml를 붓고 생선을 넣어 중불로 끓인다.",
            "생선이 익으면 채소를 넣고 5분 더 끓인다.",
          ],
          tip: "생선 가시를 완전히 제거해주세요.",
        });
      }
    }

    // ── 남은 채소 → 반찬/국 (최대 2개) ──
    const remainingVegs = vegetables.slice(usedVegCount);
    const hasSoup = () => dishes.some((d) => d.role === "soup");

    for (const veg of remainingVegs) {
      if (dishes.length >= 3) break;
      const isSoupVeg = ["미역", "콩나물", "숙주", "배추"].some((k) => veg.name.includes(k));
      if (isSoupVeg && !hasSoup()) {
        dishes.push(makeSoupDish(veg));
      } else if (!isSoupVeg) {
        dishes.push(makeVegSide(veg));
      }
    }

    // ── 달걀찜 추가 (메인이 달걀이 아닐 때, 여유 있을 때) ──
    const isEggMain = pn.includes("달걀") || pn.includes("계란");
    const extraEgg = !isEggMain && proteins.slice(1).find(
      (p) => p.name.includes("달걀") || p.name.includes("계란")
    );
    if (extraEgg && dishes.length < 3) {
      dishes.push(makeEggSide());
    }

  } else {
    // ── 단백질 없음 ──────────────────────────────────────
    if (vegetables.length > 0) {
      const starch = vegetables.find((v) => v.name.includes("고구마") || v.name.includes("감자"));
      if (starch) {
        dishes.push({
          role: "main",
          name: `${starch.name}으깸`,
          steps: [
            `${starch.name}을(를) 깨끗이 씻어 껍질을 벗기고 큼직하게 썬다.`,
            "끓는 물에 넣고 10~15분 푹 삶는다.",
            "물기를 빼고 포크나 숟가락으로 부드럽게 으깬다.",
            "우유 1~2큰술을 넣어 크리미하게 만든다.",
          ],
        });
        const rest = vegetables.filter((v) => v !== starch);
        for (const v of rest.slice(0, 1)) dishes.push(makeVegSide(v));
      } else {
        const useVegs = vegetables.slice(0, 2);
        const vegStr  = useVegs.map((v) => v.name).join("");
        dishes.push({
          role: "main",
          name: `${vegStr}야채볶음`,
          steps: [
            `${useVegs.map((v) => v.name).join(", ")}을(를) 먹기 좋게 썬다.`,
            "팬에 식용유를 약간 두르고 중불에서 3~4분 볶는다.",
            "소금 한 꼬집으로 간한다.",
          ],
        });
        for (const v of vegetables.slice(2, 3)) dishes.push(makeVegSide(v));
      }
    } else if (fruits.length > 0) {
      const fn = fruits[0].name;
      return single(
        dairy.length > 0 ? `${fn}요거트` : `${fn}과일 간식`,
        [
          `${fn}을(를) 깨끗이 씻어 작게 썬다.`,
          dairy.length > 0
            ? "플레인 요거트에 과일을 올린다."
            : "아이가 먹기 좋은 크기로 잘라 낸다.",
          "아이 반응을 보며 조금씩 먹인다.",
        ],
        `${fn}은(는) 비타민이 풍부해요. 당분이 있으니 적당량만 먹여주세요.`,
      );
    } else if (dairy.length > 0) {
      return single("치즈야채볶음밥", [
        "냉장고 속 채소를 잘게 썰어 팬에 식용유를 두르고 볶는다.",
        "밥을 넣고 함께 볶는다.",
        "치즈 1장을 올리고 녹인 후 그릇에 담는다.",
      ]);
    } else {
      return single("기본 야채죽", [
        "냉장고 속 채소(당근, 애호박 등)를 잘게 다진다.",
        "불린 쌀 반 공기와 물 2컵, 채소를 냄비에 넣고 끓인다.",
        "약불로 낮춰 20분간 저어가며 끓인다.",
        "참기름 한 방울을 넣고 식혀서 먹인다.",
      ]);
    }
  }

  // dishes가 비어있는 경우 fallback
  if (dishes.length === 0) {
    return single("기본 야채죽", [
      "냉장고 속 채소(당근, 애호박 등)를 잘게 다진다.",
      "불린 쌀 반 공기와 물 2컵, 채소를 냄비에 넣고 끓인다.",
      "약불로 낮춰 20분간 저어가며 끓인다.",
    ]);
  }

  return dishes;
}

// ── 공개 함수 ───────────────────────────────────────────────

export function getCurrentMealTime(): "아침" | "점심" | "저녁" {
  const hour = new Date().getHours();
  if (hour < 10) return "아침";
  if (hour < 15) return "점심";
  return "저녁";
}

function buildMenuName(dishes: MealDish[], stageName: string): string {
  if (dishes.length === 0) return "기본식";
  const olderStages = ["완료기 이유식", "유아식", "일반 유아식"];
  const isOlder = olderStages.includes(stageName);
  if (!isOlder) return dishes[0].name;
  // 밥 + 메인 + 반찬들
  return ["밥", ...dishes.map((d) => d.name)].join(" + ");
}

export function generateFridgeMeals(
  rawIngredients: FridgeIngredient[],
  children: { label: string; months: number; childIndex: number }[]
): FridgeMealResult[] {
  const mealTime = getCurrentMealTime();

  return children.map(({ label, months, childIndex }) => {
    const stage = getStage(months);

    // 1) 재료 필터링
    const usable: FridgeIngredient[] = [];
    const skipped: SkippedIngredient[] = [];

    for (const ing of rawIngredients) {
      const forbidden = isForbidden(ing.name);
      if (forbidden.forbidden && !forbidden.warnOnly) {
        skipped.push({ name: ing.name, reason: forbidden.reason });
        continue;
      }
      const ageCheck = isAgeAppropriate(ing.name, months);
      if (!ageCheck.ok) {
        skipped.push({ name: ing.name, reason: ageCheck.reason });
        continue;
      }
      usable.push(ing);
    }

    // 2) 분류
    const set: IngredientSet = {
      proteins:   usable.filter((i) => classify(i.name) === "protein"),
      vegetables: usable.filter((i) => classify(i.name) === "vegetable"),
      carbs:      usable.filter((i) => classify(i.name) === "carb" && !PROTEINS.some((p) => i.name.includes(p))),
      fruits:     usable.filter((i) => classify(i.name) === "fruit"),
      dairy:      usable.filter((i) => classify(i.name) === "dairy"),
      others:     usable.filter((i) => classify(i.name) === "other"),
    };

    // 3) 메뉴 생성
    const dishes = buildMealDishes(set, stage.name, months);

    // 4) 재료 라벨
    const ingredientLabels =
      usable.length > 0
        ? usable.map((i) => (i.amount ? `${i.name} ${i.amount}` : i.name))
        : ["쌀", "물"];

    return {
      childIndex,
      mealTime,
      dishes,
      menuName: buildMenuName(dishes, stage.name),
      ingredients: ingredientLabels,
      stageName: stage.name,
      months,
      childLabel: label,
      skipped,
      hasUsableIngredients: usable.length > 0,
    };
  });
}
