"use client";

import { useEditorStore } from "@/store/editor";
import type { HeadlineContent } from "@/types";

interface Props {
  blockId: string;
  content: HeadlineContent;
  selected: boolean;
}

const tags = ["h1", "h2", "h3", "h4"] as const;

export function HeadlineBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const Tag = tags[content.level - 1];

  const sizeMap = { 1: "text-4xl", 2: "text-3xl", 3: "text-2xl", 4: "text-xl" };

  return (
    <section className="relative px-8 py-10">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-4xl mx-auto">
        <Tag
          className={`${sizeMap[content.level]} font-bold outline-none`}
          style={{
            textAlign: content.align ?? "center",
            color: content.color ?? "inherit",
          }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            updateBlock(blockId, { text: e.currentTarget.textContent ?? "" })
          }
        >
          {content.text}
        </Tag>
      </div>
    </section>
  );
}
