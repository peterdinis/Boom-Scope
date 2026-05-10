"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
	Check,
	Copy,
	Download,
	Layout,
	NotebookPen,
	Palette,
	RefreshCw,
	Sparkles,
	Trash2,
	Type,
	Upload,
	Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const aiSystemSchema = z.object({
	colors: z.array(
		z.object({
			name: z.string(),
			hex: z.string().regex(/^#/, "Farba musí byť v HEX formáte"),
			rgb: z.string(),
		}),
	),
	fonts: z.array(z.string()),
	description: z.string().optional(),
});

type GeneratedSystem = z.infer<typeof aiSystemSchema>;

export default function DesignSystemPage() {
	const projects = useQuery(api.projects.list);
	const analyzeDesign = useAction(api.openai.analyzeDesignSystem);
	const saveSystem = useMutation(api.design_systems.create);

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	);
	const [images, setImages] = useState<{ id: string; url: string }[]>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [system, setSystem] = useState<GeneratedSystem | null>(null);
	const [copiedColor, setCopiedColor] = useState<string | null>(null);
	const [isNoteOpen, setIsNoteOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = () => {
				setImages((prev) => [
					...prev,
					{ id: Math.random().toString(), url: reader.result as string },
				]);
			};
			reader.readAsDataURL(file);
		});
	};

	const analyzeImages = async () => {
		if (images.length === 0) return;
		if (!selectedProjectId) {
			toast.error("Najprv vyberte projekt!");
			return;
		}

		setIsAnalyzing(true);
		setSystem(null);

		try {
			const result = await analyzeDesign({
				imageUrls: images.map((img) => img.url),
			});

			const parsed = aiSystemSchema.safeParse(result);
			if (!parsed.success) {
				throw new Error("AI vrátila neplatné dáta.");
			}

			setSystem(parsed.data);

			// Save to Convex
			await saveSystem({
				projectId: selectedProjectId as Id<"projects">,
				colors: parsed.data.colors,
				fonts: parsed.data.fonts,
				description: parsed.data.description,
			});

			toast.success("Design System úspešne vygenerovaný a uložený!");
		} catch (error) {
			console.error(error);
			toast.error(
				"Nepodarilo sa zanalyzovať dizajn. Skontrolujte OpenAI kľúč.",
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedColor(text);
		setTimeout(() => setCopiedColor(null), 2000);
		toast.success(`Copied ${text}`);
	};

	const copyAsCSS = () => {
		if (!system) return;
		const css = `:root {
  ${system.colors.map((c) => `--color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex};`).join("\n  ")}
  ${system.fonts.map((f, i) => `--font-${i === 0 ? "primary" : "secondary"}: '${f}';`).join("\n  ")}
}`;
		navigator.clipboard.writeText(css);
		toast.success("CSS variables copied!");
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-8 lg:p-16">
			<div className="max-w-7xl mx-auto space-y-16">
				{/* Header */}
				<header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
					<div className="space-y-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]"
						>
							<Sparkles className="size-3" />
							AI Powered Engine
						</motion.div>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-5xl lg:text-7xl font-black tracking-tighter"
						>
							Design <span className="text-primary">System</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-foreground/40 max-w-xl text-lg font-medium"
						>
							Nahrajte inšpiratívne obrázky a nechajte našu AI extrahovať farby,
							písma a vytvoriť vizuálnu identitu pre váš projekt.
						</motion.p>
					</div>

					{images.length > 0 && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<Button
								size="lg"
								onClick={analyzeImages}
								disabled={isAnalyzing}
								className="h-16 px-10 rounded-[24px] bg-primary hover:bg-blue-700 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all group overflow-hidden relative"
							>
								{isAnalyzing ? (
									<RefreshCw className="size-5 animate-spin" />
								) : (
									<div className="flex items-center gap-3">
										<Wand2 className="size-5 group-hover:rotate-12 transition-transform" />
										<span className="font-black uppercase tracking-widest text-xs">
											Generovať Identitu
										</span>
									</div>
								)}
							</Button>
						</motion.div>
					)}
				</header>

				<section className="space-y-4">
					<div className="flex flex-col gap-2">
						<label className="text-[10px] font-black uppercase tracking-widest opacity-40">
							Priradiť k projektu
						</label>
						<Select
							onValueChange={setSelectedProjectId}
							value={selectedProjectId || undefined}
						>
							<SelectTrigger className="w-full md:w-75 h-12 rounded-2xl bg-background/50 backdrop-blur-xl border-border/50">
								<SelectValue placeholder="Vyberte projekt..." />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border-border/50 backdrop-blur-3xl">
								{projects?.map((project) => (
									<SelectItem
										key={project._id}
										value={project._id}
										className="rounded-xl"
									>
										{project.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</section>

				{/* Upload Area */}
				<section>
					<div
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							"relative group cursor-pointer rounded-[40px] border-2 border-dashed transition-all duration-700 overflow-hidden",
							images.length > 0 ? "h-64" : "h-96",
							"bg-background/20 backdrop-blur-3xl border-foreground/5 hover:border-primary/30",
						)}
					>
						<input
							type="file"
							multiple
							ref={fileInputRef}
							onChange={handleUpload}
							className="hidden"
							accept="image/*"
						/>

						{images.length === 0 ? (
							<div className="h-full flex flex-col items-center justify-center space-y-6">
								<div className="size-20 rounded-[32px] bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Upload className="size-8 opacity-20" />
								</div>
								<div className="text-center">
									<p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">
										Presuňte inšpiráciu sem
									</p>
									<p className="text-[10px] font-bold opacity-20 uppercase tracking-widest mt-2">
										Podporuje PNG, JPG, WebP
									</p>
								</div>
							</div>
						) : (
							<div className="h-full flex items-center gap-4 px-8 overflow-x-auto custom-scrollbar">
								{images.map((img) => (
									<div
										key={img.id}
										className="relative h-48 min-w-48 rounded-[28px] overflow-hidden group/img shadow-2xl border border-white/10"
									>
										{/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded blob/data URL preview */}
										<img
											src={img.url}
											className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
											alt="Inšpirácia"
										/>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setImages((prev) =>
													prev.filter((i) => i.id !== img.id),
												);
											}}
											className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500 shadow-xl"
										>
											<Trash2 className="size-4" />
										</button>
									</div>
								))}
								<div className="min-w-48 h-48 rounded-[28px] border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center hover:border-primary/20 transition-all">
									<Upload className="size-6 opacity-10" />
								</div>
							</div>
						)}
					</div>
				</section>

				{/* Results / Analysis State */}
				<AnimatePresence mode="wait">
					{isAnalyzing && (
						<motion.div
							key="analyzing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="py-32 flex flex-col items-center justify-center space-y-12"
						>
							<div className="relative size-32">
								<div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping" />
								<div className="absolute inset-4 rounded-full border-4 border-primary/20 animate-pulse" />
								<div className="h-full w-full rounded-full border-4 border-t-primary animate-spin" />
								<div className="absolute inset-0 flex items-center justify-center">
									<Sparkles className="size-8 text-primary" />
								</div>
							</div>
							<div className="text-center space-y-4">
								<h2 className="text-3xl font-black tracking-tight uppercase">
									Analyzujem vizuálnu DNA
								</h2>
								<p className="text-foreground/40 font-medium tracking-widest text-[10px] uppercase animate-pulse">
									Extrahujem farby • Mapujem typografiu • Generujem komponenty
								</p>
							</div>
						</motion.div>
					)}

					{system && !isAnalyzing && (
						<motion.div
							key="result"
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
						>
							{/* Sidebar: Summary */}
							<div className="lg:col-span-4 space-y-8">
								<div className="p-8 rounded-[40px] bg-background/40 backdrop-blur-3xl border border-border shadow-2xl space-y-8">
									<div className="space-y-2">
										<p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
											Vizuálny Štýl
										</p>
										<h2 className="text-4xl font-black tracking-tight">
											{system.description || "Nová Identita"}
										</h2>
									</div>

									<div className="space-y-6">
										<div className="flex items-center gap-4">
											<div className="p-2.5 rounded-xl bg-foreground/5">
												<Palette className="size-4 opacity-40" />
											</div>
											<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
												Farebná Paleta
											</span>
										</div>
										<div className="space-y-3">
											{system.colors.map((color) => (
												<button
													key={color.hex}
													onClick={() => copyToClipboard(color.hex)}
													className="w-full flex items-center justify-between p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all border border-border/50 group"
												>
													<div className="flex items-center gap-4">
														<div
															className="size-8 rounded-lg shadow-inner"
															style={{ backgroundColor: color.hex }}
														/>
														<div className="flex flex-col items-start">
															<span className="text-[10px] font-black uppercase tracking-tighter opacity-40 leading-none mb-1">
																{color.name}
															</span>
															<span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-60">
																{color.hex}
															</span>
														</div>
													</div>
													{copiedColor === color.hex ? (
														<Check className="size-4 text-emerald-500" />
													) : (
														<Copy className="size-4 opacity-0 group-hover:opacity-20 transition-opacity" />
													)}
												</button>
											))}
										</div>
									</div>

									<div className="pt-8 border-t border-border/50 space-y-6">
										<div className="flex items-center gap-4">
											<div className="p-2.5 rounded-xl bg-foreground/5">
												<Type className="size-4 opacity-40" />
											</div>
											<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
												Typografia
											</span>
										</div>
										<div className="space-y-4">
											{system.fonts.map((font, idx) => (
												<div
													key={font}
													className="p-5 rounded-2xl bg-foreground/5 border border-border/50"
												>
													<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 mb-2">
														{idx === 0 ? "Hlavné Písmo" : "Sekundárne Písmo"}
													</p>
													<p
														className="text-xl font-black"
														style={{ fontFamily: font }}
													>
														{font}
													</p>
												</div>
											))}
										</div>
									</div>

									<div className="flex gap-3">
										<Button
											onClick={copyAsCSS}
											className="flex-1 h-14 rounded-2xl bg-foreground text-background hover:opacity-90 font-black uppercase tracking-widest text-[10px]"
										>
											<Download className="size-4 mr-3" /> Exportovať CSS
										</Button>
									</div>
								</div>
							</div>

							{/* Main: Component Preview */}
							<div className="lg:col-span-8 space-y-8">
								<div className="p-10 lg:p-16 rounded-[40px] bg-background/40 backdrop-blur-3xl border border-border shadow-2xl space-y-16 overflow-hidden relative">
									<div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
										<Layout className="size-64 rotate-12" />
									</div>

									<div className="space-y-4">
										<p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
											Live Preview
										</p>
										<h2 className="text-4xl font-black tracking-tight">
											Komponenty
										</h2>
									</div>

									{/* Preview Sections */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
										{/* Buttons */}
										<div className="space-y-8">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												Tlačidlá
											</p>
											<div className="space-y-4">
												<Button
													className="h-14 w-full rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] shadow-xl"
													style={{ backgroundColor: system.colors[0]?.hex }}
												>
													Primary Action
												</Button>
												<Button
													variant="outline"
													className="h-14 w-full rounded-2xl border-2 font-bold uppercase tracking-widest text-[10px]"
													style={{
														borderColor: system.colors[1]?.hex,
														color: system.colors[1]?.hex,
													}}
												>
													Secondary Option
												</Button>
											</div>
										</div>

										{/* Inputs */}
										<div className="space-y-8">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												Inputy
											</p>
											<div className="space-y-4">
												<div className="relative">
													<div
														className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20"
														style={{ color: system.colors[0]?.hex }}
													>
														<Sparkles className="size-4" />
													</div>
													<input
														placeholder="Píšte sem..."
														className="w-full h-14 bg-foreground/5 border border-border/50 rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:border-primary transition-all shadow-inner"
													/>
												</div>
												<div className="flex gap-2">
													{system.colors.map((c) => (
														<div
															key={`swatch-${c.hex}`}
															className="size-6 rounded-lg shadow-sm"
															style={{ backgroundColor: c.hex }}
														/>
													))}
												</div>
											</div>
										</div>

										{/* Card Preview */}
										<div className="md:col-span-2 space-y-8">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												Karty & Layout
											</p>
											<div
												className="p-8 rounded-[32px] border border-border/50 space-y-6 shadow-2xl relative overflow-hidden"
												style={{ backgroundColor: `${system.colors[0]}08` }}
											>
												<div className="flex items-center gap-4">
													<div
														className="size-12 rounded-2xl flex items-center justify-center text-white"
														style={{ backgroundColor: system.colors[2]?.hex }}
													>
														<Layout className="size-6" />
													</div>
													<div>
														<h4
															className="font-black text-lg"
															style={{ fontFamily: system.fonts[0] }}
														>
															Vizuálna Integrita
														</h4>
														<p
															className="text-xs font-medium opacity-40"
															style={{
																fontFamily: system.fonts[1] || system.fonts[0],
															}}
														>
															Harmonické farby extrahované z vašej inšpirácie.
														</p>
													</div>
												</div>
												<div className="flex gap-4">
													<div
														className="flex-1 h-2 rounded-full opacity-10"
														style={{ backgroundColor: system.colors[0]?.hex }}
													/>
													<div
														className="w-1/3 h-2 rounded-full opacity-10"
														style={{ backgroundColor: system.colors[3]?.hex }}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Background Blobs */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
				<div className="absolute top-0 right-0 size-200 bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
				<div className="absolute bottom-0 left-0 size-150 bg-emerald-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
			</div>
		</div>
	);
}
