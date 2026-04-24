"use client";

import { useEditorStore } from "@/store/editor";
import type { HeroContent } from "@/types";

interface Props {
  blockId: string;
  content: HeroContent;
  selected: boolean;
  isEditing: boolean;
}

export function HeroBlock({ blockId, content, selected, isEditing }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const setEditingBlock = useEditorStore((s) => s.setEditingBlock);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setEditingBlock(null);
    }
  }

  const editableProps = isEditing
    ? {
        contentEditable: true as const,
        suppressContentEditableWarning: true,
        onKeyDown: handleKeyDown,
        className: "outline-none ring-2 ring-blue-400 rounded",
      }
    : { contentEditable: false as const };

  return (
    <section
      className={`relative px-8 py-20 text-center ${selected ? "ring-2 ring-blue-500 ring-inset" : ""}`}
      style={{
        backgroundColor: content.background_color ?? "#1a1a2e",
        color: content.text_color ?? "#ffffff",
        backgroundImage: content.image_url ? `url(${content.image_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold mb-4 leading-tight outline-none"
          {...editableProps}
          onBlur={isEditing ? (e) => updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.headline}
        </h1>
        <p
          className="text-xl mb-8 opacity-90 outline-none"
          {...editableProps}
          onBlur={isEditing ? (e) => updateBlock(blockId, { subheadline: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.subheadline}
        </p>
        <button
          className="inline-block px-10 py-4 rounded font-bold text-lg text-white outline-none"
          style={{ backgroundColor: "#e94560" }}
          {...editableProps}
          onBlur={isEditing ? (e) => updateBlock(blockId, { cta_text: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.cta_text}
        </button>
      </div>
    </section>
  );
}
