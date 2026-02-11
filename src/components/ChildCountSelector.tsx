"use client";

interface ChildCountSelectorProps {
  count: number;
  onChange: (count: number) => void;
}

const options = [1, 2, 3, 4] as const;

export default function ChildCountSelector({
  count,
  onChange,
}: ChildCountSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-light mb-3">
        자녀 수를 선택해주세요
      </label>
      <div className="grid grid-cols-4 gap-3">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`py-3 rounded-xl text-lg font-semibold transition-all ${
              count === n
                ? "bg-primary text-white shadow-md scale-105"
                : "bg-white text-text border border-border hover:border-primary hover:text-primary"
            }`}
          >
            {n}명
          </button>
        ))}
      </div>
    </div>
  );
}
