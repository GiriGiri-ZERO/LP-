"use client";

import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { IconBarCategory } from "./IconBar";
import type { BlockType, BlockContent, HeroContent, HeadlineContent, CTAContent, ImageContent, VideoContent, ShapeContent } from "@/types";
import { Sparkles, Type, LayoutTemplate, AlignLeft, AlignCenter, AlignRight, ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React, { useRef, useState, useCallback, useEffect } from "react";

interface Props {
  category: IconBarCategory | null;
}

const BLOCK_TYPES: { type: BlockType; label: string; emoji: string }[] = [
  { type: "hero", label: "ヒーロー", emoji: "🦸" },
  { type: "headline", label: "見出し", emoji: "📰" },
  { type: "body", label: "本文", emoji: "📝" },
  { type: "feature", label: "特徴", emoji: "⭐" },
  { type: "testimonial", label: "口コミ", emoji: "💬" },
  { type: "faq", label: "FAQ", emoji: "❓" },
  { type: "price", label: "料金", emoji: "💰" },
  { type: "cta", label: "CTA", emoji: "🎯" },
  { type: "footer", label: "フッター", emoji: "📎" },
];

export function SubPanel({ category }: Props) {
  const { addBlock, updateTheme, updateBlock, document: doc, blocks, selectedBlockId } = useEditorStore(
    useShallow((s) => ({
      addBlock: s.addBlock,
      updateTheme: s.updateTheme,
      updateBlock: s.updateBlock,
      document: s.document,
      blocks: s.blocks,
      selectedBlockId: s.selectedBlockId,
    }))
  );

  const selectedBlock = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null;

  if (!category) return null;

  return (
    <aside className="w-56 bg-gray-800 border-r border-gray-700 overflow-y-auto shrink-0">
      <div className="p-3">
        {category === "blocks" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                ブロック追加
              </span>
            </div>
            <div className="space-y-1">
              {BLOCK_TYPES.map((b) => (
                <button
                  key={b.type}
                  onClick={() => addBlock(b.type)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/block-type", b.type);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-gray-700 transition-colors text-left cursor-grab active:cursor-grabbing"
                >
                  <span className="text-lg">{b.emoji}</span>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {category === "text" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                テキスト挿入
              </span>
            </div>
            <div className="space-y-1">
              {(["headline", "body"] as BlockType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => addBlock(t)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/block-type", t);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-gray-700 transition-colors text-left cursor-grab active:cursor-grabbing"
                >
                  {t === "headline" ? "📰 見出し" : "📝 本文"}
                </button>
              ))}
            </div>
          </div>
        )}

        {category === "shape" && (
          <ShapePalette addBlock={addBlock} />
        )}

        {category === "style" && doc && (
          <div className="space-y-4">
            {/* Block-specific controls */}
            {selectedBlock ? (
              <div key={selectedBlockId ?? "none"}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    選択中のブロック
                  </span>
                </div>

                {selectedBlock.block_type === "hero" && (() => {
                  const c = selectedBlock.content as HeroContent;
                  return (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">背景色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.background_color ?? "#1a1a2e"}
                            onChange={(e) => updateBlock(selectedBlock.id, { background_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.background_color ?? "#1a1a2e"}
                            onChange={(e) => updateBlock(selectedBlock.id, { background_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">文字色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.text_color ?? "#ffffff"}
                            onChange={(e) => updateBlock(selectedBlock.id, { text_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.text_color ?? "#ffffff"}
                            onChange={(e) => updateBlock(selectedBlock.id, { text_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">ボタン色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.button_color ?? "#e94560"}
                            onChange={(e) => updateBlock(selectedBlock.id, { button_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.button_color ?? "#e94560"}
                            onChange={(e) => updateBlock(selectedBlock.id, { button_color: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {selectedBlock.block_type === "headline" && (() => {
                  const c = selectedBlock.content as HeadlineContent;
                  return (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">文字色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.color ?? "#1a1a1a"}
                            onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.color ?? "#1a1a1a"}
                            onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">配置</Label>
                        <div className="flex gap-1">
                          {(["left", "center", "right"] as const).map((align) => (
                            <button key={align}
                              onClick={() => updateBlock(selectedBlock.id, { align })}
                              className={cn(
                                "flex-1 h-8 flex items-center justify-center rounded border transition-colors",
                                c.align === align || (!c.align && align === "left")
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "border-gray-600 text-gray-400 hover:text-white"
                              )}>
                              {align === "left" && <AlignLeft size={14} />}
                              {align === "center" && <AlignCenter size={14} />}
                              {align === "right" && <AlignRight size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {selectedBlock.block_type === "cta" && (() => {
                  const c = selectedBlock.content as CTAContent;
                  return (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">背景色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.background_color ?? "#f9f9f9"}
                            onChange={(e) => updateBlock(selectedBlock.id, { background_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.background_color ?? "#f9f9f9"}
                            onChange={(e) => updateBlock(selectedBlock.id, { background_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">ボタン色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.button_color ?? "#e94560"}
                            onChange={(e) => updateBlock(selectedBlock.id, { button_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.button_color ?? "#e94560"}
                            onChange={(e) => updateBlock(selectedBlock.id, { button_color: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {selectedBlock.block_type === "image" && (() => {
                  const c = selectedBlock.content as ImageContent;
                  return (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">高さ (px)</Label>
                        <Input
                          type="number"
                          min={100}
                          max={1200}
                          className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                          value={c.height ?? 400}
                          onChange={(e) => updateBlock(selectedBlock.id, { height: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">フィット</Label>
                        <select
                          className="w-full h-8 text-xs bg-gray-700 border border-gray-600 text-white rounded px-2"
                          value={c.object_fit ?? "cover"}
                          onChange={(e) => updateBlock(selectedBlock.id, { object_fit: e.target.value as ImageContent["object_fit"] })}
                        >
                          <option value="cover">カバー</option>
                          <option value="contain">収める</option>
                          <option value="fill">引き伸ばす</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">透明度 {Math.round((c.opacity ?? 1) * 100)}%</Label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          className="w-full accent-blue-500"
                          value={c.opacity ?? 1}
                          onChange={(e) => updateBlock(selectedBlock.id, { opacity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">角丸 {c.border_radius ?? 0}px</Label>
                        <input
                          type="range"
                          min={0}
                          max={48}
                          step={2}
                          className="w-full accent-blue-500"
                          value={c.border_radius ?? 0}
                          onChange={(e) => updateBlock(selectedBlock.id, { border_radius: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  );
                })()}

                {selectedBlock.block_type === "video" && (() => {
                  const c = selectedBlock.content as VideoContent;
                  return (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">高さ (px)</Label>
                        <Input
                          type="number"
                          min={100}
                          max={1200}
                          className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                          value={c.height ?? 360}
                          onChange={(e) => updateBlock(selectedBlock.id, { height: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">フィット</Label>
                        <select
                          className="w-full h-8 text-xs bg-gray-700 border border-gray-600 text-white rounded px-2"
                          value={c.object_fit ?? "contain"}
                          onChange={(e) => updateBlock(selectedBlock.id, { object_fit: e.target.value as VideoContent["object_fit"] })}
                        >
                          <option value="cover">カバー</option>
                          <option value="contain">収める</option>
                          <option value="fill">引き伸ばす</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">透明度 {Math.round((c.opacity ?? 1) * 100)}%</Label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          className="w-full accent-blue-500"
                          value={c.opacity ?? 1}
                          onChange={(e) => updateBlock(selectedBlock.id, { opacity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">角丸 {c.border_radius ?? 0}px</Label>
                        <input
                          type="range"
                          min={0}
                          max={48}
                          step={2}
                          className="w-full accent-blue-500"
                          value={c.border_radius ?? 0}
                          onChange={(e) => updateBlock(selectedBlock.id, { border_radius: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  );
                })()}

                {selectedBlock.block_type === "shape" && (() => {
                  const c = selectedBlock.content as ShapeContent;
                  return (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">塗り色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.fill_color ?? "#e94560"}
                            onChange={(e) => updateBlock(selectedBlock.id, { fill_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.fill_color ?? "#e94560"}
                            onChange={(e) => updateBlock(selectedBlock.id, { fill_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">枠線色</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={c.border_color ?? "#cc3045"}
                            onChange={(e) => updateBlock(selectedBlock.id, { border_color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
                          <Input className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                            value={c.border_color ?? "#cc3045"}
                            onChange={(e) => updateBlock(selectedBlock.id, { border_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">枠線幅 {c.border_width ?? 0}px</Label>
                        <input
                          type="range"
                          min={0}
                          max={16}
                          step={1}
                          className="w-full accent-blue-500"
                          value={c.border_width ?? 0}
                          onChange={(e) => updateBlock(selectedBlock.id, { border_width: Number(e.target.value) })}
                        />
                      </div>
                      {(c.shape_type === "rect" || !c.shape_type) && (
                        <div>
                          <Label className="text-xs text-gray-400 mb-1 block">角丸 {c.border_radius ?? 8}px</Label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={2}
                            className="w-full accent-blue-500"
                            value={c.border_radius ?? 8}
                            onChange={(e) => updateBlock(selectedBlock.id, { border_radius: Number(e.target.value) })}
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">幅 (px)</Label>
                        <Input
                          type="number"
                          min={20}
                          max={1200}
                          className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                          value={c.width ?? 200}
                          onChange={(e) => updateBlock(selectedBlock.id, { width: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">高さ (px)</Label>
                        <Input
                          type="number"
                          min={2}
                          max={800}
                          className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                          value={c.height ?? 100}
                          onChange={(e) => updateBlock(selectedBlock.id, { height: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">透明度 {Math.round((c.opacity ?? 1) * 100)}%</Label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          className="w-full accent-blue-500"
                          value={c.opacity ?? 1}
                          onChange={(e) => updateBlock(selectedBlock.id, { opacity: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  );
                })()}

                {!["hero", "headline", "cta", "image", "video", "shape"].includes(selectedBlock.block_type) && (
                  <p className="text-xs text-gray-500">このブロックにはスタイル設定がありません</p>
                )}

                <div className="border-t border-gray-700 mt-4 pt-1" />
              </div>
            ) : null}

            {/* Global theme colors */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  テーマカラー
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">メインカラー</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={doc.theme.primaryColor ?? "#e94560"}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-gray-600"
                    />
                    <Input
                      className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                      value={doc.theme.primaryColor ?? "#e94560"}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">背景カラー</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={doc.theme.backgroundColor ?? "#ffffff"}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-gray-600"
                    />
                    <Input
                      className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                      value={doc.theme.backgroundColor ?? "#ffffff"}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {category === "image" && (
          <MediaPanel addBlock={addBlock} />
        )}

        {category === "ai" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                AI機能
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                ブロックを選択してAIで再生成・改善できます
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-gray-600 text-gray-200"
              >
                ✨ 全体を改善
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

const SHAPE_ITEMS: { type: ShapeContent["shape_type"]; label: string; preview: React.ReactNode }[] = [
  {
    type: "rect",
    label: "四角形",
    preview: <div style={{ width: 36, height: 24, backgroundColor: "#e94560", borderRadius: 4 }} />,
  },
  {
    type: "circle",
    label: "円形",
    preview: <div style={{ width: 28, height: 28, backgroundColor: "#e94560", borderRadius: "50%" }} />,
  },
  {
    type: "triangle",
    label: "三角形",
    preview: (
      <div style={{ width: 36, height: 30, backgroundColor: "#e94560", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
    ),
  },
  {
    type: "arrow",
    label: "矢印",
    preview: (
      <div style={{ width: 40, height: 24, backgroundColor: "#e94560", clipPath: "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)" }} />
    ),
  },
  {
    type: "divider",
    label: "区切り線",
    preview: <div style={{ width: 44, height: 4, backgroundColor: "#e94560", borderRadius: 2 }} />,
  },
];

function ShapePalette({ addBlock }: { addBlock: AddBlockFn }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">図形</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SHAPE_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => addBlock("shape", undefined, { shape_type: item.type } as Partial<ShapeContent>)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/block-type", "shape");
              e.dataTransfer.setData("text/shape-type", item.type);
              e.dataTransfer.effectAllowed = "copy";
            }}
            className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-lg border border-gray-600 hover:border-blue-400 hover:bg-gray-700 transition-colors cursor-grab active:cursor-grabbing"
            title={item.label}
          >
            {item.preview}
            <span className="text-xs text-gray-400">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

type AddBlockFn = (block_type: BlockType, after_index?: number, contentOverride?: Partial<BlockContent>) => void;

function MediaPanel({ addBlock }: { addBlock: AddBlockFn }) {
  const [tab, setTab] = useState<"image" | "video">("image");
  return (
    <div>
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setTab("image")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors",
            tab === "image" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
          )}
        >
          <ImageIcon size={12} /> 画像
        </button>
        <button
          onClick={() => setTab("video")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors",
            tab === "video" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
          )}
        >
          <Film size={12} /> 動画
        </button>
      </div>
      {tab === "image" ? <ImagePanel addBlock={addBlock} /> : <VideoPanel addBlock={addBlock} />}
    </div>
  );
}

function ImagePanel({ addBlock }: { addBlock: AddBlockFn }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ src: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_SIZE) {
        setError("10MB 以下の画像を選択してください");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setPreviews((prev) => [...prev, { src, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          画像
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs border-gray-600 text-gray-200 mb-3"
        onClick={() => inputRef.current?.click()}
      >
        + 画像を選択
      </Button>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {previews.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 mb-1">クリックで挿入</p>
          <div className="grid grid-cols-2 gap-1">
            {previews.map((p, i) => (
              <button
                key={i}
                onClick={() => addBlock("image", undefined, { src: p.src, alt: p.name })}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/image-src", p.src);
                  e.dataTransfer.setData("text/block-type", "image");
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="aspect-square rounded overflow-hidden border border-gray-600 hover:border-blue-400 transition-colors cursor-grab active:cursor-grabbing"
                title={p.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {previews.length === 0 && (
        <p className="text-xs text-gray-500">
          JPG・PNG・WebP・GIF（10MB以下）
        </p>
      )}
    </div>
  );
}

function VideoPanel({ addBlock }: { addBlock: AddBlockFn }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<{ src: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const blobUrlsRef = useRef<string[]>([]);

  // Revoke all blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => { blobUrlsRef.current.forEach(URL.revokeObjectURL); };
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) return;
      if (file.size > MAX_VIDEO_SIZE) {
        setError("100MB 以下の動画を選択してください");
        return;
      }
      const src = URL.createObjectURL(file);
      blobUrlsRef.current.push(src);
      setVideos((prev) => [...prev, { src, name: file.name }]);
    });
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs border-gray-600 text-gray-200 mb-3"
        onClick={() => inputRef.current?.click()}
      >
        + 動画を選択
      </Button>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {videos.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 mb-1">クリックで挿入 / ドラッグで配置</p>
          {videos.map((v, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/video-src", v.src);
                e.dataTransfer.setData("text/block-type", "video");
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => addBlock("video", undefined, { src: v.src, alt: v.name } as Partial<VideoContent>)}
              className="flex items-center gap-2 p-2 rounded border border-gray-600 hover:border-blue-400 transition-colors cursor-grab active:cursor-grabbing"
              title={v.name}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && addBlock("video", undefined, { src: v.src, alt: v.name } as Partial<VideoContent>)}
            >
              <Film size={16} className="text-gray-400 shrink-0" />
              <span className="text-xs text-gray-300 truncate flex-1">{v.name}</span>
            </div>
          ))}
        </div>
      )}

      {videos.length === 0 && (
        <p className="text-xs text-gray-500">
          MP4・WebM・MOV（100MB以下）
        </p>
      )}
    </div>
  );
}
