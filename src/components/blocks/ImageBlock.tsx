"use client";

import type { ImageContent } from "@/types";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface Props {
  blockId: string;
  content: ImageContent;
  selected: boolean;
  isEditing: boolean;
}

export function ImageBlock({ blockId, content, selected }: Props) {
  const { src, alt, object_fit = "cover", height = 400, border_radius = 0, opacity = 1 } = content;

  if (!src) {
    return (
      <div
        data-el-block={blockId}
        data-el-id="image"
        data-el-type="image"
        className={cn(
          "w-full flex flex-col items-center justify-center gap-2 bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300",
          selected && "ring-2 ring-blue-500"
        )}
        style={{ height }}
      >
        <ImageIcon size={40} strokeWidth={1} />
        <span className="text-sm">左パネルの「画像」から写真を挿入</span>
      </div>
    );
  }

  return (
    <div
      data-el-block={blockId}
      data-el-id="image"
      data-el-type="image"
      className={cn("w-full overflow-hidden", selected && "ring-2 ring-blue-500")}
      style={{ height, borderRadius: border_radius }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{ objectFit: object_fit, opacity }}
      />
    </div>
  );
}
