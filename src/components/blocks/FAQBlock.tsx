"use client";

import { useEditorStore } from "@/store/editor";
import type { FAQContent } from "@/types";

interface Props {
  blockId: string;
  content: FAQContent;
  selected: boolean;
}

export function FAQBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  return (
    <section className="relative px-8 py-16 bg-white">
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">よくあるご質問</h2>
        <div className="space-y-4">
          {content.items.map((item, i) => (
            <div key={i} className="border-b border-gray-200 pb-5">
              <h3
                className="text-lg font-bold text-red-500 mb-2 outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...content.items];
                  newItems[i] = {
                    ...item,
                    question: e.currentTarget.textContent ?? "",
                  };
                  updateBlock(blockId, { items: newItems });
                }}
              >
                Q. {item.question}
              </h3>
              <p
                className="text-gray-600 leading-relaxed outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newItems = [...content.items];
                  newItems[i] = {
                    ...item,
                    answer: e.currentTarget.textContent ?? "",
                  };
                  updateBlock(blockId, { items: newItems });
                }}
              >
                A. {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
