"use client";

const labels = ["첫째 아이", "둘째 아이", "셋째 아이", "넷째 아이"];

interface WeightInputProps {
  index: number;
  weight: string;
  onChange: (value: string) => void;
}

export default function WeightInput({
  index,
  weight,
  onChange,
}: WeightInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // 숫자와 소수점만 허용, 소수점 1자리까지
    if (v === "" || /^\d{1,2}(\.\d{0,1})?$/.test(v)) {
      onChange(v);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-2xl border border-border">
      <label className="block text-sm font-semibold text-primary mb-3">
        {labels[index]} 몸무게 (kg)
      </label>
      <input
        type="text"
        inputMode="decimal"
        placeholder="예: 5.0"
        value={weight}
        onChange={handleChange}
        className="w-full px-3 py-3 rounded-xl border border-border bg-white text-text text-center text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />
    </div>
  );
}
