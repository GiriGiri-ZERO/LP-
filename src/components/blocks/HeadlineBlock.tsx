"use client";

import { useEditorStore } from "@/store/editor";
import type { HeadlineContent } from "@/types";

interface Props {
  blockId: string;
  content: HeadlineContent;
  selected: boolean;
  isEditing: boolean;
}

const tags = ["h1", "h2", "h3", "h4"] as const;

export function HeadlineBlock({ blockId, content, selected, isEditing }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const setEditingBlock = useEditorStore((s) => s.setEditingBlock);
  const Tag = tags[(content.level ?? 2) - 1] ?? "h2";

  const sizeMap: Record<number, string> = { 1: "text-4xl", 2: "text-3xl", 3: "text-2xl", 4: "text-xl" };

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingBlock(null);
  }

  return (
    <section className="relative px-8 py-10">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-4xl mx-auto">
        <Tag
          className={`${sizeMap[content.level ?? 2] ?? "text-3xl"} font-bold outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
          style={{
            textAlign: content.elementStyles?.text?.textAlign ?? content.align ?? "center",
            color: content.elementStyles?.text?.color ?? content.color ?? "inherit",
            fontSize: content.elementStyles?.text?.fontSize ? `${content.elementStyles.text.fontSize}px` : undefined,
            fontWeight: content.elementStyles?.text?.fontWeight ?? undefined,
            fontStyle: content.elementStyles?.text?.fontStyle ?? undefined,
          }}
          data-el-block={blockId}
          data-el-id="text"
          data-el-type="text"
          contentEditable={isEditing}
          suppressContentEditableWarning
          onKeyDown={isEditing ? handleKeyDown : undefined}
          onBlur={isEditing ? (e) => updateBlock(blockId, { text: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.text}
        </Tag>
      </div>
    </section>
  );
}
