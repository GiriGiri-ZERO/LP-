import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT, buildGeneratePrompt } from "@/lib/ai/prompts";
import type { GenerateRequest } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body: GenerateRequest = await req.json();

  const userPrompt = buildGeneratePrompt(
    body.doc_type,
    body.product_context,
    body.sections
  );

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  return result.toTextStreamResponse();
}
