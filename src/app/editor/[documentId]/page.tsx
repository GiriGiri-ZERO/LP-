import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, blocks as blocksTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditorLayout } from "@/components/editor/EditorLayout";
import type { Block, Document, Theme, ProductContext } from "@/types";

interface Props {
  params: Promise<{ documentId: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { documentId } = await params;
  await auth();

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));

  if (!doc) notFound();

  const blockRows = await db
    .select()
    .from(blocksTable)
    .where(eq(blocksTable.document_id, documentId))
    .orderBy(asc(blocksTable.order_index));

  const mappedBlocks: Block[] = blockRows.map((b) => ({
    ...b,
    content: b.content as Block["content"],
    created_at: b.created_at.toISOString(),
    updated_at: b.updated_at.toISOString(),
  }));

  const document: Document = {
    id: doc.id,
    project_id: doc.project_id,
    title: doc.title,
    doc_type: doc.doc_type as Document["doc_type"],
    product_context: (doc.product_context as ProductContext) ?? {},
    theme: (doc.theme as Theme) ?? {},
    blocks: mappedBlocks,
    created_at: doc.created_at.toISOString(),
    updated_at: doc.updated_at.toISOString(),
  };

  return <EditorLayout document={document} projectId={doc.project_id} />;
}
