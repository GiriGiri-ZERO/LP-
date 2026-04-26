"use client";

import { useEditorStore } from "@/store/editor";
import type { HeroContent } from "@/types";

interface Props {
  blockId: string;
  content: HeroContent;
  selected: boolean;
  isEditing?: boolean;
  onDoubleClick?: () => void;
}

export function HeroBlock({ blockId, content, selected, isEditing = false }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editingElement = useEditorStore((s) => s.editingElement);
  const setEditingElement = useEditorStore((s) => s.setEditingElement);

  const isEditingHeadline = editingElement?.blockId === blockId && editingElement?.elementId === "headline";
  const isEditingSubheadline = editingElement?.blockId === blockId && editingElement?.elementId === "subheadline";
  const isEditingCta = editingElement?.blockId === blockId && editingElement?.elementId === "cta_button";
  const isEditingAny = isEditingHeadline || isEditingSubheadline || isEditingCta;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingElement(null);
  }

  return (
    <section
      className="relative px-8 py-20 text-center"
      style={{
        backgroundColor: content.background_color ?? "#1a1a2e",
        color: content.text_color ?? "#ffffff",
        backgroundImage: content.image_url ? `url(${content.image_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      {selected && !isEditing && !isEditingAny && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded pointer-events-none z-10">
          ダブルクリックで編集
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <h1
          className={`text-4xl font-bold mb-4 leading-tight outline-none ${isEditingHeadline ? "ring-2 ring-blue-400 rounded" : ""}`}
          style={{
            color: content.elementStyles?.headline?.color ?? undefined,
            fontSize: content.elementStyles?.headline?.fontSize ? `${content.elementStyles.headline.fontSize}px` : undefined,
            fontWeight: content.elementStyles?.headline?.fontWeight ?? undefined,
            fontStyle: content.elementStyles?.headline?.fontStyle ?? undefined,
            textAlign: content.elementStyles?.headline?.textAlign ?? undefined,
          }}
          data-el-block={blockId}
          data-el-id="headline"
          data-el-type="text"
          contentEditable={isEditingHeadline}
          suppressContentEditableWarning
          onKeyDown={isEditingHeadline ? handleKeyDown : undefined}
          onBlur={isEditingHeadline ? (e) => updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.headline}
        </h1>
        <p
          className={`text-xl mb-8 opacity-90 outline-none ${isEditingSubheadline ? "ring-2 ring-blue-400 rounded" : ""}`}
          style={{
            color: content.elementStyles?.subheadline?.color ?? undefined,
            fontSize: content.elementStyles?.subheadline?.fontSize ? `${content.elementStyles.subheadline.fontSize}px` : undefined,
          }}
          data-el-block={blockId}
          data-el-id="subheadline"
          data-el-type="text"
          contentEditable={isEditingSubheadline}
          suppressContentEditableWarning
          onKeyDown={isEditingSubheadline ? handleKeyDown : undefined}
          onBlur={isEditingSubheadline ? (e) => updateBlock(blockId, { subheadline: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.subheadline}
        </p>
        <button
          className={`inline-block px-10 py-4 rounded font-bold text-lg text-white outline-none ${isEditingCta ? "ring-2 ring-blue-400" : ""}`}
          style={{
            backgroundColor: content.elementStyles?.cta_button?.backgroundColor ?? content.button_color ?? "#e94560",
            borderRadius: content.elementStyles?.cta_button?.borderRadius !== undefined ? `${content.elementStyles.cta_button.borderRadius}px` : undefined,
            borderColor: content.elementStyles?.cta_button?.borderColor ?? undefined,
          }}
          data-el-block={blockId}
          data-el-id="cta_button"
          data-el-type="shape"
          contentEditable={isEditingCta}
          suppressContentEditableWarning
          onKeyDown={isEditingCta ? handleKeyDown : undefined}
          onBlur={isEditingCta ? (e) => updateBlock(blockId, { cta_text: e.currentTarget.textContent ?? "" }) : undefined}
        >
          {content.cta_text}
        </button>
      </div>
    </section>
  );
}
