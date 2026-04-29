"use client";

import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { Block, OverlayElement, ElementStyle } from "@/types";
import type React from "react";

interface Props {
  block: Block;
}

export function OverlayLayer({ block }: Props) {
  if (!block.overlayElements?.length) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
      {block.overlayElements.map((el) => (
        <OverlayElementView key={el.id} el={el} blockId={block.id} />
      ))}
    </div>
  );
}

function OverlayElementView({ el, blockId }: { el: OverlayElement; blockId: string }) {
  const style = useEditorStore(
    useShallow((s) => {
      const block = s.blocks.find((b) => b.id === blockId);
      const content = block?.content as { elementStyles?: Record<string, ElementStyle> } | undefined;
      return content?.elementStyles?.[el.id] ?? {};
    })
  );

  const offsetX = style.offsetX ?? 0;
  const offsetY = style.offsetY ?? 0;

  if (el.type === "text") {
    return (
      <div
        data-el-block={blockId}
        data-el-id={el.id}
        data-el-type="text"
        className="absolute top-0 left-0 pointer-events-auto select-none cursor-move whitespace-pre-wrap min-w-[2rem]"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          color: style.color ?? "#1a1a1a",
          fontSize: style.fontSize ?? 16,
          fontWeight: style.fontWeight ?? "normal",
          fontStyle: style.fontStyle ?? "normal",
          textAlign: style.textAlign ?? "left",
        }}
      >
        {el.text ?? "テキスト"}
      </div>
    );
  }

  if (el.type === "shape") {
    const fillColor = style.backgroundColor ?? "#e94560";
    const borderRadius = style.borderRadius ?? 8;

    let shapeStyle: React.CSSProperties = {
      width: 120,
      height: 80,
      backgroundColor: fillColor,
    };

    switch (el.shapeType) {
      case "circle":
        shapeStyle = { ...shapeStyle, borderRadius: "50%" };
        break;
      case "triangle":
        shapeStyle = { ...shapeStyle, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", borderRadius: 0 };
        break;
      case "arrow":
        shapeStyle = { ...shapeStyle, clipPath: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)", borderRadius: 0 };
        break;
      case "divider":
        shapeStyle = { ...shapeStyle, height: 4, width: 200, borderRadius: 2 };
        break;
      default:
        shapeStyle = { ...shapeStyle, borderRadius };
    }

    return (
      <div
        data-el-block={blockId}
        data-el-id={el.id}
        data-el-type="shape"
        className="absolute top-0 left-0 pointer-events-auto cursor-move"
        style={{ ...shapeStyle, transform: `translate(${offsetX}px, ${offsetY}px)` }}
      />
    );
  }

  return null;
}
