import Link from "next/link";
import { notFound } from "next/navigation";

import { UserRolesPanel } from "@/components/admin/user-roles-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setUserActiveAction } from "@/lib/actions/admin-users";
import { getUserDetails } from "@/lib/data/admin-users";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ userId: string }>;

export const metadata = {
  title: "User · Admin",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Params;
}) {
  const { userId } = await params;
  const details = await getUserDetails(userId);
  if (!details) notFound();

  const { profile, roles } = details;
  const displayName =
    profile.full_name?.trim() ||
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
    profile.email ||
    "User";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/users"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All users
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
          {profile.is_active ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Active
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-800 dark:bg-red-950/40 dark:text-red-300">
              Inactive
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <Row label="Email">{profile.email ?? "—"}</Row>
              <Row label="Phone">{profile.phone ?? "—"}</Row>
              <Row label="Headline">{profile.headline ?? "—"}</Row>
              <Row label="Timezone">{profile.timezone ?? "—"}</Row>
              <Row label="Joined">{formatDateTime(profile.created_at)}</Row>
              <Row label="Last seen">
                {profile.last_seen_at
                  ? formatDateTime(profile.last_seen_at)
                  : "—"}
              </Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Toggle access and manage roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Status</p>
              <form
                action={setUserActiveAction.bind(
                  null,
                  profile.id,
                  !profile.is_active,
                )}
              >
                <Button
                  type="submit"
                  variant={profile.is_active ? "destructive" : "primary"}
                  size="sm"
                >
                  {profile.is_active ? "Deactivate" : "Activate"}
                </Button>
              </form>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Roles</p>
              <UserRolesPanel
                userId={profile.id}
                currentRoles={roles}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
