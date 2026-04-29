"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { ElementStyle } from "@/types";

interface Rect { top: number; left: number; width: number; height: number; }

const HANDLES = [
  { id: "tl", row: 0,   col: 0,   cursor: "nwse-resize" },
  { id: "tc", row: 0,   col: 0.5, cursor: "ns-resize"   },
  { id: "tr", row: 0,   col: 1,   cursor: "nesw-resize" },
  { id: "ml", row: 0.5, col: 0,   cursor: "ew-resize"   },
  { id: "mr", row: 0.5, col: 1,   cursor: "ew-resize"   },
  { id: "bl", row: 1,   col: 0,   cursor: "nesw-resize" },
  { id: "bc", row: 1,   col: 0.5, cursor: "ns-resize"   },
  { id: "br", row: 1,   col: 1,   cursor: "nwse-resize" },
];

export function ResizeHandleOverlay() {
  const { selectedElement, editingBlockId, updateElementStyle, updateBlock } = useEditorStore(
    useShallow((s) => ({
      selectedElement: s.selectedElement,
      editingBlockId: s.editingBlockId,
      updateElementStyle: s.updateElementStyle,
      updateBlock: s.updateBlock,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  const measureEl = useCallback(() => {
    if (!selectedElement) { setRect(null); return; }
    const el = document.querySelector<HTMLElement>(
      `[data-el-block="${selectedElement.blockId}"][data-el-id="${selectedElement.elementId}"]`
    );
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [selectedElement]);

  useEffect(() => {
    measureEl();
    window.addEventListener("scroll", measureEl, true);
    window.addEventListener("resize", measureEl);
    return () => {
      window.removeEventListener("scroll", measureEl, true);
      window.removeEventListener("resize", measureEl);
      cancelAnimationFrame(rafRef.current);
    };
  }, [measureEl]);

  const handleMouseDown = useCallback((e: React.MouseEvent, handleId: string) => {
    if (!selectedElement) return;
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startX = e.clientX;
    const { blockId, elementId, elementType } = selectedElement;

    // Snapshot initial values at drag start from the store
    const state = useEditorStore.getState();
    const block = state.blocks.find(b => b.id === blockId);
    const content = block?.content as Record<string, unknown> | undefined;
    const elStyles = content?.elementStyles as Record<string, ElementStyle> | undefined;

    let initFontSize: number;
    if (elStyles?.[elementId]?.fontSize) {
      initFontSize = elStyles[elementId].fontSize!;
    } else {
      const domEl = document.querySelector<HTMLElement>(
        `[data-el-block="${blockId}"][data-el-id="${elementId}"]`
      );
      initFontSize = domEl ? parseFloat(window.getComputedStyle(domEl).fontSize) || 16 : 16;
    }

    const initHeight: number = (content?.height as number | undefined) ?? 400;
    const isTopHandle = handleId[0] === "t";
    const isSideHandle = handleId[0] === "m";

    function onMouseMove(me: MouseEvent) {
      const dy = me.clientY - startY;
      const dx = me.clientX - startX;

      if (elementType === "text") {
        // Side handles use dx; top/bottom handles use dy
        const delta = isSideHandle ? dx : (isTopHandle ? -dy : dy);
        const newSize = Math.max(8, Math.min(200, initFontSize + delta * 0.5));
        updateElementStyle(blockId, elementId, { fontSize: Math.round(newSize) });
      } else if (elementType === "image" && !isSideHandle) {
        const delta = isTopHandle ? -dy : dy;
        const newH = Math.max(50, Math.min(1200, initHeight + delta));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateBlock(blockId, { height: Math.round(newH) } as any);
      }

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureEl);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
    }

    document.body.style.cursor = isSideHandle ? "ew-resize" : "ns-resize";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [selectedElement, updateElementStyle, updateBlock, measureEl]);

  if (!mounted || !selectedElement || editingBlockId || !rect) return null;

  return createPortal(
    <>
      <div
        className="pointer-events-none fixed z-[9998] border-2 border-blue-500"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />
      {HANDLES.map((h) => (
        <div
          key={h.id}
          className="fixed z-[9999] w-3 h-3 rounded-full bg-white border-2 border-blue-500 hover:bg-blue-50 active:scale-110 transition-transform"
          style={{
            top: rect.top + rect.height * h.row,
            left: rect.left + rect.width * h.col,
            transform: "translate(-50%, -50%)",
            cursor: h.cursor,
          }}
          onMouseDown={(e) => handleMouseDown(e, h.id)}
        />
      ))}
    </>,
    document.body
  );
}
