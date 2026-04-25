"use client";

import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { IconBarCategory } from "./IconBar";
import type { BlockType, HeroContent, HeadlineContent, CTAContent } from "@/types";
import { Sparkles, Type, LayoutTemplate, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-gray-700 transition-colors text-left"
                >
                  {t === "headline" ? "📰 見出し" : "📝 本文"}
                </button>
              ))}
            </div>
          </div>
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

                {!["hero", "headline", "cta"].includes(selectedBlock.block_type) && (
                  <p className="text-xs text-gray-500">このブロックにはカラー設定がありません</p>
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
