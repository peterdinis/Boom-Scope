"use client";

import { PanelLeft, PanelRight, Palette, Layers, Move, Square, Circle, Pencil, Trash2, Undo2, Redo2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { Dock } from "@/components/design/Dock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CanvasElement } from "@/components/design/KonvaCanvas";

const KonvaCanvas = dynamic(() => import("@/components/design/KonvaCanvas"), { 
	ssr: false,
	loading: () => (
		<div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm">
			<div className="flex flex-col items-center gap-4">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				<p className="text-sm text-muted-foreground animate-pulse">Initializing Canvas...</p>
			</div>
		</div>
	)
});

const PALETTE = [
	"#000000", "#ffffff", "#71717a", "#ef4444", 
	"#f97316", "#f59e0b", "#10b981", "#3b82f6", 
	"#6366f1", "#a855f7", "#ec4899"
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
		if (toolId === "settings") {
			setRightPanelOpen((prev) => !prev);
			return;
		}
		setActiveTool(toolId);
		if (toolId !== "select") {
			setSelectedId(null);
		}
	}, []);

	const selectedElement = elements.find((el) => el.id === selectedId);

	const updateSelectedElement = (updates: Partial<CanvasElement>) => {
		if (!selectedId) return;
		setElements((prev) =>
			prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el))
		);
	};

	return (
		<div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background">
			{/* Dot Grid Background */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]"
				style={{
					backgroundImage: `radial-gradient(circle, currentColor 0.5px, transparent 0.5px)`,
					backgroundSize: "32px 32px",
				}}
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

			{/* Empty State Hint */}
			{elements.length === 0 && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-center space-y-4 opacity-20 select-none">
						<h1 className="text-5xl font-bold tracking-tight">Infinite Workspace</h1>
						<p className="text-sm">Vyberte nástroj a začnite tvoriť</p>
					</div>
				</div>
			)}

			{/* Panel Toggle Buttons */}
			<div className="absolute top-4 left-4 z-50 flex gap-2">
				{!leftPanelOpen && (
					<Button
						variant="outline"
						size="icon-xs"
						onClick={() => setLeftPanelOpen(true)}
						className="bg-background/80 backdrop-blur-sm shadow-sm"
					>
						<PanelLeft className="size-3.5" />
					</Button>
				)}
			</div>
			<div className="absolute top-4 right-4 z-50 flex gap-2">
				{!rightPanelOpen && (
					<Button
						variant="outline"
						size="icon-xs"
						onClick={() => setRightPanelOpen(true)}
						className="bg-background/80 backdrop-blur-sm shadow-sm"
					>
						<PanelRight className="size-3.5" />
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
						transition={{ type: "spring", damping: 20, stiffness: 100 }}
						className={cn(
							"absolute left-4 top-4 bottom-24 w-64 rounded-2xl border border-border/40",
							"bg-background/60 backdrop-blur-md shadow-xl p-4 hidden lg:flex flex-col z-40",
						)}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Layers className="size-3.5 text-muted-foreground" />
								<h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
									Vrstvy
								</h3>
							</div>
							<Button variant="ghost" size="icon-xs" onClick={() => setLeftPanelOpen(false)}>
								<PanelLeft className="size-3.5" />
							</Button>
						</div>
						
						<div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
							{elements.length === 0 ? (
								<div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-4">
									<div className="size-8 rounded-full border border-dashed border-muted-foreground mb-2" />
									<p className="text-[10px]">Žiadne objekty</p>
								</div>
							) : (
								elements.map((el, i) => (
									<button
										key={el.id}
										onClick={() => setSelectedId(el.id)}
										className={cn(
											"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all",
											selectedId === el.id 
												? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
												: "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
										)}
									>
										<div className="flex items-center gap-2">
											{el.type === "rect" && <Square className="size-3" />}
											{el.type === "circle" && <Circle className="size-3" />}
											{el.type === "pencil" && <Pencil className="size-3" />}
											<span className="font-medium">{el.type.charAt(0).toUpperCase() + el.type.slice(1)} {elements.length - i}</span>
										</div>
										<div 
											className="size-2 rounded-full" 
											style={{ backgroundColor: el.stroke }}
										/>
									</button>
								)).reverse()
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
						transition={{ type: "spring", damping: 20, stiffness: 100 }}
						className={cn(
							"absolute right-4 top-4 bottom-24 w-72 rounded-2xl border border-border/40",
							"bg-background/60 backdrop-blur-md shadow-xl p-6 hidden xl:flex flex-col z-40",
						)}
					>
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<Palette className="size-3.5 text-muted-foreground" />
								<h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
									Vlastnosti
								</h3>
							</div>
							<Button variant="ghost" size="icon-xs" onClick={() => setRightPanelOpen(false)}>
								<PanelRight className="size-3.5" />
							</Button>
						</div>

						<div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
							{/* Stroke Color */}
							<div className="space-y-4">
								<Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Farba obrysu</Label>
								<div className="grid grid-cols-5 gap-2">
									{PALETTE.map((color) => (
										<button
											key={color}
											onClick={() => {
												setStrokeColor(color);
												updateSelectedElement({ stroke: color });
											}}
											className={cn(
												"size-8 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95",
												(selectedElement ? selectedElement.stroke : strokeColor) === color 
													? "border-primary shadow-sm" 
													: "border-transparent shadow-inner"
											)}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
								<div className="flex gap-2">
									<Input 
										type="color" 
										value={selectedElement ? selectedElement.stroke : strokeColor}
										onChange={(e) => {
											setStrokeColor(e.target.value);
											updateSelectedElement({ stroke: e.target.value });
										}}
										className="h-9 w-12 p-1 bg-transparent border-border/20 rounded-lg cursor-pointer"
									/>
									<Input 
										type="text" 
										value={selectedElement ? selectedElement.stroke : strokeColor}
										onChange={(e) => {
											setStrokeColor(e.target.value);
											updateSelectedElement({ stroke: e.target.value });
										}}
										className="h-9 text-xs bg-muted/20 border-border/10 rounded-lg"
									/>
								</div>
							</div>

							{/* Fill Color */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Výplň</Label>
									<Button 
										variant="ghost" 
										size="xs" 
										className="text-[9px] h-6 px-2 rounded-full hover:bg-primary/10 hover:text-primary"
										onClick={() => {
											const val = fillColor === "none" ? strokeColor : "none";
											setFillColor(val);
											updateSelectedElement({ fill: val });
										}}
									>
										{(selectedElement ? selectedElement.fill : fillColor) === "none" ? "Pridať" : "Odobrať"}
									</Button>
								</div>
								{(selectedElement ? selectedElement.fill : fillColor) !== "none" && (
									<div className="grid grid-cols-5 gap-2">
										{PALETTE.map((color) => (
											<button
												key={`fill-${color}`}
												onClick={() => {
													setFillColor(color);
													updateSelectedElement({ fill: color });
												}}
												className={cn(
													"size-8 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95",
													(selectedElement ? selectedElement.fill : fillColor) === color 
														? "border-primary shadow-sm" 
														: "border-transparent shadow-inner"
												)}
												style={{ backgroundColor: color }}
											/>
										))}
									</div>
								)}
							</div>

							{/* Stroke Width */}
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Hrúbka čiary</Label>
									<span className="text-xs font-mono text-muted-foreground">{selectedElement ? selectedElement.strokeWidth : strokeWidth}px</span>
								</div>
								<input 
									type="range" 
									min="1" 
									max="20" 
									value={selectedElement ? selectedElement.strokeWidth : strokeWidth}
									onChange={(e) => {
										const val = parseInt(e.target.value);
										setStrokeWidth(val);
										updateSelectedElement({ strokeWidth: val });
									}}
									className="w-full accent-primary bg-muted/20 rounded-lg h-1.5 appearance-none cursor-pointer"
								/>
							</div>

							{/* Selected Info */}
							{selectedElement && (
								<div className="pt-6 border-t border-border/20 space-y-4">
									<Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Transformácia</Label>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<p className="text-[9px] text-muted-foreground">Pozícia X</p>
											<p className="text-xs font-mono">{Math.round(selectedElement.x)}px</p>
										</div>
										<div className="space-y-1">
											<p className="text-[9px] text-muted-foreground">Pozícia Y</p>
											<p className="text-xs font-mono">{Math.round(selectedElement.y)}px</p>
										</div>
									</div>
									<Button 
										variant="outline" 
										className="w-full gap-2 text-xs h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40"
										onClick={() => {
											setElements(elements.filter(el => el.id !== selectedId));
											setSelectedId(null);
										}}
									>
										<Trash2 className="size-3.5" />
										Vymazať objekt
									</Button>
								</div>
							)}
						</div>

						{/* Quick Actions Footer */}
						<div className="mt-6 pt-4 border-t border-border/20 flex gap-2">
							<Button variant="secondary" size="icon" className="h-9 w-full rounded-xl" onClick={() => handleAction("undo")}>
								<Undo2 className="size-4" />
							</Button>
							<Button variant="secondary" size="icon" className="h-9 w-full rounded-xl" onClick={() => handleAction("trash")}>
								<Trash2 className="size-4" />
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
