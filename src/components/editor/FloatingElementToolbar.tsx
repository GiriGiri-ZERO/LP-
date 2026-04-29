"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import type { ElementStyle } from "@/types";

const TOOLBAR_HEIGHT = 40;
const GAP = 8;

export function FloatingElementToolbar() {
  const { selectedElement, updateElementStyle, removeOverlayElement, setSelectedElement, editingBlockId, isDraggingElement } = useEditorStore(
    useShallow((s) => ({
      selectedElement: s.selectedElement,
      updateElementStyle: s.updateElementStyle,
      removeOverlayElement: s.removeOverlayElement,
      setSelectedElement: s.setSelectedElement,
      editingBlockId: s.editingBlockId,
      isDraggingElement: s.isDraggingElement,
    }))
  );

  // Targeted subscription: only re-render when THIS element's style changes
  const style: ElementStyle = useEditorStore(
    useShallow((s) => {
      if (!s.selectedElement) return {};
      const block = s.blocks.find(b => b.id === s.selectedElement!.blockId);
      const content = block?.content as { elementStyles?: Record<string, ElementStyle> } | undefined;
      return content?.elementStyles?.[s.selectedElement.elementId] ?? {};
    })
  );

  // Detect if selected element is an overlay element (can be deleted)
  const isOverlay = useEditorStore(
    useShallow((s) => {
      if (!s.selectedElement) return false;
      const block = s.blocks.find(b => b.id === s.selectedElement!.blockId);
      return block?.overlayElements?.some(el => el.id === s.selectedElement!.elementId) ?? false;
    })
  );

  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Re-measure position when selected element or its style changes (e.g. fontSize resize)
  useEffect(() => {
    if (!selectedElement) { setPos(null); return; }
    const el = document.querySelector<HTMLElement>(
      `[data-el-block="${selectedElement.blockId}"][data-el-id="${selectedElement.elementId}"]`
    );
    if (!el) { setPos(null); return; }
    const rect = el.getBoundingClientRect();
    setPos({
      top: Math.max(4, rect.top - TOOLBAR_HEIGHT - GAP),
      left: Math.max(8, rect.left),
    });
  }, [selectedElement, style]);

  if (!mounted || !selectedElement || editingBlockId || isDraggingElement || !pos) return null;

  const update = (patch: Partial<ElementStyle>) => {
    updateElementStyle(selectedElement.blockId, selectedElement.elementId, patch);
  };

  const handleDelete = () => {
    removeOverlayElement(selectedElement.blockId, selectedElement.elementId);
    setSelectedElement(null);
  };

  const toolbar = (
    <div
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl flex items-center gap-1 px-2 py-1"
      style={{ top: pos.top, left: pos.left, height: TOOLBAR_HEIGHT }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {selectedElement.elementType === "text" ? (
        <>
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer" title="文字色">
            <span className="font-bold">A</span>
            <input
              type="color"
              value={style.color ?? "#000000"}
              onChange={(e) => update({ color: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer p-0 border-0"
            />
          </label>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <input
            type="number"
            min={10}
            max={200}
            step={2}
            value={style.fontSize ?? 16}
            onChange={(e) => update({ fontSize: Number(e.target.value) })}
            className="w-12 h-6 text-xs text-center border border-gray-200 rounded"
            title="フォントサイズ (px)"
          />
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button
            onClick={() => update({ fontWeight: style.fontWeight === "bold" ? "normal" : "bold" })}
            className={`w-6 h-6 text-xs font-bold rounded flex items-center justify-center transition-colors ${style.fontWeight === "bold" ? "bg-gray-200" : "hover:bg-gray-100"}`}
            title="太字"
          >B</button>
          <button
            onClick={() => update({ fontStyle: style.fontStyle === "italic" ? "normal" : "italic" })}
            className={`w-6 h-6 text-xs italic rounded flex items-center justify-center transition-colors ${style.fontStyle === "italic" ? "bg-gray-200" : "hover:bg-gray-100"}`}
            title="斜体"
          >I</button>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button onClick={() => update({ textAlign: "left" })} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${style.textAlign === "left" ? "bg-gray-200" : "hover:bg-gray-100"}`} title="左揃え"><AlignLeft size={12} /></button>
          <button onClick={() => update({ textAlign: "center" })} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${style.textAlign === "center" ? "bg-gray-200" : "hover:bg-gray-100"}`} title="中央揃え"><AlignCenter size={12} /></button>
          <button onClick={() => update({ textAlign: "right" })} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${style.textAlign === "right" ? "bg-gray-200" : "hover:bg-gray-100"}`} title="右揃え"><AlignRight size={12} /></button>
          {(style.offsetX || style.offsetY) ? (
            <>
              <div className="w-px h-5 bg-gray-200 mx-0.5" />
              <button onClick={() => update({ offsetX: 0, offsetY: 0 })} className="px-1.5 h-6 text-xs rounded text-gray-500 hover:bg-gray-100" title="位置をリセット">↩ リセット</button>
            </>
          ) : null}
        </>
      ) : (
        <>
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer" title="塗り色">
            <span>塗り</span>
            <input
              type="color"
              value={style.backgroundColor ?? "#ffffff"}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer p-0 border-0"
            />
          </label>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer" title="枠線色">
            <span>枠</span>
            <input
              type="color"
              value={style.borderColor ?? "#e5e5e5"}
              onChange={(e) => update({ borderColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer p-0 border-0"
            />
          </label>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <label className="flex items-center gap-1 text-xs text-gray-600" title="角丸 (px)">
            <span>角丸</span>
            <input
              type="number"
              min={0}
              max={50}
              value={style.borderRadius ?? 4}
              onChange={(e) => update({ borderRadius: Number(e.target.value) })}
              className="w-10 h-6 text-xs text-center border border-gray-200 rounded"
            />
          </label>
          {(style.offsetX || style.offsetY) ? (
            <>
              <div className="w-px h-5 bg-gray-200 mx-0.5" />
              <button onClick={() => update({ offsetX: 0, offsetY: 0 })} className="px-1.5 h-6 text-xs rounded text-gray-500 hover:bg-gray-100" title="位置をリセット">↩ リセット</button>
            </>
          ) : null}
        </>
      )}
      {isOverlay && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button
            onClick={handleDelete}
            className="w-6 h-6 rounded flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
            title="削除"
          >
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  );

  return createPortal(toolbar, document.body);
}
