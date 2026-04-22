"use client";

import { useEditorStore } from "@/store/editor";
import type { BodyContent } from "@/types";

interface Props {
  blockId: string;
  content: BodyContent;
  selected: boolean;
}

export function BodyBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  return (
    <section className="relative px-8 py-8">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div
        className="max-w-3xl mx-auto prose prose-lg outline-none"
        style={{ textAlign: content.align ?? "left" }}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: content.html }}
        onBlur={(e) =>
          updateBlock(blockId, { html: e.currentTarget.innerHTML })
        }
      />
    </section>
  );
}
