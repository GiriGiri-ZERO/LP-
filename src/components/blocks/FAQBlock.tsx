"use client";

import { useEditorStore } from "@/store/editor";
import type { FAQContent } from "@/types";

interface Props {
  blockId: string;
  content: FAQContent;
  selected: boolean;
  isEditing: boolean;
}

export function FAQBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editingElement = useEditorStore((s) => s.editingElement);
  const setEditingElement = useEditorStore((s) => s.setEditingElement);

  function isEditingEl(id: string) {
    return editingElement?.blockId === blockId && editingElement?.elementId === id;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingElement(null);
    if (e.key === "Enter") (e.currentTarget as HTMLElement).blur();
  }

  function editableProps(elementId: string) {
    const active = isEditingEl(elementId);
    return active
      ? {
          contentEditable: true as const,
          suppressContentEditableWarning: true,
          onKeyDown: handleKeyDown,
          className: "outline-none ring-2 ring-blue-400 rounded cursor-text select-text",
        }
      : {
          contentEditable: false as const,
          className: "outline-none cursor-default",
        };
  }

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
                {...editableProps(`question[${i}]`)}
                data-el-block={blockId}
                data-el-id={`question[${i}]`}
                data-el-type="text"
                className={`text-lg font-bold text-red-500 mb-2 ${editableProps(`question[${i}]`).className}`}
                onBlur={isEditingEl(`question[${i}]`) ? (e) => {
                  const newItems = content.items.map((it, j) =>
                    j === i ? { ...it, question: e.currentTarget.textContent ?? "" } : it
                  );
                  updateBlock(blockId, { items: newItems });
                } : undefined}
              >
                Q. {item.question}
              </h3>
              <p
                {...editableProps(`answer[${i}]`)}
                data-el-block={blockId}
                data-el-id={`answer[${i}]`}
                data-el-type="text"
                className={`text-gray-600 leading-relaxed ${editableProps(`answer[${i}]`).className}`}
                onBlur={isEditingEl(`answer[${i}]`) ? (e) => {
                  const newItems = content.items.map((it, j) =>
                    j === i ? { ...it, answer: e.currentTarget.textContent ?? "" } : it
                  );
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
