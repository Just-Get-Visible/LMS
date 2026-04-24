import { notFound } from "next/navigation";

import { DangerZone } from "@/components/profile/danger-zone";
import { EmailPreferencesForm } from "@/components/profile/email-preferences-form";
import { ProfileForm } from "@/components/profile/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/user";
import { readEmailPreferences } from "@/lib/email/preferences";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) notFound();
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Update your personal details and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Your name, contact details and how you appear across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email preferences</CardTitle>
          <CardDescription>
            Choose which emails you want to receive. In-app notifications stay on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPreferencesForm
            defaults={readEmailPreferences(profile.metadata)}
          />
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-300">
            Danger zone
          </CardTitle>
          <CardDescription>
            Irreversible account actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone userEmail={user?.email ?? profile.email} />
        </CardContent>
      </Card>
    </div>
  );
}
