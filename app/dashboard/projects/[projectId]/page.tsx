"use client";

import { useQuery } from "convex/react";
import {
	ArrowLeft,
	ChevronRight,
	Clock,
	FileText,
	Layout,
	Palette,
	Plus,
	Settings2,
	Sparkles,
	Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { UrlObject } from "url";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export default function ProjectDetailPage() {
	const params = useParams();
	const router = useRouter();
	const projectIdRaw = params?.projectId;
	const projectId = Array.isArray(projectIdRaw)
		? projectIdRaw[0]
		: projectIdRaw;

	const project = useQuery(
		api.projects.getById,
		projectId ? { projectId: projectId as Id<"projects"> } : "skip",
	);

	if (project === undefined) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
			</div>
		);
	}

	if (project === null)
		return (
			<div className="flex h-screen flex-col items-center justify-center space-y-6">
				<div className="size-20 rounded-[32px] bg-red-500/10 flex items-center justify-center text-red-500">
					<Trash2 className="size-8" />
				</div>
				<div className="text-center space-y-2">
					<h2 className="text-2xl font-black uppercase tracking-tight">
						Projekt neexistuje
					</h2>
					<p className="text-sm font-medium opacity-40">
						Projekt, ktorý hľadáte, nebol nájdený alebo k nemu nemáte prístup.
					</p>
				</div>
				<Button
					onClick={() => router.push("/dashboard/projects")}
					variant="outline"
					className="h-14 px-8 rounded-2xl"
				>
					Späť na projekty
				</Button>
			</div>
		);

	const sections = [
		{
			id: "notes",
			label: "Poznámky",
			icon: FileText,
			color: "text-primary",
			bgColor: "bg-primary/10",
			count: 0,
			href: `/dashboard/notes?projectId=${projectId}`,
		},
		{
			id: "designs",
			label: "Canvas",
			icon: Palette,
			color: "text-emerald-500",
			bgColor: "bg-emerald-500/10",
			count: 0,
			href: `/dashboard/canvas?projectId=${projectId}`,
		},
		{
			id: "systems",
			label: "Design Systems",
			icon: Sparkles,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
			count: 0,
			href: `/dashboard/design-system?projectId=${projectId}`,
		},
	];

	return (
		<div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
			<div className="max-w-7xl mx-auto space-y-16">
				{/* Navigation & Header */}
				<header className="space-y-12">
					<Button
						variant="ghost"
						onClick={() => router.back()}
						className="group rounded-xl hover:bg-foreground/5 -ml-4"
					>
						<ArrowLeft className="size-5 mr-2 group-hover:-translate-x-1 transition-transform" />
						Späť na projekty
					</Button>

					<div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
						<div className="space-y-6">
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center gap-4"
							>
								<div className="size-20 rounded-[32px] bg-primary text-white flex items-center justify-center shadow-[0_20px_40px_rgba(37,99,235,0.3)]">
									<Layout className="size-8" />
								</div>
								<div>
									<p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">
										Projektový Priestor
									</p>
									<h1 className="text-5xl lg:text-7xl font-black tracking-tighter">
										{project.name}
									</h1>
								</div>
							</motion.div>
							<p className="text-foreground/40 max-w-2xl text-lg font-medium">
								{project.description ||
									"Tento projekt zatiaľ nemá podrobný popis. Môžete ho pridať v nastaveniach projektu."}
							</p>
						</div>

						<div className="flex gap-4">
							<Button
								variant="outline"
								className="h-14 px-8 rounded-2xl border-border bg-background/40 backdrop-blur-3xl"
								onClick={() => router.push(`/dashboard/projects/${projectId}/settings` as any)}
							>
								<Settings2 className="size-5 mr-2 opacity-40" />
								Nastavenia
							</Button>
							<Button className="h-14 px-8 rounded-2xl bg-foreground text-background hover:opacity-90 font-bold tracking-tight">
								Zdieľať Projekt
							</Button>
						</div>
					</div>
				</header>

				{/* Project Assets Sections */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{sections.map((section, i) => (
						<motion.div
							key={section.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1 }}
						>
							<Link href={section.href as unknown as UrlObject}>
								<div className="group h-full p-10 rounded-[48px] bg-background/40 backdrop-blur-3xl border border-border hover:border-foreground/20 transition-all duration-500 flex flex-col justify-between shadow-2xl overflow-hidden relative">
									{/* Glow Effect */}
									<div
										className={cn(
											"absolute -right-10 -top-10 size-40 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700",
											section.bgColor.replace("/10", "/50"),
										)}
									/>

									<div className="space-y-10">
										<div className="flex items-center justify-between">
											<div
												className={cn(
													"size-16 rounded-[24px] flex items-center justify-center border transition-all duration-500",
													section.bgColor,
													section.color,
													"border-transparent group-hover:scale-110 group-hover:rotate-6",
												)}
											>
												<section.icon className="size-7" />
											</div>
											<div className="text-[10px] font-black uppercase tracking-widest opacity-20">
												{section.count} Položiek
											</div>
										</div>
										<div className="space-y-4">
											<h3 className="text-3xl font-black tracking-tight">
												{section.label}
											</h3>
											<p className="text-sm font-medium opacity-40 leading-relaxed">
												Spravujte {section.label.toLowerCase()} priradené k
												tomuto projektu. Vytvorte nové alebo upravte existujúce.
											</p>
										</div>
									</div>

									<div className="pt-10 flex items-center justify-between">
										<Button
											variant="ghost"
											className="p-0 h-auto font-black uppercase tracking-widest text-[10px] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all"
										>
											Otvoriť Sekciu <ChevronRight className="size-3 ml-2" />
										</Button>
										<div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-500">
											<Plus className="size-4" />
										</div>
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>

				{/* Recent Activity / Feed Placeholder */}
				<section className="pt-16 space-y-10">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-black tracking-tight">
							Nedávna Aktivita
						</h2>
						<Button variant="link" className="text-primary font-bold">
							Zobraziť všetko
						</Button>
					</div>
					<div className="rounded-[40px] border border-border border-dashed p-20 flex flex-col items-center justify-center text-center opacity-20 space-y-6">
						<div className="size-20 rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center">
							<Clock className="size-8" />
						</div>
						<p className="text-sm font-medium tracking-widest uppercase">
							Zatiaľ žiadna aktivita
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
