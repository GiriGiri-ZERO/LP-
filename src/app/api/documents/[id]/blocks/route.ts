import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blocks as blocksTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import type { Block } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { blocks }: { blocks: Block[] } = await req.json();

  await db.delete(blocksTable).where(eq(blocksTable.document_id, id));

  if (blocks.length > 0) {
    await db.insert(blocksTable).values(
      blocks.map((b, i) => ({
        id: b.id,
        document_id: id,
        block_type: b.block_type,
        order_index: i,
        content: b.content as Record<string, unknown>,
        is_ai_generated: b.is_ai_generated,
      }))
    );
  }

  return NextResponse.json({ ok: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [block] = await db
    .insert(blocksTable)
    .values({
      document_id: id,
      block_type: body.block_type,
      order_index: body.order_index ?? 0,
      content: body.content ?? {},
      is_ai_generated: body.is_ai_generated ?? false,
    })
    .returning();

  return NextResponse.json(block, { status: 201 });
}
