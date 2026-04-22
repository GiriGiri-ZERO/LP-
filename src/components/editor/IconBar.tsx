"use client";

import { Type, Palette, Square, Image, LayoutTemplate, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconBarCategory =
  | "text"
  | "style"
  | "shape"
  | "image"
  | "blocks"
  | "ai";

interface Props {
  active: IconBarCategory | null;
  onChange: (cat: IconBarCategory | null) => void;
}

const ITEMS: { id: IconBarCategory; icon: React.ReactNode; label: string }[] = [
  { id: "text", icon: <Type size={20} />, label: "テキスト" },
  { id: "style", icon: <Palette size={20} />, label: "スタイル" },
  { id: "shape", icon: <Square size={20} />, label: "図形" },
  { id: "image", icon: <Image size={20} />, label: "画像" },
  { id: "blocks", icon: <LayoutTemplate size={20} />, label: "ブロック" },
  { id: "ai", icon: <Sparkles size={20} />, label: "AI" },
];

export function IconBar({ active, onChange }: Props) {
  return (
    <aside className="w-14 bg-gray-900 flex flex-col items-center py-3 gap-1 border-r border-gray-700 shrink-0">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(active === item.id ? null : item.id)}
          title={item.label}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-400",
            active === item.id
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 hover:text-white"
          )}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
