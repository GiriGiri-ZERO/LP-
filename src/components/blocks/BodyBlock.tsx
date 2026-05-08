"use client";

import { useEditorStore } from "@/store/editor";
import type { BodyContent } from "@/types";

interface Props {
  blockId: string;
  content: BodyContent;
  selected: boolean;
  isEditing: boolean;
}

export function BodyBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editingElement = useEditorStore((s) => s.editingElement);
  const setEditingElement = useEditorStore((s) => s.setEditingElement);

  const isEditingBody = editingElement?.blockId === blockId && editingElement?.elementId === "body";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingElement(null);
  }

  return (
    <section className="relative px-8 py-8">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div
        data-el-block={blockId}
        data-el-id="body"
        data-el-type="text"
        className={`max-w-3xl mx-auto prose prose-lg outline-none ${isEditingBody ? "ring-2 ring-blue-400 rounded" : ""}`}
        style={{ textAlign: content.align ?? "left" }}
        contentEditable={isEditingBody}
        suppressContentEditableWarning
        // dangerouslySetInnerHTML is used here because content.html is produced by the app
        // itself (AI or user edits), not arbitrary third-party input.
        dangerouslySetInnerHTML={{ __html: content.html }}
        onKeyDown={isEditingBody ? handleKeyDown : undefined}
        onBlur={isEditingBody ? (e) => updateBlock(blockId, { html: e.currentTarget.innerHTML }) : undefined}
      />
    </section>
  );
}
