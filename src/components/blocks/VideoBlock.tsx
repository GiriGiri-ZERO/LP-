"use client";

import type { Block, VideoContent } from "@/types";

interface Props {
  blockId: string;
  content: VideoContent;
  selected: boolean;
  isEditing: boolean;
}

export function VideoBlock({ blockId, content, selected }: Props) {
  const isEmpty = !content.src;

  return (
    <div
      data-el-block={blockId}
      data-el-id="video"
      data-el-type="image"
      className={`relative w-full overflow-hidden transition-all ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        height: content.height ? `${content.height}px` : "360px",
        opacity: content.opacity ?? 1,
        borderRadius: content.border_radius ? `${content.border_radius}px` : undefined,
      }}
    >
      {isEmpty ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
          <span className="text-4xl">🎬</span>
          <span className="text-sm">動画をドラッグしてここに配置</span>
        </div>
      ) : (
        /* eslint-disable-next-line jsx-a11y/media-has-caption */
        <video
          src={content.src}
          controls={content.controls}
          autoPlay={content.autoplay}
          loop={content.loop}
          muted={content.muted}
          poster={content.poster}
          style={{
            width: "100%",
            height: "100%",
            objectFit: content.object_fit,
          }}
        />
      )}
    </div>
  );
}
