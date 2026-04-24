import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InstructorStats } from "@/lib/data/instructor";

export function InstructorStatsWidget({ stats }: { stats: InstructorStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Active courses" value={stats.courseCount} />
      <StatCard label="Enrolled students" value={stats.enrolmentCount} />
      <StatCard
        label="Submissions to review"
        value={stats.pendingSubmissionsCount}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
