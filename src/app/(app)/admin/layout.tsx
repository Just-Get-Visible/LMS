import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  await requireAdmin(user.id);
  return <>{children}</>;
}
