"use client";

import dynamic from "next/dynamic";
import type { Document } from "@/types";

const EditorLayout = dynamic(
  () => import("@/components/editor/EditorLayout").then((m) => m.EditorLayout),
  { ssr: false }
);

const DEMO_DOCUMENT: Document = {
  id: "demo-doc-1",
  project_id: "demo-project-1",
  title: "【デモ】AI生成LPサンプル",
  doc_type: "lp",
  product_context: {
    product_name: "AI Copy Studio",
    product_description: "AIでLPやセールスレターを10分で作成できるツール",
    target_audience: "中小企業のマーケティング担当者",
    unique_selling_points: ["AIで10分でLP完成", "ノーコードで誰でも使える", "PASONA法則に基づく高品質コピー"],
    price: "月額 ¥2,980",
    tone: "professional",
  },
  theme: {
    primaryColor: "#e94560",
    secondaryColor: "#1a1a2e",
    accentColor: "#0f3460",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    fontHeading: "sans-serif",
    fontBody: "sans-serif",
  },
  blocks: [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "block-3",
      document_id: "demo-doc-1",
      block_type: "testimonial",
      order_index: 2,
      content: {
        items: [
          { quote: "今まで外注していたLPが社内で作れるようになりました。コストが1/10になって驚いています。", author: "田中 美咲", role: "マーケティング部長", rating: 5 },
          { quote: "文章が苦手な私でも、商品の魅力が伝わるLPが作れました。AIの力ってすごい！", author: "鈴木 健太", role: "個人事業主", rating: 5 },
        ],
      },
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "block-4",
      document_id: "demo-doc-1",
      block_type: "price",
      order_index: 3,
      content: {
        headline: "シンプルな料金プラン",
        items: [
          { name: "Free", price: "¥0", period: "/月", features: ["月3回まで生成", "基本ブロック", "HTMLエクスポート"], cta_text: "無料で始める", is_featured: false },
          { name: "Pro", price: "¥2,980", period: "/月", features: ["無制限生成", "全ブロック対応", "HTMLエクスポート", "優先サポート"], cta_text: "Proを始める", is_featured: true },
        ],
      },
      is_ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "block-5",
      document_id: "demo-doc-1",
      block_type: "cta",
      order_index: 4,
      content: {
        headline: "今すぐ無料で試してみてください",
        body: "クレジットカード不要。5分で登録完了。",
        button_text: "無料アカウントを作成",
        button_color: "#e94560",
        background_color: "#f9f9f9",
      },
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "block-6",
      document_id: "demo-doc-1",
      block_type: "footer",
      order_index: 5,
      content: {
        company_name: "AI Copy Studio",
        copyright: "© 2026 AI Copy Studio. All rights reserved.",
      },
      is_ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function DemoPage() {
  return <EditorLayout document={DEMO_DOCUMENT} projectId="demo-project-1" />;
}
