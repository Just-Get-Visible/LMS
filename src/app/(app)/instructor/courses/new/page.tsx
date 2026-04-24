import { CourseCreateForm } from "@/components/instructor/course-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "New course · Instructor",
};

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New course</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create a draft course. You can add modules, lessons and publish it
          afterwards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
          <CardDescription>You can edit everything later.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
