"use client";

import {
	Circle,
	Eye,
	EyeOff,
	Image as ImageIcon,
	Layers,
	Lock,
	Maximize2,
	Palette,
	PanelLeft,
	PanelRight,
	Pencil,
	RefreshCw,
	Settings2,
	Sliders,
	Sparkles,
	Square,
	Trash2,
	Type,
	Undo2,
	Unlock,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dock } from "@/components/design/Dock";
import type { CanvasElement } from "@/components/design/KonvaCanvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const KonvaCanvas = dynamic(() => import("@/components/design/KonvaCanvas"), {
	ssr: false,
	loading: () => (
		<div className="flex h-full w-full items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				<div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
				<p className="text-[10px] font-bold text-foreground/40 tracking-[0.3em] uppercase animate-pulse">
					Syncing Engine
				</p>
			</div>
		</div>
	),
});

const PALETTE = [
	"#ffffff",
	"#000000",
	"#71717a",
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#6366f1",
	"#a855f7",
	"#ec4899",
];

const FONTS = [
	"Inter, sans-serif",
	"Georgia, serif",
	"Courier New, monospace",
	"Impact, charcoal, sans-serif",
	"Verdana, sans-serif",
	"Trebuchet MS, sans-serif",
	"Times New Roman, serif",
	"Arial Black, sans-serif",
];

