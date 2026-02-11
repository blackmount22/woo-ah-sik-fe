"use client";

interface BirthDateInput {
  index: number;
  year: string;
  month: string;
  day: string;
  onChange: (field: "year" | "month" | "day", value: string) => void;
}

const labels = ["첫째 아이", "둘째 아이", "셋째 아이", "넷째 아이"];

function getDaysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

export default function BirthDateInput({
  index,
  year,
  month,
  day,
  onChange,
}: BirthDateInput) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysCount = getDaysInMonth(Number(year), Number(month));
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);

  const selectClass =
    "flex-1 min-w-0 px-3 py-3 rounded-xl border border-border bg-white text-text text-center text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

  return (
    <div className="w-full p-4 bg-white rounded-2xl border border-border">
      <label className="block text-sm font-semibold text-primary mb-3">
        🍼 {labels[index]}
      </label>
      <div className="flex gap-2">
        <select
          value={year}
          onChange={(e) => onChange("year", e.target.value)}
          className={selectClass}
        >
          <option value="">년도</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => onChange("month", e.target.value)}
          className={selectClass}
        >
          <option value="">월</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>

        <select
          value={day}
          onChange={(e) => onChange("day", e.target.value)}
          className={selectClass}
        >
          <option value="">일</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}일
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
