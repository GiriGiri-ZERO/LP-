import type { ProductContext, BlockType, DocType } from "@/types";

export const SYSTEM_PROMPT = `あなたは世界トップクラスのダイレクトレスポンスコピーライターです。
日本語で高品質なLPコピー、セールスレター、Webサイトコンテンツを作成します。

## コピーライティング原則（PASONA法則を核とする）
- **P (Problem)**: ターゲットの痛みや問題を明確に認識させる
- **A (Affinity)**: 共感を示し、信頼関係を構築する
- **S (Solution)**: 解決策として商品・サービスを自然に提示する
- **O (Offer)**: 具体的なオファー、価格、特典を明示する
- **N (Narrow)**: 購買対象を絞り込み、今すぐ行動すべき理由を示す
- **A (Action)**: 明確なCTAで行動を促す

## 出力ルール
- JSON形式で指定されたブロック構造に従って出力すること
- 日本語の表現は自然で説得力があること
- 数字・実績・社会的証明を積極的に活用すること
- ターゲット層の言葉遣いに合わせること
- 過度な誇大表現は避け、信頼性を保つこと`;

export function buildGeneratePrompt(
  docType: DocType,
  context: ProductContext,
  sections: BlockType[]
): string {
  const docTypeLabel: Record<DocType, string> = {
    lp: "ランディングページ（LP）",
    sales_letter: "セールスレター",
    website: "Webサイト",
    email: "メールマガジン",
    other: "コンテンツ",
  };

  const toneLabel: Record<string, string> = {
    professional: "プロフェッショナル・信頼感",
    friendly: "フレンドリー・親しみやすい",
    luxury: "高級感・特別感",
    urgent: "緊急性・限定感",
  };

  return `以下の商品・サービス情報をもとに、${docTypeLabel[docType]}のコピーを作成してください。

## 商品情報
- 商品名: ${context.product_name}
- 商品説明: ${context.product_description}
- ターゲット顧客: ${context.target_audience}
- ユニークな強み（USP）: ${context.unique_selling_points.join("、")}
- 価格: ${context.price}
- トーン: ${toneLabel[context.tone] ?? context.tone}

## 作成するセクション
${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

各セクションを順番に、以下のJSON形式で出力してください。セクションの区切りに必ず以下の形式を使用:

<BLOCK_START type="[block_type]">
{JSON content}
<BLOCK_END>

hero ブロックの例:
<BLOCK_START type="hero">
{"headline": "...", "subheadline": "...", "cta_text": "今すぐ無料で試す"}
<BLOCK_END>`;
}

export function buildRegeneratePrompt(
  blockType: BlockType,
  currentContent: unknown,
  context: ProductContext,
  instruction?: string
): string {
  return `以下のブロックを改善してください。

## 商品情報
- 商品名: ${context.product_name}
- ターゲット: ${context.target_audience}
- トーン: ${context.tone}

## 現在のコンテンツ
${JSON.stringify(currentContent, null, 2)}

## 改善指示
${instruction ?? "より説得力のある表現に改善してください。PASONA法則を意識して。"}

ブロックタイプ「${blockType}」のJSONのみ出力してください（コードブロックなし）:`;
}
