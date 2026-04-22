"use client";

import { useEditorStore } from "@/store/editor";
import type { CTAContent } from "@/types";

interface Props {
  blockId: string;
  content: CTAContent;
  selected: boolean;
}

export function CTABlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

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
            className="text-3xl font-bold mb-4 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" })
            }
          >
            {content.headline}
          </h2>
        )}
        {content.body && (
          <p
            className="text-lg mb-8 text-gray-600 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              updateBlock(blockId, { body: e.currentTarget.textContent ?? "" })
            }
          >
            {content.body}
          </p>
        )}
        <button
          className="inline-block px-10 py-4 rounded font-bold text-lg text-white outline-none"
          style={{ backgroundColor: content.button_color ?? "#e94560" }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            updateBlock(blockId, { button_text: e.currentTarget.textContent ?? "" })
          }
        >
          {content.button_text}
        </button>
      </div>
    </section>
  );
}
