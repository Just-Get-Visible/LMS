import { Suspense } from "react";

import {
  UsersSearchInput,
  UsersTable,
} from "@/components/admin/users-table";
import { listUsers } from "@/lib/data/admin-users";

export const metadata = {
  title: "Users · Admin",
};

type SearchParams = Promise<{ q?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const users = await listUsers({ search: q });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {users.length} user{users.length === 1 ? "" : "s"} shown
          {q ? ` matching "${q}"` : ""}.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-10 max-w-sm rounded-md bg-zinc-100 dark:bg-zinc-900" />
        }
      >
        <UsersSearchInput />
      </Suspense>

      <UsersTable users={users} />
    </div>
  );
}
