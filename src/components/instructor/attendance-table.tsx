import { Button } from "@/components/ui/button";
import {
  markRemainingAttendanceAction,
  setAttendanceAction,
} from "@/lib/actions/attendance";
import type { AttendanceRow } from "@/lib/data/attendance";

export function AttendanceTable({
  sessionId,
  rows,
}: {
  sessionId: string;
  rows: AttendanceRow[];
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        No registered attendees yet.
      </p>
    );
  }

  const remaining = rows.filter(
    (r) => !r.attendance || r.attendance.status === "registered",
  ).length;

  return (
    <div className="space-y-3">
      {remaining > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-zinc-50 px-3 py-2 text-xs dark:border-white/10 dark:bg-zinc-900">
          <span className="text-zinc-600 dark:text-zinc-400">
            Mark remaining {remaining} as:
          </span>
          <form
            action={markRemainingAttendanceAction.bind(
              null,
              sessionId,
              "attended",
            )}
          >
            <Button type="submit" size="sm" variant="secondary">
              Attended
            </Button>
          </form>
          <form
            action={markRemainingAttendanceAction.bind(
              null,
              sessionId,
              "missed",
            )}
          >
            <Button type="submit" size="sm" variant="ghost">
              Missed
            </Button>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2 font-medium">Student</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Notes</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {rows.map((row) => (
            <AttendanceRowItem
              key={row.userId}
              sessionId={sessionId}
              row={row}
            />
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function AttendanceRowItem({
  sessionId,
  row,
}: {
  sessionId: string;
  row: AttendanceRow;
}) {
  const status = row.attendance?.status ?? "registered";

  return (
    <tr>
      <td className="px-4 py-3">
        <p className="font-medium">
          {row.profile?.full_name?.trim() ||
            `${row.profile?.first_name ?? ""} ${
              row.profile?.last_name ?? ""
            }`.trim() ||
            "Student"}
        </p>
        {row.profile?.email && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {row.profile.email}
          </p>
        )}
      </td>
      <td className="px-4 py-3" colSpan={3}>
        <form
          action={setAttendanceAction.bind(null, sessionId, row.userId)}
          className="grid gap-2 sm:grid-cols-[160px_1fr_auto] sm:items-center"
        >
          <select
            name="status"
            defaultValue={status}
            className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="registered">Registered</option>
            <option value="attended">Attended</option>
            <option value="late">Late</option>
            <option value="missed">Missed</option>
            <option value="excused">Excused</option>
          </select>
          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            defaultValue={row.attendance?.notes ?? ""}
            className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
          />
          <Button type="submit" size="sm" variant="ghost">
            Save
          </Button>
        </form>
      </td>
    </tr>
  );
}
