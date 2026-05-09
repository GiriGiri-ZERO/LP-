"use client";

import { useEditorStore } from "@/store/editor";
import type { TestimonialContent } from "@/types";

interface Props {
  blockId: string;
  content: TestimonialContent;
  selected: boolean;
  isEditing: boolean;
}

export function TestimonialBlock({ blockId, content, selected }: Props) {
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
          className: `outline-none ring-2 ring-blue-400 rounded cursor-text select-text`,
        }
      : {
          contentEditable: false as const,
          className: "outline-none cursor-default",
        };
  }

  return (
    <section className="relative px-8 py-16 bg-gray-50">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.items.map((item, i) => {
            const quoteEp = editableProps(`quote[${i}]`);
            const authorEp = editableProps(`author[${i}]`);
            return (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex mb-3">
                  {Array.from({ length: item.rating ?? 5 }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <blockquote
                  {...quoteEp}
                  data-el-block={blockId}
                  data-el-id={`quote[${i}]`}
                  data-el-type="text"
                  className={`text-gray-700 leading-relaxed mb-4 ${quoteEp.className}`}
                  onBlur={isEditingEl(`quote[${i}]`) ? (e) => {
                    const raw = e.currentTarget.textContent ?? "";
                    const newItems = content.items.map((it, j) =>
                      j === i ? { ...it, quote: raw.replace(/^\u201C|\u201D$/g, "") } : it
                    );
                    updateBlock(blockId, { items: newItems });
                  } : undefined}
                >
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  {item.avatar_url && (
                    <img
                      src={item.avatar_url}
                      alt={item.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p
                      {...authorEp}
                      data-el-block={blockId}
                      data-el-id={`author[${i}]`}
                      data-el-type="text"
                      className={`font-bold ${authorEp.className}`}
                      onBlur={isEditingEl(`author[${i}]`) ? (e) => {
                        const newItems = content.items.map((it, j) =>
                          j === i ? { ...it, author: e.currentTarget.textContent ?? "" } : it
                        );
                        updateBlock(blockId, { items: newItems });
                      } : undefined}
                    >
                      {item.author}
                    </p>
                    {item.role && (
                      <p className="text-sm text-gray-500">{item.role}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
