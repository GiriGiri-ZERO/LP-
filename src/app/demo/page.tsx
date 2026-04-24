import { EditorClient } from "@/components/editor/EditorClient";
import type { Block, Document, Theme, ProductContext } from "@/types";

const theme: Theme = {
  primaryColor: "#e94560",
  secondaryColor: "#1a1a2e",
  accentColor: "#0f3460",
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  fontHeading: "sans-serif",
  fontBody: "sans-serif",
};

const productContext: ProductContext = {
  product_name: "AI Copy Studio",
  product_description: "AIでLPやセールスレターを10分で作成できるツール",
  target_audience: "中小企業のマーケティング担当者",
  unique_selling_points: ["AIで10分でLP完成", "ノーコードで誰でも使える", "PASONA法則に基づく高品質コピー"],
  price: "月額 ¥2,980",
  tone: "professional",
};

const blocks: Block[] = [
  {
    id: "block-1",
    document_id: "demo-doc-1",
    block_type: "hero",
    order_index: 0,
    content: {
      headline: "10分でプロ品質のLPを作成",
      subheadline: "AIがあなたの商品の魅力を最大限に引き出すコピーを自動生成。もう文章に悩む必要はありません。",
      cta_text: "今すぐ無料で試す",
      background_color: "#1a1a2e",
      text_color: "#ffffff",
    },
    is_ai_generated: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "block-2",
    document_id: "demo-doc-1",
    block_type: "feature",
    order_index: 1,
    content: {
      headline: "選ばれる3つの理由",
      items: [
        { title: "AIが瞬時に生成", description: "商品情報を入力するだけで、PASONA法則に基づいた説得力あるコピーを自動生成します。", icon: "⚡" },
        { title: "自由に編集できる", description: "生成されたコピーはCanvaのように直感的に編集。細部まで自分好みに調整できます。", icon: "🎨" },
        { title: "即座にHTMLで出力", description: "完成したLPはHTMLファイルとしてダウンロード。すぐにサイトに公開できます。", icon: "🚀" },
      ],
    },
    is_ai_generated: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "block-3",
    document_id: "demo-doc-1",
    block_type: "price",
    order_index: 2,
    content: {
      headline: "シンプルな料金プラン",
      items: [
        { name: "Free", price: "¥0", period: "/月", features: ["月3回まで生成", "基本ブロック", "HTMLエクスポート"], cta_text: "無料で始める", is_featured: false },
        { name: "Pro", price: "¥2,980", period: "/月", features: ["無制限生成", "全ブロック対応", "HTMLエクスポート", "優先サポート"], cta_text: "Proを始める", is_featured: true },
      ],
    },
    is_ai_generated: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "block-4",
    document_id: "demo-doc-1",
    block_type: "cta",
    order_index: 3,
    content: {
      headline: "今すぐ無料で試してみてください",
      body: "クレジットカード不要。5分で登録完了。",
      button_text: "無料アカウントを作成",
      button_color: "#e94560",
      background_color: "#f9f9f9",
    },
    is_ai_generated: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const demoDocument: Document = {
  id: "demo-doc-1",
  project_id: "demo-project-1",
  title: "【デモ】AI生成LPサンプル",
  doc_type: "lp",
  product_context: productContext,
  theme,
  blocks,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export default function DemoPage() {
  return <EditorClient document={demoDocument} projectId="demo-project-1" />;
}
