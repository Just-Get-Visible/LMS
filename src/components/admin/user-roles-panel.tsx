import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  assignRoleAction,
  removeRoleAction,
} from "@/lib/actions/admin-users";
import type { Enums } from "@/types";

const ALL_ROLES: Enums<"app_role">[] = [
  "admin",
  "instructor",
  "student",
  "staff",
];

interface Props {
  userId: string;
  currentRoles: Enums<"app_role">[];
}

export function UserRolesPanel({ userId, currentRoles }: Props) {
  const missing = ALL_ROLES.filter((r) => !currentRoles.includes(r));

  return (
    <div className="space-y-4">
      <div>
        <Label>Current roles</Label>
        {currentRoles.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No roles assigned.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {currentRoles.map((role) => (
              <li
                key={role}
                className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800"
              >
                <span className="capitalize">{role}</span>
                <form
                  action={removeRoleAction.bind(null, userId, role)}
                >
                  <button
                    type="submit"
                    aria-label={`Remove ${role} role`}
                    className="text-zinc-500 hover:text-red-600 dark:text-zinc-400"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {missing.length > 0 && (
        <form
          action={assignRoleAction.bind(null, userId)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`add-role-${userId}`}>Assign role</Label>
            <select
              id={`add-role-${userId}`}
              name="role"
              defaultValue={missing[0]}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm capitalize dark:border-zinc-800 dark:bg-zinc-950"
            >
              {missing.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="md">
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
