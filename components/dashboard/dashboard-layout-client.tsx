"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebarNav } from "./dashboard-nav";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardLayoutContent({ children }: { children: ReactNode }) {
	const { isCollapsed } = useSidebar();
	const pathname = usePathname();

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
				<main className="flex-1 overflow-y-auto">
					<AnimatePresence mode="wait" initial={false}>
						<motion.div
							key={pathname}
							initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(20px)" }}
							animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, scale: 1.02, y: -15, filter: "blur(20px)" }}
							transition={{
								type: "spring",
								stiffness: 260,
								damping: 30,
								mass: 1,
								restDelta: 0.001,
							}}
							className="h-full origin-top"
						>
							{children}
						</motion.div>
					</AnimatePresence>
				</main>
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
