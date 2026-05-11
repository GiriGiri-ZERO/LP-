"use client";

import type { ShapeContent, ShapeType } from "@/types";
import type React from "react";
import { resolveBackground } from "@/lib/styleUtils";

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

  const bg = resolveBackground(fill_color, content.fill_gradient);
  const isGradient = !!content.fill_gradient;

  const base: React.CSSProperties = {
    width,
    height,
    ...(isGradient ? { backgroundImage: bg } : { backgroundColor: bg }),
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
    case "star":
      return { ...base, clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)", borderRadius: 0 };
    case "diamond":
      return { ...base, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", borderRadius: 0 };
    case "hexagon":
      return { ...base, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", borderRadius: 0 };
    case "pentagon":
      return { ...base, clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)", borderRadius: 0 };
    case "cross":
      return { ...base, clipPath: "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)", borderRadius: 0 };
    case "heart":
      return { ...base, clipPath: "polygon(10% 25%, 10% 45%, 50% 90%, 90% 45%, 90% 25%, 70% 5%, 50% 20%, 30% 5%)", borderRadius: 0 };
    case "chevron":
      return { ...base, clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)", borderRadius: 0 };
    default:
      return { ...base, borderRadius: border_radius };
  }
}

function SpeechBubbleSvg({ content }: { content: ShapeContent }) {
  const {
    fill_color = "#e94560",
    border_color,
    border_width = 0,
    width = 200,
    height = 100,
    opacity = 1,
  } = content;
  const fill = resolveBackground(fill_color, content.fill_gradient);
  const stroke = border_color ?? "transparent";
  const sw = border_width || 0;
  const tailH = Math.round(height * 0.18);
  const bodyH = height - tailH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ opacity, display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={sw / 2} y={sw / 2}
        width={width - sw} height={bodyH - sw / 2}
        rx="10" ry="10"
        fill={fill} stroke={stroke} strokeWidth={sw}
      />
      <polygon
        points={`${width * 0.1},${bodyH} ${width * 0.28},${bodyH} ${width * 0.1},${height}`}
        fill={fill_color}
      />
    </svg>
  );
}

export function ShapeBlock({ blockId, content }: Props) {
  const es = content.elementStyles?.["shape"] ?? {};
  const offsetX = es.offsetX ?? 0;
  const offsetY = es.offsetY ?? 0;

  if (content.shape_type === "speech-bubble") {
    return (
      <div
        className="py-6 px-8 flex justify-center items-center"
        style={{ minHeight: 80 }}
      >
        <div
          data-el-block={blockId}
          data-el-id="shape"
          data-el-type="shape"
          style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
        >
          <SpeechBubbleSvg content={content} />
        </div>
      </div>
    );
  }

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
