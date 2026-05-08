"use client";

import { Dock } from "@/components/design/Dock";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Element {
	id: string;
	type: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
	points?: { x: number; y: number }[];
	stroke?: string;
	fill?: string;
}

export default function DesignPage() {
	const [activeTool, setActiveTool] = useState("select");
	const [elements, setElements] = useState<Element[]>([]);
	const [currentElement, setCurrentElement] = useState<Element | null>(null);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const svgRef = useRef<SVGSVGElement>(null);

	const getMousePos = (e: React.MouseEvent) => {
		if (!svgRef.current) return { x: 0, y: 0 };
		const rect = svgRef.current.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (activeTool === "select") return;

		const { x, y } = getMousePos(e);
		const id = Date.now().toString();

		const newElement: Element = {
			id,
			type: activeTool,
			x,
			y,
			width: 0,
			height: 0,
			points: activeTool === "pencil" ? [{ x, y }] : undefined,
			stroke: "currentColor",
			fill: "none",
		};

		setCurrentElement(newElement);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!currentElement) return;

		const { x, y } = getMousePos(e);

		if (currentElement.type === "pencil") {
			setCurrentElement({
				...currentElement,
				points: [...(currentElement.points || []), { x, y }],
			});
		} else {
			setCurrentElement({
				...currentElement,
				width: x - currentElement.x,
				height: y - currentElement.y,
			});
		}
	};

	const handleMouseUp = () => {
		if (!currentElement) return;

		setElements([...elements, currentElement]);
		setCurrentElement(null);
	};

	const handleAction = (toolId: string) => {
		if (toolId === "undo") {
			setElements(elements.slice(0, -1));
			return;
		}
		if (toolId === "trash") {
			setElements([]);
			return;
		}
		setActiveTool(toolId);
	};

	return (
		<div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background cursor-crosshair">
			{/* Dot Grid Background (Infinite Feel) */}
			<div 
				className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]" 
				style={{
					backgroundImage: `radial-gradient(circle, currentColor 0.5px, transparent 0.5px)`,
					backgroundSize: '32px 32px'
				}}
			/>

			{/* Canvas Area (SVG) */}
			<svg
				ref={svgRef}
				className="absolute inset-0 h-full w-full touch-none"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			>
				{elements.map((el) => (
					<RenderElement key={el.id} element={el} />
				))}
				{currentElement && <RenderElement element={currentElement} isCurrent />}
			</svg>

			{/* Center Hint (only if no elements) */}
			{elements.length === 0 && !currentElement && (
				<div className="relative h-full w-full flex items-center justify-center pointer-events-none">
					<div className="text-center space-y-4 opacity-20 select-none">
						<h1 className="text-5xl font-bold tracking-tight">
							Infinite Workspace
						</h1>
						<p className="text-sm">
							Kliknite a ťahajte pre kreslenie
						</p>
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
						className="bg-background/80 backdrop-blur-sm"
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
						className="bg-background/80 backdrop-blur-sm"
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
							"bg-background/60 backdrop-blur-md shadow-xl p-4 hidden lg:block z-40"
						)}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vrstvy</h3>
							<Button variant="ghost" size="icon-xs" onClick={() => setLeftPanelOpen(false)}>
								<PanelLeft className="size-3.5" />
							</Button>
						</div>
						<div className="space-y-2">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="h-9 rounded-xl bg-muted/20 border border-border/5" />
							))}
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
							"bg-background/60 backdrop-blur-md shadow-xl p-4 hidden xl:block z-40"
						)}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vlastnosti</h3>
							<Button variant="ghost" size="icon-xs" onClick={() => setRightPanelOpen(false)}>
								<PanelRight className="size-3.5" />
							</Button>
						</div>
						<div className="space-y-6">
							<div className="space-y-3">
								<div className="h-3 w-1/3 rounded bg-muted/40" />
								<div className="h-10 rounded-xl bg-muted/10 border border-border/5" />
							</div>
							<div className="space-y-3">
								<div className="h-3 w-1/2 rounded bg-muted/40" />
								<div className="grid grid-cols-2 gap-2">
									<div className="h-10 rounded-xl bg-muted/10 border border-border/5" />
									<div className="h-10 rounded-xl bg-muted/10 border border-border/5" />
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* The Magic Dock */}
			<Dock activeTool={activeTool} onToolChange={handleAction} />
		</div>
	);
}

function RenderElement({ element: el, isCurrent }: { element: Element; isCurrent?: boolean }) {
	const stroke = el.stroke || "currentColor";
	const fill = el.fill || "none";
	const strokeWidth = el.type === "pencil" ? 2 : 1.5;

	if (el.type === "rect") {
		return (
			<rect
				x={el.width! < 0 ? el.x + el.width! : el.x}
				y={el.height! < 0 ? el.y + el.height! : el.y}
				width={Math.abs(el.width!)}
				height={Math.abs(el.height!)}
				stroke={stroke}
				fill={fill}
				strokeWidth={strokeWidth}
				className={cn(isCurrent ? "opacity-50" : "opacity-100", "transition-opacity")}
			/>
		);
	}

	if (el.type === "circle") {
		const radius = Math.sqrt(el.width! ** 2 + el.height! ** 2);
		return (
			<circle
				cx={el.x}
				cy={el.y}
				r={radius}
				stroke={stroke}
				fill={fill}
				strokeWidth={strokeWidth}
				className={cn(isCurrent ? "opacity-50" : "opacity-100", "transition-opacity")}
			/>
		);
	}

	if (el.type === "pencil" && el.points) {
		const d = el.points.reduce(
			(acc, point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`),
			"",
		);
		return (
			<path
				d={d}
				stroke={stroke}
				fill="none"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn(isCurrent ? "opacity-50" : "opacity-100", "transition-opacity")}
			/>
		);
	}

	return null;
}
