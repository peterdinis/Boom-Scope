"use client";

import type { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { DashboardSidebarNav } from "./dashboard-nav";
import { DashboardHeader } from "./dashboard-header";
import { cn } from "@/lib/utils";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<div className="flex min-h-screen bg-background">
			<aside
				className={cn(
					"hidden shrink-0 transition-all duration-300 ease-in-out md:flex md:flex-col border-r border-sidebar-border",
					isCollapsed ? "w-0 overflow-hidden border-none" : "w-64",
				)}
			>
				<DashboardSidebarNav />
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</SidebarProvider>
	);
}
