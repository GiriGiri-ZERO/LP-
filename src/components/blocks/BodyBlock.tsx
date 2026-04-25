"use client";

import { useEditorStore } from "@/store/editor";
import type { BodyContent } from "@/types";

interface Props {
  blockId: string;
  content: BodyContent;
  selected: boolean;
  isEditing: boolean;
}

export function BodyBlock({ blockId, content, selected, isEditing }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const setEditingBlock = useEditorStore((s) => s.setEditingBlock);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingBlock(null);
  }

  return (
    <section className="relative px-8 py-8">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div
        className={`max-w-3xl mx-auto prose prose-lg outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
        style={{ textAlign: content.align ?? "left" }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        // dangerouslySetInnerHTML is intentionally used here; content is produced
        // by the app itself (AI or user inline edits), not arbitrary third-party HTML.
        dangerouslySetInnerHTML={{ __html: content.html }}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onBlur={isEditing ? (e) => updateBlock(blockId, { html: e.currentTarget.innerHTML }) : undefined}
      />
    </section>
  );
}
