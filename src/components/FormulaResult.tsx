"use client";

import type { Stage, FormulaAmount } from "@/lib/mealPlan";

interface FormulaResultProps {
  childLabel: string;
  months: number;
  stage: Stage;
  weightKg: number;
  formula: FormulaAmount;
}

function buildSchedule(
  feedingsPerDay: number,
  perFeedingMin: number,
  perFeedingMax: number
): { time: string; amount: string }[] {
  // 24시간을 수유 횟수로 균등 분배
  const interval = Math.floor(24 / feedingsPerDay);

  // 신생아(8회)는 00시 시작, 그 외는 06시 시작
  const startHour = feedingsPerDay >= 8 ? 0 : 6;

  return Array.from({ length: feedingsPerDay }, (_, i) => {
    const hour = (startHour + i * interval) % 24;
    const hh = String(hour).padStart(2, "0");
    return {
      time: `${hh}:00`,
      amount: `${perFeedingMin}~${perFeedingMax}`,
    };
  });
}

export default function FormulaResult({
  childLabel,
  months,
  stage,
  weightKg,
  formula,
}: FormulaResultProps) {
  const schedule = buildSchedule(
    formula.feedingsPerDay,
    formula.perFeedingMin,
    formula.perFeedingMax
  );

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-text">
          {childLabel} — {months}개월
        </h2>
        <span className="inline-block mt-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
          {stage.name}
        </span>
      </div>

      {/* 하루 분유량 */}
      <div className="p-5 bg-white rounded-2xl border border-border mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <span className="text-sm font-bold text-primary">하루 권장 분유량</span>
        </div>
        <p className="text-2xl font-bold text-text text-center">
          총 {formula.dailyTotal}ml
        </p>
        <p className="text-sm text-text-light text-center mt-1">
          (체중 {weightKg}kg × 150ml, 최대 1000ml)
        </p>
      </div>

      {/* 1회 적정량 */}
      <div className="p-5 bg-white rounded-2xl border border-border mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🍼</span>
          <span className="text-sm font-bold text-primary">1회 적정량</span>
        </div>
        <p className="text-2xl font-bold text-text text-center">
          {formula.perFeedingMin}~{formula.perFeedingMax}ml
        </p>
        <p className="text-sm text-text-light text-center mt-1">
          하루 {formula.feedingsPerDay}회 · {formula.intervalDesc} 간격
        </p>
        <p className="text-xs text-text-light text-center mt-1">
          ({formula.dailyTotal}ml ÷ {formula.feedingsPerDay}회 = 최대 {formula.perFeedingMax}ml)
        </p>
      </div>

      {/* 수유 스케줄 */}
      <div className="p-5 bg-white rounded-2xl border border-border mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🕐</span>
          <span className="text-sm font-bold text-primary">수유 스케줄 (예시)</span>
        </div>
        <div className="flex flex-col gap-2">
          {schedule.map((s) => (
            <div
              key={s.time}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10"
            >
              <span className="text-sm font-semibold text-text">{s.time}</span>
              <span className="text-sm font-medium text-primary">
                🍼 {s.amount}ml
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 참고 안내 */}
      <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20">
        <p className="text-xs text-text-light leading-relaxed">
          💡 <strong>참고:</strong> 분유량은 체중 × 150ml 기준이며, 하루
          최대 1000ml를 초과하지 않도록 합니다. 1회 최대량({formula.perFeedingMax}ml)
          × {formula.feedingsPerDay}회 = {formula.perFeedingMax * formula.feedingsPerDay}ml로
          하루 총량({formula.dailyTotal}ml)을 넘지 않습니다. 아기마다 먹는
          양에 차이가 있으므로, 실제 수유량은 아기의 컨디션과 의사 상담을
          참고해 조절해주세요.
        </p>
      </div>
    </div>
  );
}
