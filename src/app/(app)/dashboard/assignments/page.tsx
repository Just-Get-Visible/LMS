import { AssignmentCard } from "@/components/assignments/assignment-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/user";
import { getStudentAssignments } from "@/lib/data/assignments";

export const metadata = {
  title: "Assignments",
};

export default async function StudentAssignmentsPage() {
  const user = await requireUser();
  const items = await getStudentAssignments(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Assignments across your enrolled courses.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="When an instructor creates one, it will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AssignmentCard key={item.assignment.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
