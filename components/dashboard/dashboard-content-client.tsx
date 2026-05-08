"use client";

import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebarNav } from "@/components/dashboard/dashboard-nav";
import {
	SidebarProvider,
	useSidebar,
} from "@/components/dashboard/sidebar-context";
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

export function DashboardContentClient({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</SidebarProvider>
	);
}

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FileText, Palette, Sparkles, User } from "lucide-react";
import Link from "next/link";

export function DashboardContent({ viewer }: { viewer: any }) {
	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
			<div className="flex flex-col gap-3">
				<h1 className="font-heading text-3xl font-bold tracking-tight">
					Vitajte späť, {viewer?.name || "Užívateľ"}
				</h1>
				<p className="text-muted-foreground">
					Tu je prehľad toho, čo sa deje vo vašom projekte Boom Scope.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Link href="/dashboard/notes">
					<Card className="hover:border-primary/50 transition-colors">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Moje poznámky</CardTitle>
							<FileText className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">Spravovať</div>
							<p className="text-xs text-muted-foreground">
								Zobrazte si všetky svoje poznámky
							</p>
						</CardContent>
					</Card>
				</Link>
				<Link href="/dashboard/design">
					<Card className="hover:border-primary/50 transition-colors">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Dizajn</CardTitle>
							<Palette className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">Pracovný priestor</div>
							<p className="text-xs text-muted-foreground">
								Vytvárajte nové dizajny na nekonečnej ploche
							</p>
						</CardContent>
					</Card>
				</Link>
				<Card className="opacity-60 cursor-not-allowed">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">AI Generátor</CardTitle>
						<Sparkles className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Čoskoro</div>
						<p className="text-xs text-muted-foreground">
							Generovanie dizajnov pomocou AI
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
