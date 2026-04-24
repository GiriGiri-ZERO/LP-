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

export function HeroBlock({ blockId, content, selected, isEditing = false, onDoubleClick }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  return (
    <section
      className="relative px-8 py-20 text-center"
      style={{
        backgroundColor: content.background_color ?? "#1a1a2e",
        color: content.text_color ?? "#ffffff",
        backgroundImage: content.image_url
          ? `url(${content.image_url})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onDoubleClick={onDoubleClick}
    >
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      {selected && !isEditing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded pointer-events-none z-10">
          ダブルクリックで編集
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <h1
          className={`text-4xl font-bold mb-4 leading-tight outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) =>
            updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" })
          }
        >
          {content.headline}
        </h1>
        <p
          className={`text-xl mb-8 opacity-90 outline-none ${isEditing ? "ring-2 ring-blue-400 rounded" : ""}`}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) =>
            updateBlock(blockId, {
              subheadline: e.currentTarget.textContent ?? "",
            })
          }
        >
          {content.subheadline}
        </p>
        <button
          className={`inline-block px-10 py-4 rounded font-bold text-lg text-white outline-none ${isEditing ? "ring-2 ring-blue-400" : ""}`}
          style={{ backgroundColor: "#e94560" }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) =>
            updateBlock(blockId, { cta_text: e.currentTarget.textContent ?? "" })
          }
        >
          {content.cta_text}
        </button>
      </div>
    </section>
  );
}
