"use client";

import { useEditorStore } from "@/store/editor";
import type { TestimonialContent } from "@/types";

interface Props {
  blockId: string;
  content: TestimonialContent;
  selected: boolean;
  isEditing: boolean;
}

export function TestimonialBlock({ blockId, content, selected, isEditing }: Props) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.items.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex mb-3">
                {Array.from({ length: item.rating ?? 5 }).map((_, j) => (
                  <span key={j} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <blockquote
                {...editableProps}
                className={`text-gray-700 leading-relaxed mb-4 outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                onBlur={isEditing ? (e) => {
                  const newItems = [...content.items];
                  newItems[i] = { ...item, quote: e.currentTarget.textContent ?? "" };
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
                    {...editableProps}
                    className={`font-bold outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
                    onBlur={isEditing ? (e) => {
                      const newItems = [...content.items];
                      newItems[i] = { ...item, author: e.currentTarget.textContent ?? "" };
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
          ))}
        </div>
      </div>
    </section>
  );
}
