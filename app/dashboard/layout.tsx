import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebarNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen bg-background">
			<aside className="hidden w-64 shrink-0 md:flex md:flex-col">
				<DashboardSidebarNav />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
