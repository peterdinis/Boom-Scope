import { Suspense } from "react";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { DashboardContent } from "@/components/dashboard/dashboard-content-client";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default async function DashboardPage() {
  const token = await convexAuthNextjsToken();
  const viewer = await fetchQuery(api.users.viewer, {}, { token });

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent viewer={viewer} />
    </Suspense>
  );
}
