"use client";

import { useEditorStore } from "@/store/editor";
import type { FooterContent } from "@/types";

interface Props {
  blockId: string;
  content: FooterContent;
  selected: boolean;
  isEditing: boolean;
}

export function FooterBlock({ blockId, content, selected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editingElement = useEditorStore((s) => s.editingElement);
  const setEditingElement = useEditorStore((s) => s.setEditingElement);

  function isEditingEl(id: string) {
    return editingElement?.blockId === blockId && editingElement?.elementId === id;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditingElement(null);
    if (e.key === "Enter") (e.currentTarget as HTMLElement).blur();
  }

  function editableProps(elementId: string) {
    const active = isEditingEl(elementId);
    return active
      ? {
          contentEditable: true as const,
          suppressContentEditableWarning: true,
          onKeyDown: handleKeyDown,
          className: "outline-none ring-2 ring-blue-400 rounded cursor-text select-text",
        }
      : {
          contentEditable: false as const,
          className: "outline-none cursor-default",
        };
  }

  return (
    <footer
      className="relative px-8 py-8 text-center text-white"
      style={{ backgroundColor: "#1a1a2e" }}
    >
      {selected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
      )}
      {content.company_name && (() => {
        const companyEp = editableProps("company");
        return (
          <div
            {...companyEp}
            data-el-block={blockId}
            data-el-id="company"
            data-el-type="text"
            className={`font-bold text-lg mb-2 ${companyEp.className}`}
            onBlur={isEditingEl("company") ? (e) => updateBlock(blockId, { company_name: e.currentTarget.textContent ?? "" }) : undefined}
          >
            {content.company_name}
          </div>
        );
      })()}
      {content.links && content.links.length > 0 && (
        <div className="mb-3 space-x-4">
          {content.links.map((l, i) => (
            <a key={i} href={l.url} className="text-gray-400 hover:text-white text-sm">
              {l.label}
            </a>
          ))}
        </div>
      )}
      {content.copyright && (() => {
        const copyrightEp = editableProps("copyright");
        return (
          <p
            {...copyrightEp}
            data-el-block={blockId}
            data-el-id="copyright"
            data-el-type="text"
            className={`text-gray-500 text-sm ${copyrightEp.className}`}
            onBlur={isEditingEl("copyright") ? (e) => updateBlock(blockId, { copyright: e.currentTarget.textContent ?? "" }) : undefined}
          >
            {content.copyright}
          </p>
        );
      })()}
    </footer>
  );
}
