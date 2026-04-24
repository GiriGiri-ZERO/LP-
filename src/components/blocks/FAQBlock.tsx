"use client";

import { useEditorStore } from "@/store/editor";
import type { FAQContent } from "@/types";

interface Props {
  blockId: string;
  content: FAQContent;
  selected: boolean;
  isEditing: boolean;
}

export function FAQBlock({ blockId, content, selected, isEditing }: Props) {
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
    <section className="relative px-8 py-16 bg-white">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">よくあるご質問</h2>
        <div className="space-y-4">
          {content.items.map((item, i) => (
            <div key={i} className="border-b border-gray-200 pb-5">
              <h3
                {...editableProps}
                className={`text-lg font-bold text-red-500 mb-2 outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                onBlur={isEditing ? (e) => {
                  const newItems = [...content.items];
                  newItems[i] = { ...item, question: e.currentTarget.textContent ?? "" };
                  updateBlock(blockId, { items: newItems });
                } : undefined}
              >
                Q. {item.question}
              </h3>
              <p
                {...editableProps}
                className={`text-gray-600 leading-relaxed outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                onBlur={isEditing ? (e) => {
                  const newItems = [...content.items];
                  newItems[i] = { ...item, answer: e.currentTarget.textContent ?? "" };
                  updateBlock(blockId, { items: newItems });
                } : undefined}
              >
                A. {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
