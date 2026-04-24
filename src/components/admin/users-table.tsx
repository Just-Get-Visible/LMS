"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bulkAssignRoleAction,
  bulkRemoveRoleAction,
} from "@/lib/actions/admin-users";
import { formatDateTime } from "@/lib/format";
import type { UserListItem } from "@/lib/data/admin-users";

export function UsersSearchInput() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function handleChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/admin/users?${qs}` : "/admin/users");
    });
  }

  return (
    <Input
      type="search"
      defaultValue={params.get("q") ?? ""}
      placeholder="Search by name or email"
      onChange={(event) => handleChange(event.target.value)}
      className="max-w-sm"
      aria-label="Search users"
    />
  );
}

export function UsersTable({ users }: { users: UserListItem[] }) {
  const allIds = useMemo(() => users.map((u) => u.id), [users]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds),
    );
  }

  if (users.length === 0) {
    return (
      <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        No users match.
      </p>
    );
  }

  const allChecked =
    allIds.length > 0 && selectedIds.size === allIds.length;
  const someChecked = selectedIds.size > 0 && !allChecked;

  return (
    <div className="space-y-4">
      <BulkRoleBar
        selectedIds={[...selectedIds]}
        onClear={() => setSelectedIds(new Set())}
      />
      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all users"
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                />
              </th>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {users.map((user) => (
              <tr
                key={user.id}
                className={
                  selectedIds.has(user.id)
                    ? "bg-zinc-50 dark:bg-zinc-900/40"
                    : ""
                }
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => toggleOne(user.id)}
                    aria-label={`Select ${user.email ?? user.id}`}
                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {user.full_name?.trim() ||
                      `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                      "User"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {user.is_active ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800 dark:bg-red-950/40 dark:text-red-300">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(user.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BulkRoleBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState("student");
  const noneSelected = selectedIds.length === 0;

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("role", role);
    return fd;
  }

  function handleAdd() {
    startTransition(async () => {
      await bulkAssignRoleAction(selectedIds, buildFormData());
      onClear();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await bulkRemoveRoleAction(selectedIds, buildFormData());
      onClear();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {noneSelected
          ? "Select users to bulk-edit roles"
          : `${selectedIds.length} selected`}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={noneSelected || isPending}
          aria-label="Bulk role"
          className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-xs capitalize disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
        </select>
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={noneSelected || isPending}
        >
          {isPending ? "Working..." : "Add role"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={noneSelected || isPending}
        >
          Remove role
        </Button>
      </div>
    </div>
  );
}
