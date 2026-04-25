"use client";

import { useEffect, useState, useRef } from "react";
import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import { generateHTML, generateCSS } from "@/lib/html/generate";
import { debounce } from "@/lib/utils";

type CodeTab = "html" | "css";

interface Props {
  tab: CodeTab;
}

export function CodeView({ tab }: Props) {
  const { blocks, document: doc } = useEditorStore(
    useShallow((s) => ({
      blocks: s.blocks,
      document: s.document,
    }))
  );

  const theme = doc?.theme ?? {};
  const [code, setCode] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!doc) return;
    try {
      if (tab === "html") {
        setCode(generateHTML(blocks, theme));
      } else {
        setCode(generateCSS(blocks, theme));
      }
    } catch (error) {
      setCode("/* エラー: " + (error instanceof Error ? error.message : String(error)) + " */");
    }
  }, [blocks, theme, tab, doc]);

  const debouncedSave = useRef(
    debounce((value: string, docId: string, tabType: CodeTab) => {
      fetch(`/api/documents/${docId}/code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tabType, content: value }),
      }).catch(console.error);
    }, 500)
  );

  const handleChange = (value: string) => {
    setCode(value);
    if (doc?.id) {
      debouncedSave.current(value, doc.id, tab);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">
          {tab === "html" ? "index.html" : "styles.css"}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          コピー
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 bg-gray-950 text-green-400 font-mono text-xs p-4 resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}
