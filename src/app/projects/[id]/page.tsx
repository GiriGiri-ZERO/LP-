import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, documents } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.owner_id, session?.user?.id ?? "")));

  if (!project) notFound();

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.project_id, id))
    .orderBy(desc(documents.updated_at));

  const docTypeLabel: Record<string, string> = {
    lp: "LP",
    sales_letter: "セールスレター",
    website: "Webサイト",
    email: "メール",
    other: "その他",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm">{docs.length}件のドキュメント</p>
          </div>
          <Link href={`/projects/${id}/new`}>
            <Button className="gap-2">
              <Plus size={16} />
              新しいコピーを生成
            </Button>
          </Link>
        </div>

        {docs.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-500 mb-2">
              ドキュメントがありません
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              AIを使って最初のコピーを生成しましょう
            </p>
            <Link href={`/projects/${id}/new`}>
              <Button>
                <Plus size={16} className="mr-2" />
                コピーを生成する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <Link
                key={doc.id}
                href={`/editor/${doc.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-4 flex items-center justify-center">
                  <FileText size={32} className="text-blue-300" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>
                  <span className="shrink-0 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {docTypeLabel[doc.doc_type] ?? doc.doc_type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(doc.updated_at).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
