import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, blocks as blocksTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { generateHTML } from "@/lib/html/generate";
import type { Block, Theme } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blockRows = await db
    .select()
    .from(blocksTable)
    .where(eq(blocksTable.document_id, id))
    .orderBy(asc(blocksTable.order_index));

  const mappedBlocks: Block[] = blockRows.map((b) => ({
    ...b,
    content: b.content as Block["content"],
    created_at: b.created_at.toISOString(),
    updated_at: b.updated_at.toISOString(),
  }));
  const html = generateHTML(mappedBlocks, doc.theme as Partial<Theme>);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.title)}.html"`,
    },
  });
}
