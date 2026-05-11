"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { Block, OverlayElement, ElementStyle, ShapeType } from "@/types";
import type React from "react";
import { resolveShadow } from "@/lib/styleUtils";

interface Props {
  block: Block;
}

export function OverlayLayer({ block }: Props) {
  if (!block.overlayElements?.length) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
      {block.overlayElements.map((el, index) => (
        <OverlayElementView key={el.id} el={el} blockId={block.id} index={index} />
      ))}
    </div>
  );
}

function OverlayElementView({ el, blockId, index }: { el: OverlayElement; blockId: string; index: number }) {
  const style = useEditorStore(
    useShallow((s) => {
      const block = s.blocks.find((b) => b.id === blockId);
      const content = block?.content as { elementStyles?: Record<string, ElementStyle> } | undefined;
      return content?.elementStyles?.[el.id] ?? {};
    })
  );

  const editingElement = useEditorStore((s) => s.editingElement);
  const setEditingElement = useEditorStore((s) => s.setEditingElement);
  const updateOverlayElementText = useEditorStore((s) => s.updateOverlayElementText);

  const isEditing = editingElement?.blockId === blockId && editingElement?.elementId === el.id;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      if (ref.current) ref.current.textContent = el.text ?? "テキスト";
      ref.current?.blur();
      e.preventDefault();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ref.current?.blur();
    }
  }, [el.text]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    updateOverlayElementText(blockId, el.id, e.currentTarget.textContent ?? "");
    setEditingElement(null);
  }, [blockId, el.id, updateOverlayElementText, setEditingElement]);

  const offsetX = style.offsetX ?? 0;
  const offsetY = style.offsetY ?? 0;

  if (el.type === "text") {
    return (
      <div
        ref={ref}
        data-el-block={blockId}
        data-el-id={el.id}
        data-el-type="text"
        className={`absolute top-0 left-0 pointer-events-auto whitespace-pre-wrap min-w-[2rem] outline-none ${
          isEditing
            ? "cursor-text select-text ring-2 ring-blue-400 rounded"
            : "select-none cursor-move"
        }`}
        contentEditable={isEditing}
        suppressContentEditableWarning
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          color: style.color ?? "#1a1a1a",
          fontSize: style.fontSize ?? 16,
          fontWeight: style.fontWeight ?? "normal",
          fontStyle: style.fontStyle ?? "normal",
          textDecoration: style.textDecoration ?? "none",
          textAlign: (style.textAlign ?? "left") as React.CSSProperties["textAlign"],
          textShadow: resolveShadow(style.textShadow),
          zIndex: el.zIndex ?? index,
        }}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onBlur={isEditing ? handleBlur : undefined}
      >
        {el.text ?? "テキスト"}
      </div>
    );
  }

  if (el.type === "shape") {
    const fillColor = style.backgroundColor ?? "#e94560";
    const borderRadius = style.borderRadius ?? 8;

    let shapeStyle: React.CSSProperties = {
      width: style.width ?? 120,
      height: style.height ?? 80,
      backgroundColor: fillColor,
    };

    const clipShapes: Partial<Record<ShapeType, string>> = {
      triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
      arrow: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)",
      star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
      cross: "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)",
      heart: "polygon(10% 25%, 10% 45%, 50% 90%, 90% 45%, 90% 25%, 70% 5%, 50% 20%, 30% 5%)",
      chevron: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)",
    };

    const clipPath = el.shapeType ? clipShapes[el.shapeType] : undefined;

    if (el.shapeType === "circle") {
      shapeStyle = { ...shapeStyle, borderRadius: "50%" };
    } else if (el.shapeType === "divider") {
      shapeStyle = { ...shapeStyle, height: style.height ?? 4, width: style.width ?? 200, borderRadius: 2 };
    } else if (el.shapeType === "speech-bubble") {
      const w = style.width ?? 120;
      const h = style.height ?? 80;
      const tailH = Math.round(h * 0.18);
      const bodyH = h - tailH;
      const fill = style.backgroundColor ?? "#e94560";
      return (
        <div
          data-el-block={blockId}
          data-el-id={el.id}
          data-el-type="shape"
          className="absolute top-0 left-0 pointer-events-auto cursor-move"
          style={{ transform: `translate(${offsetX}px, ${offsetY}px)`, zIndex: el.zIndex ?? index }}
        >
          <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block" }} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width={w} height={bodyH} rx="10" ry="10" fill={fill} />
            <polygon points={`${w * 0.1},${bodyH} ${w * 0.28},${bodyH} ${w * 0.1},${h}`} fill={fill} />
          </svg>
        </div>
      );
    } else if (clipPath) {
      shapeStyle = { ...shapeStyle, clipPath, borderRadius: 0 };
    } else {
      shapeStyle = { ...shapeStyle, borderRadius };
    }

    return (
      <div
        data-el-block={blockId}
        data-el-id={el.id}
        data-el-type="shape"
        className="absolute top-0 left-0 pointer-events-auto cursor-move"
        style={{ ...shapeStyle, transform: `translate(${offsetX}px, ${offsetY}px)`, zIndex: el.zIndex ?? index }}
      />
    );
  }

  return null;
}
