"use client";

import { useEditorStore } from "@/store/editor";
import { useShallow } from "zustand/react/shallow";
import type { IconBarCategory } from "./IconBar";
import type { BlockType } from "@/types";
import { Sparkles, Type, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { addBlock, updateTheme, document: doc } = useEditorStore(
    useShallow((s) => ({
      addBlock: s.addBlock,
      updateTheme: s.updateTheme,
      document: s.document,
    }))
  );

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
                    defaultValue={doc.theme.primaryColor ?? "#e94560"}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-600"
                  />
                  <Input
                    className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                    defaultValue={doc.theme.primaryColor ?? "#e94560"}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">背景カラー</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    defaultValue={doc.theme.backgroundColor ?? "#ffffff"}
                    onChange={(e) =>
                      updateTheme({ backgroundColor: e.target.value })
                    }
                    className="w-8 h-8 rounded cursor-pointer border border-gray-600"
                  />
                  <Input
                    className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
                    defaultValue={doc.theme.backgroundColor ?? "#ffffff"}
                    onChange={(e) =>
                      updateTheme({ backgroundColor: e.target.value })
                    }
                  />
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
