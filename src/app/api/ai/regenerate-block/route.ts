import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildRegeneratePrompt } from "@/lib/ai/prompts";
import type { BlockType, ProductContext } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const {
    block_type,
    current_content,
    product_context,
    instruction,
  }: {
    block_type: BlockType;
    current_content: unknown;
    product_context: ProductContext;
    instruction?: string;
  } = await req.json();

  const userPrompt = buildRegeneratePrompt(
    block_type,
    current_content,
    product_context,
    instruction
  );

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  try {
    const content = JSON.parse(text.trim());
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 422 }
    );
  }
}
