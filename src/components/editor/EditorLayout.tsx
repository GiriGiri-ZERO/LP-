"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor";
import { IconBar, type IconBarCategory } from "./IconBar";
import { SubPanel } from "./SubPanel";
import { Canvas } from "./Canvas";
import { CodeView } from "./CodeView";
import { EditorHeader } from "./EditorHeader";
import type { Document } from "@/types";
import { debounce } from "@/lib/utils";

interface Props {
  document: Document;
  projectId: string;
}

export function EditorLayout({ document, projectId }: Props) {
  const [iconCategory, setIconCategory] = useState<IconBarCategory | null>("blocks");
  const { setDocument, activeTab, blocks, isDirty, setIsSaving } = useEditorStore(
    (s) => ({
      setDocument: s.setDocument,
      activeTab: s.activeTab,
      blocks: s.blocks,
      isDirty: s.isDirty,
      setIsSaving: s.setIsSaving,
    })
  );

  useEffect(() => {
    setDocument(document);
  }, [document, setDocument]);

  const autoSave = debounce(async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      await fetch(`/api/documents/${document.id}/blocks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
    } finally {
      setIsSaving(false);
    }
  }, 2000);

  useEffect(() => {
    if (isDirty) autoSave();
  }, [blocks, isDirty]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <EditorHeader documentId={document.id} projectId={projectId} />
      <div className="flex flex-1 overflow-hidden">
        <IconBar active={iconCategory} onChange={setIconCategory} />
        <SubPanel category={iconCategory} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "preview" && <Canvas />}
          {activeTab === "html" && <CodeView tab="html" />}
          {activeTab === "css" && <CodeView tab="css" />}
        </main>
      </div>
    </div>
  );
}
