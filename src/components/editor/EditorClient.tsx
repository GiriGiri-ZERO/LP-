"use client";

import dynamic from "next/dynamic";
import type { Document } from "@/types";

const EditorLayout = dynamic(
  () => import("./EditorLayout").then((m) => m.EditorLayout),
  { ssr: false, loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <p className="text-gray-400">エディタを読み込み中...</p>
    </div>
  )}
);

export function EditorClient({ document, projectId }: { document: Document; projectId: string }) {
  return <EditorLayout document={document} projectId={projectId} />;
}
