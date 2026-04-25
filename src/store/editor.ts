"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  Block,
  Document,
  Theme,
  EditorTab,
  Viewport,
  BlockType,
  BlockContent,
} from "@/types";
import { generateId } from "@/lib/utils";

interface EditorState {
  document: Document | null;
  blocks: Block[];
  selectedBlockId: string | null;
  editingBlockId: string | null;
  activeTab: EditorTab;
  viewport: Viewport;
  isDirty: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  generatingBlockType: BlockType | null;

  setDocument: (doc: Document) => void;
  setBlocks: (blocks: Block[]) => void;
  selectBlock: (id: string | null) => void;
  setEditingBlock: (id: string | null) => void;
  setActiveTab: (tab: EditorTab) => void;
  setViewport: (v: Viewport) => void;

  updateBlock: (id: string, content: Partial<BlockContent>) => void;
  addBlock: (block_type: BlockType, after_index?: number) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (ids: string[]) => void;
  duplicateBlock: (id: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;

  updateTheme: (theme: Partial<Theme>) => void;
  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
  setIsGenerating: (v: boolean, blockType?: BlockType | null) => void;
  appendGeneratedBlock: (block: Block) => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    document: null,
    blocks: [],
    selectedBlockId: null,
    editingBlockId: null,
    activeTab: "preview",
    viewport: "pc",
    isDirty: false,
    isSaving: false,
    isGenerating: false,
    generatingBlockType: null,

    setDocument: (doc) =>
      set((state) => {
        state.document = doc;
        state.blocks = doc.blocks ?? [];
      }),

    setBlocks: (blocks) =>
      set((state) => {
        state.blocks = blocks;
      }),

    selectBlock: (id) =>
      set((state) => {
        state.selectedBlockId = id;
      }),

    setEditingBlock: (id) =>
      set((state) => {
        state.editingBlockId = id;
      }),

    setActiveTab: (tab) =>
      set((state) => {
        state.activeTab = tab;
      }),

    setViewport: (v) =>
      set((state) => {
        state.viewport = v;
      }),

    updateBlock: (id, content) =>
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          Object.assign(block.content, content);
          block.updated_at = new Date().toISOString();
          state.isDirty = true;
        }
      }),

    addBlock: (block_type, after_index) =>
      set((state) => {
        if (!state.document) return;
        const insertAt =
          after_index !== undefined ? after_index + 1 : state.blocks.length;
        const maxOrderIndex = Math.max(...state.blocks.map((b) => b.order_index), -1);
        const newBlock: Block = {
          id: generateId(),
          document_id: state.document.id,
          block_type,
          order_index: maxOrderIndex + 1,
          content: getDefaultContent(block_type),
          is_ai_generated: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        state.blocks.splice(insertAt, 0, newBlock);
        state.blocks.forEach((b, i) => {
          b.order_index = i;
        });
        state.isDirty = true;
      }),

    removeBlock: (id) =>
      set((state) => {
        state.blocks = state.blocks.filter((b) => b.id !== id);
        state.blocks.forEach((b, i) => {
          b.order_index = i;
        });
        if (state.selectedBlockId === id) state.selectedBlockId = null;
        state.isDirty = true;
      }),

    reorderBlocks: (ids) =>
      set((state) => {
        const blockMap = new Map(state.blocks.map((b) => [b.id, b]));
        state.blocks = ids
          .map((id) => blockMap.get(id))
          .filter(Boolean) as Block[];
        state.blocks.forEach((b, i) => {
          b.order_index = i;
        });
        state.isDirty = true;
      }),

    duplicateBlock: (id) =>
      set((state) => {
        const idx = state.blocks.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const original = state.blocks[idx];
        const copy: Block = {
          ...original,
          id: generateId(),
          order_index: idx + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Deep-copy content to avoid shared references
          content: JSON.parse(JSON.stringify(original.content)),
        };
        state.blocks.splice(idx + 1, 0, copy);
        state.blocks.forEach((b, i) => {
          b.order_index = i;
        });
        state.isDirty = true;
      }),

    moveBlockUp: (id) =>
      set((state) => {
        const idx = state.blocks.findIndex((b) => b.id === id);
        if (idx <= 0) return;
        [state.blocks[idx - 1], state.blocks[idx]] = [
          state.blocks[idx],
          state.blocks[idx - 1],
        ];
        state.blocks.forEach((b, i) => {
          b.order_index = i;
        });
        state.isDirty = true;
      }),

    moveBlockDown: (id) =>
      set((state) => {
        const idx = state.blocks.findIndex((b) => b.id === id);
        if (idx === -1 || idx >= state.blocks.length - 1) return;
        [state.blocks[idx], state.blocks[idx + 1]] = [
          state.blocks[idx + 1],
          state.blocks[idx],
        ];
        state.blocks.forEach((b, i) => {
          b.order_index = i;
        });
        state.isDirty = true;
      }),

    updateTheme: (theme) =>
      set((state) => {
        if (state.document) {
          state.document.theme = { ...state.document.theme, ...theme };
          state.isDirty = true;
        }
      }),

    setIsSaving: (v) =>
      set((state) => {
        state.isSaving = v;
        if (v === false) state.isDirty = false;
      }),

    setIsDirty: (v) =>
      set((state) => {
        state.isDirty = v;
      }),

    setIsGenerating: (v, blockType = null) =>
      set((state) => {
        state.isGenerating = v;
        state.generatingBlockType = blockType ?? null;
      }),

    appendGeneratedBlock: (block) =>
      set((state) => {
        state.blocks.push(block);
        state.isDirty = true;
      }),
  }))
);

function getDefaultContent(type: BlockType): BlockContent {
  switch (type) {
    case "hero":
      return {
        headline: "魅力的なヘッドライン",
        subheadline: "サブヘッドラインをここに",
        cta_text: "今すぐ申し込む",
        background_color: "#1a1a2e",
        text_color: "#ffffff",
        button_color: "#e94560",
      };
    case "headline":
      return { text: "見出しテキスト", level: 2, align: "center" };
    case "body":
      return {
        html: "<p>本文テキストをここに入力してください。</p>",
        align: "left",
      };
    case "cta":
      return {
        headline: "今すぐ始めましょう",
        button_text: "無料で試す",
        button_color: "#e94560",
        background_color: "#f9f9f9",
      };
    case "testimonial":
      return {
        items: [
          {
            quote: "このサービスのおかげで売上が2倍になりました！",
            author: "山田太郎",
            role: "代表取締役",
            rating: 5,
          },
        ],
      };
    case "faq":
      return {
        items: [
          { question: "よくある質問1", answer: "回答をここに入力します。" },
        ],
      };
    case "feature":
      return {
        headline: "特徴・メリット",
        items: [
          { title: "機能1", description: "詳細説明をここに。", icon: "⚡" },
          { title: "機能2", description: "詳細説明をここに。", icon: "🎯" },
          { title: "機能3", description: "詳細説明をここに。", icon: "💎" },
        ],
      };
    case "price":
      return {
        headline: "料金プラン",
        items: [
          {
            name: "スタンダード",
            price: "¥9,800",
            period: "/月",
            features: ["機能A", "機能B", "機能C"],
            cta_text: "申し込む",
            is_featured: true,
          },
        ],
      };
    case "footer":
      return {
        company_name: "株式会社〇〇",
        copyright: `© ${new Date().getFullYear()} 株式会社〇〇. All rights reserved.`,
      };
    default:
      return {};
  }
}
