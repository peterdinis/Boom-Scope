"use client";

import {
	Circle,
	Image as ImageIcon,
	MousePointer2,
	Pencil,
	Redo,
	Settings,
	Share2,
	Square,
	Trash2,
	Type,
	Undo,
} from "lucide-react";
import {
	type MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const tools = [
	{ id: "select", icon: MousePointer2, label: "Výber" },
	{ id: "pencil", icon: Pencil, label: "Pero" },
	{ id: "rect", icon: Square, label: "Obdĺžnik" },
	{ id: "circle", icon: Circle, label: "Kruh" },
	{ id: "text", icon: Type, label: "Text" },
	{ id: "image", icon: ImageIcon, label: "Obrázok" },
	{ id: "sep-1", type: "separator" },
	{ id: "undo", icon: Undo, label: "Späť" },
	{ id: "redo", icon: Redo, label: "Dopredu" },
	{ id: "sep-2", type: "separator" },
	{ id: "trash", icon: Trash2, label: "Vymazať", color: "text-destructive" },
	{ id: "settings", icon: Settings, label: "Nastavenia" },
	{ id: "share", icon: Share2, label: "Zdieľať" },
];

export function Dock({
	activeTool,
	onToolChange,
}: {
	activeTool: string;
	onToolChange: (tool: string) => void;
}) {
	const mouseX = useMotionValue(Infinity);

	return (
		<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
			<motion.div
				onMouseMove={(e) => mouseX.set(e.pageX)}
				onMouseLeave={() => mouseX.set(Infinity)}
				className={cn(
					"flex items-end gap-3 rounded-2xl px-4 pb-3 pt-2",
					"bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl",
				)}
			>
				{tools.map((tool) => {
					if (tool.type === "separator") {
						return (
							<div
								key={tool.id}
								className="mx-1 h-8 w-px bg-white/10 self-center"
							/>
						);
					}
					return (
						<DockIcon
							key={tool.id}
							mouseX={mouseX}
							icon={tool.icon}
							label={tool.label}
							isActive={activeTool === tool.id}
							onClick={() => onToolChange(tool.id)}
							color={tool.color}
						/>
					);
				})}
			</motion.div>
		</div>
	);
}

function DockIcon({
	mouseX,
	icon: Icon,
	label,
	isActive,
	onClick,
	color,
}: {
	mouseX: MotionValue;
	icon: any;
	label: string;
	isActive: boolean;
	onClick: () => void;
	color?: string;
}) {
	const ref = useRef<HTMLButtonElement>(null);

	const distance = useTransform(mouseX, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
		return val - bounds.x - bounds.width / 2;
	});

	const widthSync = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
	const width = useSpring(widthSync, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	return (
		<button
			ref={ref}
			onClick={onClick}
			className="relative flex flex-col items-center group focus:outline-none"
		>
			<motion.div
				style={{ width, height: width }}
				className={cn(
					"flex items-center justify-center rounded-xl transition-colors",
					isActive
						? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
						: cn(
								"bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
								color,
							),
				)}
			>
				<Icon className="size-1/2" />
			</motion.div>

			{/* Tooltip */}
			<div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
				<div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded-md border border-border shadow-sm whitespace-nowrap font-medium">
					{label}
				</div>
			</div>

			{/* Active Indicator */}
			{isActive && (
				<motion.div
					layoutId="active-pill"
					className="absolute -bottom-1.5 size-1 rounded-full bg-primary"
				/>
			)}
		</button>
	);
}
