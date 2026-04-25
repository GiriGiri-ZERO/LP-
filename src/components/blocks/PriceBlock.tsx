"use client";

import { useEditorStore } from "@/store/editor";
import type { PriceContent } from "@/types";

interface Props {
  blockId: string;
  content: PriceContent;
  selected: boolean;
  isEditing: boolean;
}

export function PriceBlock({ blockId, content, selected, isEditing }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const setEditingBlock = useEditorStore((s) => s.setEditingBlock);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingBlock(null);
  }

  const editableProps = isEditing
    ? {
        contentEditable: true as const,
        suppressContentEditableWarning: true,
        onKeyDown: handleKeyDown,
      }
    : { contentEditable: false as const };

  return (
    <section className="relative px-8 py-16 bg-gray-50">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-5xl mx-auto">
        {content.headline && (
          <h2
            {...editableProps}
            className={`text-3xl font-bold text-center mb-12 outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
            onBlur={isEditing ? (e) => updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" }) : undefined}
          >
            {content.headline}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.items.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl p-8 text-center border-2 ${
                plan.is_featured
                  ? "border-red-500 shadow-xl scale-105 bg-white"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.is_featured && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full mb-4 inline-block">
                  おすすめ
                </span>
              )}
              <h3
                {...editableProps}
                className={`text-xl font-bold mb-4 outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                onBlur={isEditing ? (e) => {
                  const newItems = [...content.items];
                  newItems[i] = { ...plan, name: e.currentTarget.textContent ?? "" };
                  updateBlock(blockId, { items: newItems });
                } : undefined}
              >
                {plan.name}
              </h3>
              <div className="mb-6">
                <span
                  {...editableProps}
                  className={`text-4xl font-bold text-red-500 outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                  onBlur={isEditing ? (e) => {
                    const newItems = [...content.items];
                    newItems[i] = { ...plan, price: e.currentTarget.textContent ?? "" };
                    updateBlock(blockId, { items: newItems });
                  } : undefined}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                )}
              </div>
              <ul className="text-left space-y-2 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    <span
                      {...editableProps}
                      className={`outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                      onBlur={isEditing ? (e) => {
                        const newFeatures = [...plan.features];
                        newFeatures[j] = e.currentTarget.textContent ?? "";
                        const newItems = [...content.items];
                        newItems[i] = { ...plan, features: newFeatures };
                        updateBlock(blockId, { items: newItems });
                      } : undefined}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                {...editableProps}
                className={`w-full py-3 rounded font-bold text-white outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                style={{ backgroundColor: "#e94560" }}
                onBlur={isEditing ? (e) => {
                  const newItems = [...content.items];
                  newItems[i] = { ...plan, cta_text: e.currentTarget.textContent ?? "" };
                  updateBlock(blockId, { items: newItems });
                } : undefined}
              >
                {plan.cta_text}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
