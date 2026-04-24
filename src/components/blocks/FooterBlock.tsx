"use client";

import type { FooterContent } from "@/types";

interface Props {
  blockId: string;
  content: FooterContent;
  selected: boolean;
  isEditing: boolean;
}

export function FooterBlock({ content, selected }: Props) {
  return (
    <footer
      className="relative px-8 py-8 text-center text-white"
      style={{ backgroundColor: "#1a1a2e" }}
    >
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      {content.company_name && (
        <div className="font-bold text-lg mb-2">{content.company_name}</div>
      )}
      {content.links && content.links.length > 0 && (
        <div className="mb-3 space-x-4">
          {content.links.map((l, i) => (
            <a key={i} href={l.url} className="text-gray-400 hover:text-white text-sm">
              {l.label}
            </a>
          ))}
        </div>
      )}
      {content.copyright && (
        <p className="text-gray-500 text-sm">{content.copyright}</p>
      )}
    </footer>
  );
}
