import type { ReactNode } from "react";
import { DashboardContentClient } from "@/components/dashboard/dashboard-content-client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return <DashboardContentClient>{children}</DashboardContentClient>;
}
