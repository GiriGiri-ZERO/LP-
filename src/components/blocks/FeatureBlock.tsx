"use client";

import { useEditorStore } from "@/store/editor";
import type { FeatureContent } from "@/types";

interface Props {
  blockId: string;
  content: FeatureContent;
  selected: boolean;
}

export function FeatureBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  return (
    <section className="relative px-8 py-16 bg-white">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-5xl mx-auto">
        {content.headline && (
          <h2
            className="text-3xl font-bold text-center mb-12 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              updateBlock(blockId, { headline: e.currentTarget.textContent ?? "" })
            }
          >
            {content.headline}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.items.map((item, i) => (
            <div key={i} className="text-center p-6">
              {item.icon && (
                <span className="text-4xl mb-4 block">{item.icon}</span>
              )}
              <h3
                className="text-xl font-bold mb-3 outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...content.items];
                  newItems[i] = { ...item, title: e.currentTarget.textContent ?? "" };
                  updateBlock(blockId, { items: newItems });
                }}
              >
                {item.title}
              </h3>
              <p
                className="text-gray-600 leading-relaxed outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...content.items];
                  newItems[i] = {
                    ...item,
                    description: e.currentTarget.textContent ?? "",
                  };
                  updateBlock(blockId, { items: newItems });
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
