"use client";

import type { ShapeContent } from "@/types";
import type React from "react";

interface Props {
  blockId: string;
  content: ShapeContent;
  selected: boolean;
  isEditing: boolean;
}

function getShapeStyle(content: ShapeContent): React.CSSProperties {
  const {
    shape_type = "rect",
    fill_color = "#e94560",
    border_color,
    border_width = 0,
    border_radius = 8,
    width = 200,
    height = 100,
    opacity = 1,
  } = content;

  const base: React.CSSProperties = {
    width,
    height,
    backgroundColor: fill_color,
    borderColor: border_color ?? "transparent",
    borderWidth: border_width || 0,
    borderStyle: border_width ? "solid" : "none",
    opacity,
  };

  switch (shape_type) {
    case "circle":
      return { ...base, borderRadius: "50%" };
    case "triangle":
      return { ...base, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", borderRadius: 0 };
    case "arrow":
      return { ...base, clipPath: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)", borderRadius: 0 };
    case "divider":
      return { ...base, width: "100%", height: height ?? 4, borderRadius: border_radius };
    default:
      return { ...base, borderRadius: border_radius };
  }
}

export function ShapeBlock({ blockId, content }: Props) {
  const es = content.elementStyles?.["shape"] ?? {};
  const offsetX = es.offsetX ?? 0;
  const offsetY = es.offsetY ?? 0;

  const shapeStyle = getShapeStyle(content);

  return (
    <div
      className="py-6 px-8 flex justify-center items-center"
      style={{ minHeight: 80 }}
    >
      <div
        data-el-block={blockId}
        data-el-id="shape"
        data-el-type="shape"
        style={{ ...shapeStyle, transform: `translate(${offsetX}px, ${offsetY}px)` }}
      />
    </div>
  );
}
