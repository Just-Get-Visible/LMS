import type { ReactNode } from "react";

import { requireInstructor } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";

export default async function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  await requireInstructor(user.id);
  return <>{children}</>;
}
