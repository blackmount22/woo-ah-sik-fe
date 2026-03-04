import { getStage } from "./mealPlan";

export interface FridgeIngredient {
  name: string;
  amount: string;
}

export interface FridgeMealResult {
  mealTime: "아침" | "점심" | "저녁";
  menuName: string;
  ingredients: string[];
  steps: string[];
  tip?: string;
  stageName: string;
  months: number;
  childLabel: string;
}

// 현재 시각 기준 아이 식사 시간대 판정 (어른보다 1~2시간 이른 기준)
export function getCurrentMealTime(): "아침" | "점심" | "저녁" {
  const hour = new Date().getHours();
  if (hour < 10) return "아침";
  if (hour < 15) return "점심";
  return "저녁";
}

function generateMealName(
  ingredients: FridgeIngredient[],
  stageName: string
): string {
  const names = ingredients.map((i) => i.name);
  const first = names[0] ?? "";
  const second = names[1] ?? "";
  const pair = first + (second ? second : "");

  switch (stageName) {
    case "초기 이유식":
      return `${first}미음`;
    case "중기 이유식":
      return `${pair}죽`;
    case "후기 이유식":
      return second ? `${pair}무른밥` : `${first}무른밥`;
    case "완료기 이유식":
      return second ? `${pair}진밥` : `${first}진밥`;
    case "유아식":
    case "일반 유아식":
      return second ? `${pair}볶음밥` : `${first}볶음밥`;
    default:
      return `${pair}요리`;
  }
}

function generateSteps(
  ingredients: FridgeIngredient[],
  stageName: string
): string[] {
  const ingLabel = ingredients
    .map((i) => `${i.name}${i.amount ? ` ${i.amount}` : ""}`)
    .join(", ");
  const first = ingredients[0]?.name ?? "재료";

  switch (stageName) {
    case "초기 이유식":
      return [
        `${first}을(를) 깨끗이 씻어 껍질을 제거하고 잘게 자른다.`,
        "재료를 물과 함께 냄비에 넣어 푹 익힌다.",
        "핸드블렌더로 곱게 갈거나 체에 걸러 미음 농도로 만든다.",
        "미지근하게 식혀서 아기에게 먹인다.",
      ];
    case "중기 이유식":
      return [
        `재료(${ingLabel})를 깨끗이 씻어 잘게 다진다.`,
        "불린 쌀 1~2큰술에 다진 재료와 물 150ml를 넣고 센불로 끓인다.",
        "끓어오르면 약불로 줄이고 20분간 저으며 쌀이 완전히 퍼질 때까지 끓인다.",
        "블렌더로 적당히 갈아 죽 농도로 맞춘다.",
        "식혀서 아기에게 먹인다.",
      ];
    case "후기 이유식":
      return [
        `재료(${ingLabel})를 깨끗이 씻어 0.3~0.5cm 크기로 잘게 다진다.`,
        "불린 쌀 3큰술에 재료와 물 200ml를 넣고 센불로 끓인다.",
        "끓어오르면 약불로 줄이고 15~20분 끓여 무른밥 농도로 맞춘다.",
        "식혀서 아기에게 먹인다.",
      ];
    case "완료기 이유식":
      return [
        `재료(${ingLabel})를 0.5~1cm 크기로 썰어 준비한다.`,
        "냄비에 쌀과 재료, 물을 넣고 센불로 끓인다.",
        "끓어오르면 약불로 줄이고 15분간 끓여 진밥 농도로 조절한다.",
        "식혀서 아기에게 먹인다.",
      ];
    case "유아식":
    case "일반 유아식":
      return [
        `재료(${ingLabel})를 깨끗이 씻어 먹기 좋은 크기로 작게 썬다.`,
        "팬에 식용유(또는 버터)를 살짝 두르고 중불에서 재료를 볶는다.",
        "재료가 익으면 밥 2/3공기를 넣고 함께 볶는다.",
        "간이 필요하면 소금을 아주 소량 넣는다.",
        "충분히 식혀서 아이에게 먹인다.",
      ];
    default:
      return [
        `재료(${ingLabel})를 준비한다.`,
        "재료를 익혀서 아이에게 먹인다.",
      ];
  }
}

function generateTip(stageName: string): string | undefined {
  switch (stageName) {
    case "초기 이유식":
      return "처음 시도하는 재료라면 3~4일 간격으로 한 가지씩 추가해 알레르기 반응을 확인하세요.";
    case "중기 이유식":
      return "농도는 아기 상태에 맞게 조절하고, 새 재료는 하나씩 도입하세요.";
    case "후기 이유식":
      return "씹는 연습을 위해 재료를 완전히 으깨지 않고 약간의 식감을 남겨도 좋아요.";
    case "완료기 이유식":
      return "어른 밥보다 조금 더 부드럽게 지어주세요. 간은 최소화해요.";
    case "유아식":
    case "일반 유아식":
      return "나트륨 섭취를 줄이기 위해 간장, 소금 등은 최소한으로 사용하세요.";
    default:
      return undefined;
  }
}

export function generateFridgeMeals(
  ingredients: FridgeIngredient[],
  children: { label: string; months: number }[]
): FridgeMealResult[] {
  const mealTime = getCurrentMealTime();

  return children.map(({ label, months }) => {
    const stage = getStage(months);
    const menuName = generateMealName(ingredients, stage.name);
    const steps = generateSteps(ingredients, stage.name);
    const tip = generateTip(stage.name);

    return {
      mealTime,
      menuName,
      ingredients: ingredients.map((i) =>
        i.amount ? `${i.name} ${i.amount}` : i.name
      ),
      steps,
      tip,
      stageName: stage.name,
      months,
      childLabel: label,
    };
  });
}
