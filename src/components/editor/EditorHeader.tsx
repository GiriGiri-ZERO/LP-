"use client";

import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { EditorTab, Viewport } from "@/types";
import {
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Share2,
  Undo2,
  Redo2,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TABS: { id: EditorTab; label: string }[] = [
  { id: "preview", label: "プレビュー" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
];

const VIEWPORTS: { id: Viewport; icon: React.ReactNode; label: string }[] = [
  { id: "pc", icon: <Monitor size={16} />, label: "PC" },
  { id: "tab", icon: <Tablet size={16} />, label: "タブレット" },
  { id: "sp", icon: <Smartphone size={16} />, label: "スマホ" },
];

interface Props {
  documentId: string;
  projectId: string;
}

export function EditorHeader({ documentId, projectId }: Props) {
  const { activeTab, setActiveTab, viewport, setViewport, isSaving, isDirty, document: doc } =
    useEditorStore(
      useShallow((s) => ({
        activeTab: s.activeTab,
        setActiveTab: s.setActiveTab,
        viewport: s.viewport,
        setViewport: s.setViewport,
        isSaving: s.isSaving,
        isDirty: s.isDirty,
        document: s.document,
      }))
    );

  async function handleExportHTML() {
    const res = await fetch(`/api/documents/${documentId}/export/html`, {
      method: "POST",
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc?.title ?? "lp"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <header className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 shrink-0 h-12">
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${projectId}`}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <span className="text-sm font-medium text-white truncate max-w-40">
          {doc?.title ?? "無題のドキュメント"}
        </span>
        <div className="flex items-center gap-1 text-gray-500">
          <button title="元に戻す" className="p-1 hover:text-white transition-colors">
            <Undo2 size={15} />
          </button>
          <button title="やり直す" className="p-1 hover:text-white transition-colors">
            <Redo2 size={15} />
          </button>
        </div>
        {(isSaving || isDirty) && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            {isSaving ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                保存中...
              </>
            ) : (
              "未保存"
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-3 py-1 text-xs rounded-md font-medium transition-colors",
              activeTab === t.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 bg-gray-800 rounded-lg p-0.5">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              title={v.label}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                viewport === v.id
                  ? "bg-gray-600 text-white"
                  : "text-gray-500 hover:text-white"
              )}
            >
              {v.icon}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" className="text-gray-400 h-7 px-2">
          <Share2 size={14} />
        </Button>
        <Button
          size="sm"
          className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          onClick={handleExportHTML}
        >
          <Download size={13} />
          エクスポート
        </Button>
      </div>
    </header>
  );
}
