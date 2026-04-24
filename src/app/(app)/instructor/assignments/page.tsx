import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getInstructorAssignments } from "@/lib/data/assignments";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Assignments · Instructor",
};

export default async function InstructorAssignmentsPage() {
  const user = await requireUser();
  const assignments = await getInstructorAssignments(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage assignments across your courses.
          </p>
        </div>
        <Link href="/instructor/assignments/new">
          <Button>New assignment</Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment to start collecting student work."
          action={
            <Link href="/instructor/assignments/new">
              <Button>Create assignment</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/instructor/assignments/${a.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {a.due_at
                        ? `Due ${formatDateTime(a.due_at)}`
                        : "No due date"}
                      {a.max_score != null && ` · Max ${a.max_score}`}
                    </p>
                  </div>
                  <Link
                    href={`/instructor/assignments/${a.id}`}
                    className="shrink-0 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Manage →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
