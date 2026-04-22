"use client";

import { useEditorStore } from "@/store/editor";
import type { HeroContent } from "@/types";

interface Props {
  blockId: string;
  content: HeroContent;
  selected: boolean;
}

export function HeroBlock({ blockId, content, selected }: Props) {
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
    >
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold mb-4 leading-tight outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" })
          }
        >
          {content.headline}
        </h1>
        <p
          className="text-xl mb-8 opacity-90 outline-none"
          contentEditable
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
          className="inline-block px-10 py-4 rounded font-bold text-lg text-white outline-none"
          style={{ backgroundColor: "#e94560" }}
          contentEditable
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
