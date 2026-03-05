"use client";

import { useState, KeyboardEvent, useRef } from "react";
import type { FridgeIngredient } from "@/lib/fridgeMeal";

interface Props {
  onConfirm: (ingredients: FridgeIngredient[]) => void;
  onClose: () => void;
}

export default function FridgeMealModal({ onConfirm, onClose }: Props) {
  const [nameInput, setNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [ingredients, setIngredients] = useState<FridgeIngredient[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  const addIngredient = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setIngredients((prev) => [
      ...prev,
      { name: trimmed, amount: amountInput.trim() },
    ]);
    setNameInput("");
    setAmountInput("");
    nameRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] overflow-x-hidden">
        {/* 헤더 */}
        <div className="p-5 border-b border-border">
          <div className="text-3xl mb-1">🧊</div>
          <h2 className="text-lg font-bold text-text">냉장고 파먹기</h2>
          <p className="text-sm text-text-light mt-1 leading-relaxed">
            냉장고에 있는 재료를 입력하면
            <br />
            아이 식단에 맞는 레시피를 만들어드려요!
          </p>
        </div>

        {/* 재료 입력 */}
        <div className="p-5 flex flex-col gap-3 overflow-y-auto flex-1">
          <div className="flex gap-2">
            <input
              ref={nameRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="재료명 (예: 당근)"
              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="양 (예: 1/4개)"
              className="w-24 px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={addIngredient}
              disabled={!nameInput.trim()}
              className="shrink-0 whitespace-nowrap px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold disabled:bg-border disabled:text-text-light transition-all active:scale-[0.97]"
            >
              추가
            </button>
          </div>

          {/* 추가된 재료 목록 */}
          {ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {ing.name}
                  {ing.amount ? (
                    <span className="text-primary/70">({ing.amount})</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="ml-0.5 text-primary/50 hover:text-primary font-bold leading-none"
                    aria-label={`${ing.name} 삭제`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center text-text-light text-sm gap-1">
              <span className="text-2xl">🥕</span>
              <p>재료를 입력하고 추가해주세요</p>
              <p className="text-xs">재료명만 입력해도 괜찮아요</p>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-5 border-t border-border flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onConfirm(ingredients)}
            disabled={ingredients.length === 0}
            className="w-full py-3 rounded-xl text-base font-bold bg-primary text-white disabled:bg-border disabled:text-text-light transition-all active:scale-[0.98]"
          >
            식단 만들기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl text-base font-bold bg-white text-text-light border border-border hover:bg-gray-50 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
