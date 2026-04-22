import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog";

export default async function DashboardPage() {
  const session = await auth();
  const userProjects = session?.user?.id
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.owner_id, session.user.id))
        .orderBy(desc(projects.updated_at))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">✨ AI Copy Studio</span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600">{session?.user?.name}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">プロジェクト</h1>
            <p className="text-gray-500 text-sm mt-1">
              {userProjects.length}件のプロジェクト
            </p>
          </div>
          <NewProjectDialog>
            <Button className="gap-2">
              <Plus size={16} />
              新しいプロジェクト
            </Button>
          </NewProjectDialog>
        </div>

        {userProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-medium text-gray-500 mb-2">
              プロジェクトがありません
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              最初のプロジェクトを作成してLPを生成しましょう
            </p>
            <NewProjectDialog>
              <Button>
                <Plus size={16} className="mr-2" />
                プロジェクトを作成
              </Button>
            </NewProjectDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(project.updated_at).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
