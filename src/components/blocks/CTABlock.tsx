"use client";

import { useEditorStore } from "@/store/editor";
import type { CTAContent } from "@/types";

interface Props {
  blockId: string;
  content: CTAContent;
  selected: boolean;
  isEditing: boolean;
}

export function CTABlock({ blockId, content, selected, isEditing }: Props) {
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
        className: "outline-none ring-2 ring-blue-400 rounded",
      }
    : { contentEditable: false as const, className: "outline-none" };

  return (
    <section
      className="relative px-8 py-16 text-center"
      style={{ backgroundColor: content.background_color ?? "#f9f9f9" }}
    >
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-2xl mx-auto">
        {content.headline && (
          <h2
            {...editableProps}
            className={`text-3xl font-bold mb-4 ${editableProps.className}`}
            onBlur={isEditing ? (e) => updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" }) : undefined}
          >
            {content.headline}
          </h2>
        )}
        {content.body && (
          <p
            {...editableProps}
            className={`text-lg mb-8 text-gray-600 ${editableProps.className}`}
            onBlur={isEditing ? (e) => updateBlock(blockId, { body: e.currentTarget.textContent ?? "" }) : undefined}
          >
            {content.body}
          </p>
        )}
        <button
          {...editableProps}
          className={`inline-block px-10 py-4 rounded font-bold text-lg text-white ${editableProps.className}`}
          style={{
            backgroundColor: content.elementStyles?.["button"]?.backgroundColor ?? content.button_color ?? "#e94560",
            borderRadius: content.elementStyles?.["button"]?.borderRadius !== undefined
              ? `${content.elementStyles["button"].borderRadius}px` : undefined,
            transform: (content.elementStyles?.["button"]?.offsetX || content.elementStyles?.["button"]?.offsetY)
              ? `translate(${content.elementStyles["button"].offsetX ?? 0}px, ${content.elementStyles["button"].offsetY ?? 0}px)` : undefined,
          }}
          data-el-block={blockId}
          data-el-id="button"
          data-el-type="shape"
          onBlur={isEditing ? (e) => updateBlock(blockId, { button_text: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.button_text}
        </button>
      </div>
    </section>
  );
}
