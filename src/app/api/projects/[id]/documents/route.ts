import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, projects } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  doc_type: z.enum(["lp", "sales_letter", "website", "email", "other"] as const).default("lp"),
  product_context: z.record(z.string(), z.unknown()).default({}),
  theme: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.owner_id, session.user.id)));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.project_id, id))
    .orderBy(desc(documents.updated_at));

  return NextResponse.json(docs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.owner_id, session.user.id)));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = createSchema.parse(await req.json());

  const [doc] = await db
    .insert(documents)
    .values({
      project_id: id,
      title: body.title,
      doc_type: body.doc_type,
      product_context: body.product_context,
      theme: body.theme,
    })
    .returning();

  return NextResponse.json(doc, { status: 201 });
}
