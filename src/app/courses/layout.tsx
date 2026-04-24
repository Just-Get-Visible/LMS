import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-zinc-50 pb-16 dark:bg-black">
        {children}
      </main>
    </>
  );
}
