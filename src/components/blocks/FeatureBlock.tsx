"use client";

import { useEditorStore } from "@/store/editor";
import type { FeatureContent } from "@/types";

interface Props {
  blockId: string;
  content: FeatureContent;
  selected: boolean;
  isEditing: boolean;
}

export function FeatureBlock({ blockId, content, selected }: Props) {
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
      <div className="max-w-5xl mx-auto">
        {content.headline && (() => {
          const hlEp = editableProps("headline");
          return (
            <h2
              {...hlEp}
              data-el-block={blockId}
              data-el-id="headline"
              data-el-type="text"
              className={`text-3xl font-bold text-center mb-12 ${hlEp.className}`}
              onBlur={isEditingEl("headline") ? (e) => updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" }) : undefined}
            >
              {content.headline}
            </h2>
          );
        })()}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.items.map((item, i) => {
            const titleEp = editableProps(`title[${i}]`);
            const descEp = editableProps(`desc[${i}]`);
            return (
              <div key={i} className="text-center p-6">
                {item.icon && (
                  <span className="text-4xl mb-4 block">{item.icon}</span>
                )}
                <h3
                  {...titleEp}
                  data-el-block={blockId}
                  data-el-id={`title[${i}]`}
                  data-el-type="text"
                  className={`text-xl font-bold mb-3 ${titleEp.className}`}
                  onBlur={isEditingEl(`title[${i}]`) ? (e) => {
                    const newItems = content.items.map((it, j) =>
                      j === i ? { ...it, title: e.currentTarget.textContent ?? "" } : it
                    );
                    updateBlock(blockId, { items: newItems });
                  } : undefined}
                >
                  {item.title}
                </h3>
                <p
                  {...descEp}
                  data-el-block={blockId}
                  data-el-id={`desc[${i}]`}
                  data-el-type="text"
                  className={`text-gray-600 leading-relaxed ${descEp.className}`}
                  onBlur={isEditingEl(`desc[${i}]`) ? (e) => {
                    const newItems = content.items.map((it, j) =>
                      j === i ? { ...it, description: e.currentTarget.textContent ?? "" } : it
                    );
                    updateBlock(blockId, { items: newItems });
                  } : undefined}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
