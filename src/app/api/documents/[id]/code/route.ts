import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { type, content }: { type: "html" | "css"; content: string } = await req.json();

  if (type === "html") {
    await db
      .update(documents)
      .set({ custom_html: content, updated_at: new Date() })
      .where(eq(documents.id, id));
  }

  return NextResponse.json({ ok: true });
}