export default function DesignPage() {
	const [activeTool, setActiveTool] = useState("select");
	const [elements, setElements] = useState<CanvasElement[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const [strokeColor, setStrokeColor] = useState("#3b82f6");
	const [fillColor, setFillColor] = useState("none");
	const [strokeWidth, setStrokeWidth] = useState(2);

	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	const handleAction = useCallback((toolId: string) => {
		if (toolId === "undo") {
			setElements((prev) => prev.slice(0, -1));
			return;
		}
		if (toolId === "trash") {
			setElements([]);
			setSelectedId(null);
			return;
		}
		if (toolId === "image") {
			fileInputRef.current?.click();
			return;
		}
		if (toolId === "settings") {
			setRightPanelOpen((prev) => !prev);
			return;
		}
		setActiveTool(toolId);
		if (toolId !== "select") {
			setSelectedId(null);
		}
	}, []);

	const elementsRef = useRef(elements);
	
	useEffect(() => {
		elementsRef.current = elements;
	}, [elements]);

	const updateSelectedElement = useCallback(
		(updates: Partial<CanvasElement>) => {
			if (!selectedId) return;
			setElements((prev) =>
				prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el)),
			);
		},
		[selectedId, setElements],
	);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			)
				return;

			if ((e.metaKey || e.ctrlKey) && e.key === "z") {
				e.preventDefault();
				handleAction("undo");
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				if (selectedId) {
					setElements((prev) => prev.filter((el) => el.id !== selectedId));
					setSelectedId(null);
				}
			}
			if (e.key === "v") setActiveTool("select");
			if (e.key === "p") setActiveTool("pencil");
			if (e.key === "e") setActiveTool("eraser");
			if (e.key === "r") setActiveTool("rect");
			if (e.key === "c") setActiveTool("circle");
			if (e.key === "t") setActiveTool("text");
			if (e.key === "l" && selectedId) {
				const el = elementsRef.current.find((el) => el.id === selectedId);
				if (el) updateSelectedElement({ isLocked: !el.isLocked });
			}
			if (e.key === "h" && selectedId) {
				const el = elementsRef.current.find((el) => el.id === selectedId);
				if (el) updateSelectedElement({ isVisible: el.isVisible === false });
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedId, handleAction, updateSelectedElement]);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const id = `el-${Date.now()}`;
			const newImg: CanvasElement = {
				id,
				type: "image",
				x: 100,
				y: 100,
				width: 300,
				height: 200,
				stroke: "transparent",
				fill: "none",
				strokeWidth: 0,
				src: reader.result as string,
				isVisible: true,
				isLocked: false,
			};
			setElements([...elements, newImg]);
			setSelectedId(id);
			setActiveTool("select");
		};
		reader.readAsDataURL(file);
	};

	const selectedElement = elements.find((el) => el.id === selectedId);


	const toggleElementProperty = (
		id: string,
		prop: "isLocked" | "isVisible",
	) => {
		setElements((prev) =>
			prev.map((el) => {
				if (el.id === id) {
					if (prop === "isVisible") {
						return { ...el, isVisible: el.isVisible === false };
					}
					return { ...el, [prop]: !el[prop] };
				}
				return el;
			}),
		);
	};

	const randomizeText = () => {
		if (!selectedElement || selectedElement.type !== "text") return;
		const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
		const randomSize = Math.floor(Math.random() * (120 - 12 + 1)) + 12;
		updateSelectedElement({ fontFamily: randomFont, fontSize: randomSize });
	};

	return (
		<div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background text-foreground selection:bg-blue-500/30">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleImageUpload}
				className="hidden"
				accept="image/*"
			/>

			{/* Canvas Area */}
			<div className="absolute inset-0 h-full w-full">
				<KonvaCanvas
					activeTool={activeTool}
					elements={elements}
					setElements={setElements}
					selectedId={selectedId}
					onSelect={setSelectedId}
					strokeColor={strokeColor}
					fillColor={fillColor}
					strokeWidth={strokeWidth}
				/>
			</div>

			{/* Top Bar Info */}
			<div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-50">
				<div
					className={cn(
						"flex items-center gap-6 px-8 py-3 rounded-2xl border shadow-2xl pointer-events-auto",
						"bg-background/60 dark:bg-background/40 backdrop-blur-3xl border-border",
						"shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
					)}
				>
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"size-2 rounded-full",
								activeTool === "select"
									? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
									: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
							)}
						/>
						<span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
							{activeTool === "select"
								? "Navigácia"
								: `Editácia: ${activeTool}`}
						</span>
					</div>
					<div className="h-4 w-px bg-border/50" />
					<div className="flex items-center gap-6 text-[10px] font-bold tracking-widest opacity-40">
						<span className="flex items-center gap-2 uppercase">
							<Layers className="size-3" /> {elements.length}
						</span>
						<span className="flex items-center gap-2 uppercase">
							<RefreshCw className="size-3" /> Auto-Save
						</span>
					</div>
				</div>
			</div>

			{/* Panel Toggle Buttons */}
			<div className="absolute top-8 left-8 z-50 flex gap-2">
				{!leftPanelOpen && (
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setLeftPanelOpen(true)}
						className="bg-background/60 backdrop-blur-md border-border hover:bg-accent rounded-2xl size-11 shadow-2xl"
					>
						<PanelLeft className="size-5" />
					</Button>
				)}
			</div>
			<div className="absolute top-8 right-8 z-50 flex gap-2">
				{!rightPanelOpen && (
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setRightPanelOpen(true)}
						className="bg-background/60 backdrop-blur-md border-border hover:bg-accent rounded-2xl size-11 shadow-2xl"
					>
						<PanelRight className="size-5" />
					</Button>
				)}
			</div>

			{/* Left Sidebar (Layers) */}
			<AnimatePresence>
				{leftPanelOpen && (
					<motion.div
						initial={{ x: -300, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -300, opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 120 }}
						className={cn(
							"absolute left-8 top-8 bottom-36 w-72 rounded-[32px] border border-border",
							"bg-background/80 dark:bg-background/20 backdrop-blur-3xl p-8 hidden lg:flex flex-col z-40",
							"shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
						)}
					>
						<div className="flex items-center justify-between mb-10">
							<div className="flex items-center gap-4">
								<div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
									<Layers className="size-4" />
								</div>
								<h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
									Vrstvy
								</h3>
							</div>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => setLeftPanelOpen(false)}
								className="hover:bg-accent rounded-lg"
							>
								<PanelLeft className="size-4 opacity-40" />
							</Button>
						</div>

						<div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
							{elements.length === 0 ? (
								<div className="h-full flex flex-col items-center justify-center opacity-30 dark:opacity-10 text-center px-4">
									<div className="size-16 rounded-[24px] border-2 border-dashed border-foreground/20 mb-6 flex items-center justify-center">
										<Pencil className="size-6" />
									</div>
									<p className="text-[10px] font-black uppercase tracking-[0.2em]">
										Pripravené
									</p>
								</div>
							) : (
								elements
									.map((el) => (
										<div key={el.id} className="relative group">
											<button
												onClick={() => setSelectedId(el.id)}
												className={cn(
													"w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs transition-all duration-500",
													selectedId === el.id
														? "bg-blue-600 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] scale-[1.02]"
														: "hover:bg-accent text-foreground/50 hover:text-foreground",
												)}
											>
												<div className="flex items-center gap-4">
													<div
														className={cn(
															"size-8 rounded-xl flex items-center justify-center border border-border/50",
															selectedId === el.id
																? "bg-white/20"
																: "bg-background/40",
														)}
													>
														{el.type === "rect" && (
															<Square className="size-4" />
														)}
														{el.type === "circle" && (
															<Circle className="size-4" />
														)}
														{el.type === "pencil" && (
															<Pencil className="size-4" />
														)}
														{el.type === "text" && <Type className="size-4" />}
														{el.type === "image" && (
															<ImageIcon className="size-4" />
														)}
													</div>
													<div className="text-left">
														<p
															className={cn(
																"font-black tracking-tight opacity-90",
																el.isVisible === false &&
																	"line-through opacity-30",
															)}
														>
															{el.type.charAt(0).toUpperCase() +
																el.type.slice(1)}
														</p>
														<p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
															ID: {el.id.split("-")[1]}
														</p>
													</div>
												</div>
											</button>

											{/* Quick Layer Controls */}
											<div
												className={cn(
													"absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
													selectedId === el.id && "opacity-100",
												)}
											>
												<button
													onClick={(e) => {
														e.stopPropagation();
														toggleElementProperty(el.id, "isVisible");
													}}
													className="p-1.5 rounded-lg hover:bg-accent transition-colors"
												>
													{el.isVisible === false ? (
														<EyeOff className="size-3 text-red-500" />
													) : (
														<Eye className="size-3 opacity-40" />
													)}
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														toggleElementProperty(el.id, "isLocked");
													}}
													className="p-1.5 rounded-lg hover:bg-accent transition-colors"
												>
													{el.isLocked ? (
														<Lock className="size-3 text-amber-500" />
													) : (
														<Unlock className="size-3 opacity-40" />
													)}
												</button>
											</div>
										</div>
									))
									.reverse()
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Right Sidebar (Properties) */}
			<AnimatePresence>
				{rightPanelOpen && (
					<motion.div
						initial={{ x: 300, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: 300, opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 120 }}
						className={cn(
							"absolute right-8 top-8 bottom-36 w-80 rounded-[32px] border border-border",
							"bg-background/80 dark:bg-background/20 backdrop-blur-3xl p-8 hidden xl:flex flex-col z-40",
							"shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
						)}
					>
						<div className="flex items-center justify-between mb-10">
							<div className="flex items-center gap-4">
								<div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
									<Settings2 className="size-4" />
								</div>
								<h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
									Vlastnosti
								</h3>
							</div>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => setRightPanelOpen(false)}
								className="hover:bg-accent rounded-lg"
							>
								<PanelRight className="size-4 opacity-40" />
							</Button>
						</div>

						<div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
							{selectedElement ? (
								<>
									{/* Visibility & Lock Quick Controls */}
									<div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-accent border border-border shadow-inner">
										<button
											onClick={() =>
												updateSelectedElement({
													isVisible: selectedElement.isVisible === false,
												})
											}
											className={cn(
												"flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
												selectedElement.isVisible === false
													? "bg-red-500/20 text-red-500"
													: "hover:bg-background/50 text-foreground/50",
											)}
										>
											{selectedElement.isVisible === false ? (
												<EyeOff className="size-3" />
											) : (
												<Eye className="size-3" />
											)}
											{selectedElement.isVisible === false
												? "Skryté"
												: "Viditeľné"}
										</button>
										<button
											onClick={() =>
												updateSelectedElement({
													isLocked: !selectedElement.isLocked,
												})
											}
											className={cn(
												"flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
												selectedElement.isLocked
													? "bg-amber-500/20 text-amber-500"
													: "hover:bg-background/50 text-foreground/50",
											)}
										>
											{selectedElement.isLocked ? (
												<Lock className="size-3" />
											) : (
												<Unlock className="size-3" />
											)}
											{selectedElement.isLocked ? "Zamknuté" : "Odomknuté"}
										</button>
									</div>

									{/* Visual Settings */}
									<div className="space-y-8">
										<div className="flex items-center gap-3">
											<Palette className="size-3.5 text-blue-500" />
											<Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
												Vizuál
											</Label>
										</div>

										<div className="space-y-5">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												Farba obrysu
											</p>
											<div className="grid grid-cols-6 gap-2.5">
												{PALETTE.map((color) => (
													<button
														key={color}
														onClick={() => {
															setStrokeColor(color);
															updateSelectedElement({ stroke: color });
														}}
														className={cn(
															"size-8 rounded-xl border-2 transition-all duration-300 hover:scale-110 active:scale-90",
															selectedElement.stroke === color
																? "border-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
																: "border-transparent hover:border-foreground/20",
														)}
														style={{ backgroundColor: color }}
													/>
												))}
											</div>
										</div>
									</div>

									{/* Geometry Section */}
									<div className="space-y-10">
										<div className="flex items-center gap-3">
											<Sliders className="size-3.5 text-emerald-500" />
											<Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
												Parametre
											</Label>
										</div>

										{/* Opacity */}
										<div className="space-y-5">
											<div className="flex justify-between items-center">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Priehľadnosť
												</p>
												<span className="text-[10px] font-mono font-bold opacity-60">
													{Math.round((selectedElement.opacity ?? 1) * 100)}%
												</span>
											</div>
											<input
												type="range"
												min="0"
												max="1"
												step="0.01"
												value={selectedElement.opacity ?? 1}
												onChange={(e) =>
													updateSelectedElement({
														opacity: parseFloat(e.target.value),
													})
												}
												className="w-full accent-blue-500 bg-foreground/10 rounded-full h-1 appearance-none cursor-pointer hover:bg-foreground/20 transition-colors"
											/>
										</div>

										{/* Text Specifics */}
										{selectedElement.type === "text" && (
											<div className="space-y-8 animate-in fade-in duration-500">
												<div className="flex items-center justify-between p-4 rounded-[24px] bg-blue-500/5 border border-blue-500/10 shadow-sm">
													<div className="flex items-center gap-3">
														<Sparkles className="size-4 text-blue-500" />
														<span className="text-[10px] font-black uppercase tracking-widest opacity-80 text-blue-500">
															Náhodný Štýl
														</span>
													</div>
													<Button
														size="xs"
														variant="outline"
														className="rounded-full bg-blue-500/20 border-blue-500/40 hover:bg-blue-500 text-white"
														onClick={randomizeText}
													>
														<RefreshCw className="size-3" />
													</Button>
												</div>

												<div className="space-y-5">
													<div className="flex justify-between items-center">
														<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
															Písmo & Veľkosť
														</p>
														<span className="text-[10px] font-mono font-bold opacity-60">
															{selectedElement.fontSize}px
														</span>
													</div>
													<select
														value={selectedElement.fontFamily}
														onChange={(e) =>
															updateSelectedElement({
																fontFamily: e.target.value,
															})
														}
														className="w-full bg-background border border-border rounded-xl p-3 text-xs outline-none hover:bg-accent transition-all font-bold shadow-sm"
													>
														{FONTS.map((f) => (
															<option
																key={f}
																value={f}
																className="bg-background text-foreground"
															>
																{f.split(",")[0]}
															</option>
														))}
													</select>
													<input
														type="range"
														min="8"
														max="200"
														value={selectedElement.fontSize ?? 24}
														onChange={(e) =>
															updateSelectedElement({
																fontSize: parseInt(e.target.value),
															})
														}
														className="w-full accent-emerald-500 bg-foreground/10 rounded-full h-1 appearance-none cursor-pointer hover:bg-foreground/20 transition-colors"
													/>
												</div>
												<div className="space-y-4">
													<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
														Textový obsah
													</p>
													<textarea
														value={selectedElement.text || ""}
														onChange={(e) =>
															updateSelectedElement({ text: e.target.value })
														}
														className="w-full bg-background border border-border focus:border-blue-500/50 focus:bg-accent transition-all rounded-[20px] p-4 text-xs h-24 outline-none resize-none font-bold shadow-inner"
													/>
												</div>
											</div>
										)}
									</div>

									{/* Transformation Display */}
									<div className="pt-10 border-t border-border space-y-8">
										<div className="flex items-center gap-3">
											<Maximize2 className="size-3.5 opacity-20" />
											<Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
												Transformácia
											</Label>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="p-5 rounded-[24px] bg-foreground/5 border border-border shadow-inner">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 mb-2">
													Os X
												</p>
												<p className="text-xs font-mono font-bold opacity-70">
													{Math.round(selectedElement.x)}
												</p>
											</div>
											<div className="p-5 rounded-[24px] bg-foreground/5 border border-border shadow-inner">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 mb-2">
													Os Y
												</p>
												<p className="text-xs font-mono font-bold opacity-70">
													{Math.round(selectedElement.y)}
												</p>
											</div>
										</div>
										<Button
											variant="ghost"
											className="w-full gap-4 text-[10px] font-black uppercase tracking-[0.3em] h-14 rounded-[24px] bg-red-500/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10 transition-all duration-300 shadow-sm"
											onClick={() => {
												setElements(
													elements.filter((el) => el.id !== selectedId),
												);
												setSelectedId(null);
											}}
										>
											<Trash2 className="size-4" />
											Vymazať Výber
										</Button>
									</div>
								</>
							) : (
								<div className="h-full flex flex-col items-center justify-center opacity-30 dark:opacity-10 text-center space-y-6">
									<div className="size-24 rounded-[40px] bg-foreground/5 flex items-center justify-center border-2 border-dashed border-foreground/10">
										<Settings2 className="size-10" />
									</div>
									<div className="space-y-2">
										<p className="text-xs font-black uppercase tracking-[0.2em]">
											Žiadny Výber
										</p>
										<p className="text-[10px] font-medium tracking-widest max-w-35">
											Vyberte objekt na úpravu jeho vlastností
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Quick Controls Footer */}
						<div className="mt-10 pt-8 border-t border-border grid grid-cols-2 gap-4">
							<Button
								variant="outline"
								className="h-14 rounded-[20px] bg-background border-border hover:bg-accent transition-all shadow-sm"
								onClick={() => handleAction("undo")}
							>
								<Undo2 className="size-5 opacity-40" />
							</Button>
							<Button
								variant="outline"
								className="h-14 rounded-[20px] bg-background border-border hover:bg-accent transition-all group shadow-sm"
								onClick={() => handleAction("trash")}
							>
								<Trash2 className="size-5 opacity-20 group-hover:opacity-60 text-red-500 transition-all" />
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* The Magic Dock */}
			<Dock activeTool={activeTool} onToolChange={handleAction} />
		</div>
	);
}
