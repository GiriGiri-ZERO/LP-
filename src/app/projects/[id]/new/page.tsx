"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlockType, DocType, Tone } from "@/types";
import { ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

const SECTIONS: { id: BlockType; label: string; defaultOn: boolean }[] = [
  { id: "hero", label: "ヒーロー（キャッチコピー）", defaultOn: true },
  { id: "feature", label: "特徴・メリット", defaultOn: true },
  { id: "testimonial", label: "お客様の声", defaultOn: true },
  { id: "faq", label: "よくあるご質問", defaultOn: true },
  { id: "price", label: "料金プラン", defaultOn: false },
  { id: "cta", label: "CTA（行動喚起）", defaultOn: true },
  { id: "footer", label: "フッター", defaultOn: true },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [docType, setDocType] = useState<DocType>("lp");
  const [title, setTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [usps, setUsps] = useState("");
  const [price, setPrice] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [sections, setSections] = useState<Set<BlockType>>(
    new Set(SECTIONS.filter((s) => s.defaultOn).map((s) => s.id))
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "generating">("form");
  const [generationStatus, setGenerationStatus] = useState("");

  function toggleSection(id: BlockType) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    if (!title || !productName) return;
    setLoading(true);
    setStep("generating");

    try {
      const docRes = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          doc_type: docType,
          product_context: {
            product_name: productName,
            product_description: productDesc,
            target_audience: targetAudience,
            unique_selling_points: usps.split("\n").filter(Boolean),
            price,
            tone,
          },
          theme: {
            primaryColor: "#e94560",
            secondaryColor: "#1a1a2e",
            accentColor: "#0f3460",
            backgroundColor: "#ffffff",
            textColor: "#1a1a1a",
            fontHeading: "Noto Sans JP, sans-serif",
            fontBody: "Noto Sans JP, sans-serif",
          },
        }),
      });
      if (!docRes.ok) throw new Error("Failed to create document");
      const doc = await docRes.json();

      setGenerationStatus("AIがコピーを生成中...");

      const genRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_type: docType,
          product_context: {
            product_name: productName,
            product_description: productDesc,
            target_audience: targetAudience,
            unique_selling_points: usps.split("\n").filter(Boolean),
            price,
            tone,
          },
          sections: Array.from(sections),
        }),
      });

      if (!genRes.ok) throw new Error("AI generation failed");

      const reader = genRes.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const collectedBlocks: Array<{ type: BlockType; content: unknown }> = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blockStartRegex = /<BLOCK_START type="(\w+)">([\s\S]*?)<BLOCK_END>/g;
          let match;
          while ((match = blockStartRegex.exec(buffer)) !== null) {
            const blockType = match[1] as BlockType;
            const rawContent = match[2].trim();
            setGenerationStatus(`${blockType} ブロックを生成中...`);
            try {
              const content = JSON.parse(rawContent);
              collectedBlocks.push({ type: blockType, content });
            } catch {
              // skip invalid JSON
            }
          }
        }
      }

      if (collectedBlocks.length > 0) {
        setGenerationStatus("ブロックを保存中...");
        const saveBlocks = collectedBlocks.map((b, i) => ({
          id: crypto.randomUUID(),
          document_id: doc.id,
          block_type: b.type,
          order_index: i,
          content: b.content,
          is_ai_generated: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        await fetch(`/api/documents/${doc.id}/blocks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks: saveBlocks }),
        });
      }

      router.push(`/editor/${doc.id}`);
    } catch (err) {
      console.error(err);
      setStep("form");
      setLoading(false);
    }
  }

  if (step === "generating") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">生成中...</h2>
          <p className="text-gray-500">{generationStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">
            新しいコピーをAIで生成
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ドキュメント種別</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as DocType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lp">LP（ランディングページ）</SelectItem>
                  <SelectItem value="sales_letter">セールスレター</SelectItem>
                  <SelectItem value="website">Webサイト</SelectItem>
                  <SelectItem value="email">メールマガジン</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>トーン</Label>
              <Select
                value={tone}
                onValueChange={(v) => setTone(v as Tone)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">プロフェッショナル</SelectItem>
                  <SelectItem value="friendly">フレンドリー</SelectItem>
                  <SelectItem value="luxury">高級感</SelectItem>
                  <SelectItem value="urgent">緊急性・限定感</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ドキュメントタイトル *</Label>
            <Input
              placeholder="例: 〇〇サービス LP ver.1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>商品・サービス名 *</Label>
            <Input
              placeholder="例: AI Copy Studio"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>商品・サービス説明</Label>
            <Textarea
              placeholder="商品やサービスの詳細説明（500字以内推奨）"
              rows={4}
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>ターゲット顧客</Label>
            <Input
              placeholder="例: 中小企業のマーケティング担当者、30代〜40代"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>ユニークな強み（USP）</Label>
            <Textarea
              placeholder="1行に1つずつ入力&#10;例: AIで10分でLP完成&#10;例: ノーコードで誰でも使える"
              rows={4}
              value={usps}
              onChange={(e) => setUsps(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>価格</Label>
            <Input
              placeholder="例: 月額 ¥2,980"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>生成するセクション</Label>
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={sections.has(s.id)}
                    onChange={() => toggleSection(s.id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 text-base gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleGenerate}
            disabled={loading || !title || !productName}
          >
            <Sparkles size={18} />
            AIでコピーを生成する
          </Button>
        </div>
      </main>
    </div>
  );
}
