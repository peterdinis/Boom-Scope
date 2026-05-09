"use client";

import type Konva from "konva";

import "konva/lib/shapes/Transformer";
import "konva/lib/shapes/Rect";
import "konva/lib/shapes/Circle";
import "konva/lib/shapes/Line";
import "konva/lib/shapes/Text";

import type { KonvaEventObject } from "konva/lib/Node";
import { Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
	Arrow,
	Circle,
	Image as KonvaImage,
	Layer,
	Line,
	Rect,
	Stage,
	Star,
	Text,
	Transformer,
} from "react-konva";
import useImage from "use-image";

export interface CanvasElement {
	id: string;
	type: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
	points?: number[];
	stroke: string;
	fill: string;
	strokeWidth: number;
	rotation?: number;
	opacity?: number;
	cornerRadius?: number;
	text?: string;
	fontSize?: number;
	fontFamily?: string;
	src?: string;
	globalCompositeOperation?: string;
	isLocked?: boolean;
	isVisible?: boolean;
	fillType?: "solid" | "gradient";
	gradientStart?: { x: number; y: number };
	gradientEnd?: { x: number; y: number };
	gradientColors?: string[];
	dash?: number[];
}

interface KonvaCanvasProps {
	activeTool?: string;
	elements: CanvasElement[];
	setElements: (elements: CanvasElement[]) => void;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	strokeColor?: string;
	fillColor?: string;
	strokeWidth?: number;
	snapToGrid?: boolean;
	canvasSize?: { width: number; height: number } | null;
	zoom: number;
	setZoom: (zoom: number | ((prev: number) => number)) => void;
	artboardColor?: string | null;
	readOnly?: boolean;
}

const GRID_SIZE = 20;

export default function KonvaCanvas({
	activeTool = "select",
	elements,
	setElements,
	selectedId,
	onSelect,
	strokeColor = "#3b82f6",
	fillColor = "none",
	strokeWidth = 2,
	snapToGrid = true,
	canvasSize,
	zoom,
	setZoom,
	artboardColor,
	readOnly = false,
}: KonvaCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<Konva.Stage>(null);
	const transformerRef = useRef<Konva.Transformer>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [newElement, setNewElement] = useState<CanvasElement | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		elementId: string;
	} | null>(null);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	const elementsRef = useRef(elements);

	useEffect(() => {
		elementsRef.current = elements;
	}, [elements]);

	// Handle stage resizing
	useEffect(() => {
		if (!containerRef.current) return;

		const observeTarget = containerRef.current;
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setSize({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				});
			}
		});

		resizeObserver.observe(observeTarget);
		return () => resizeObserver.unobserve(observeTarget);
	}, []);

	// Center stage when canvasSize changes
	useEffect(() => {
		if (canvasSize && stageRef.current) {
			const stage = stageRef.current;
			const scale = Math.min(
				(size.width * 0.8) / canvasSize.width,
				(size.height * 0.8) / canvasSize.height,
				1,
			);

			stage.scale({ x: scale, y: scale });
			setZoom(scale);
			stage.position({
				x: (size.width - canvasSize.width * scale) / 2,
				y: (size.height - canvasSize.height * scale) / 2,
			});
		}
	}, [canvasSize, size.width, size.height, setZoom]);

	// Update stage scale when zoom prop changes
	useEffect(() => {
		if (stageRef.current) {
			stageRef.current.scale({ x: zoom, y: zoom });
		}
	}, [zoom]);

	// Handle transformer selection
	useEffect(() => {
		if (transformerRef.current && selectedId && stageRef.current) {
			const selectedNode = stageRef.current.findOne(`#${selectedId}`);
			const element = elementsRef.current.find((el) => el.id === selectedId);

			// Don't show transformer for locked or hidden elements
			if (selectedNode && !element?.isLocked && element?.isVisible !== false) {
				if (typeof transformerRef.current.nodes === "function") {
					transformerRef.current.nodes([selectedNode]);
					transformerRef.current.getLayer()!.batchDraw();
				}
			} else {
				if (typeof transformerRef.current.nodes === "function") {
					transformerRef.current.nodes([]);
				}
				if (element?.isLocked || element?.isVisible === false) {
					onSelect(null);
				}
			}
		} else if (transformerRef.current) {
			if (typeof transformerRef.current.nodes === "function") {
				transformerRef.current.nodes([]);
			}
		}
	}, [selectedId, onSelect]);

	const snap = (val: number) => {
		return snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : val;
	};

	const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		if (readOnly) return;
		const clickedOnStage = e.target === e.target.getStage();
		if (clickedOnStage && (activeTool === "select" || activeTool === "hand")) {
			onSelect(null);
			return;
		}

		if (activeTool === "select" || activeTool === "hand") return;

		onSelect(null);
		const stage = e.target.getStage();
		if (!stage) return;

		const pos = stage.getRelativePointerPosition();
		if (!pos) return;

		const snappedX = snap(pos.x);
		const snappedY = snap(pos.y);

		setIsDrawing(true);
		const id = `el-${Date.now()}`;
		const element: CanvasElement = {
			id,
			type: activeTool === "eraser" ? "pencil" : activeTool,
			x: snappedX,
			y: snappedY,
			stroke:
				activeTool === "eraser"
					? isDark
						? "#000000"
						: "#ffffff"
					: strokeColor,
			fill: activeTool === "eraser" ? "none" : fillColor,
			strokeWidth: activeTool === "eraser" ? strokeWidth * 2 : strokeWidth,
			rotation: 0,
			opacity: 1,
			isVisible: true,
			isLocked: false,
			globalCompositeOperation:
				activeTool === "eraser" ? "destination-out" : "source-over",
		};

		if (activeTool === "pencil" || activeTool === "eraser") {
			element.points = [pos.x, pos.y];
		} else if (activeTool === "text") {
			element.text = "Napíšte text...";
			element.fontSize = 24;
			element.fontFamily = "Inter, sans-serif";
			setIsDrawing(false);
			setElements((prev) => [...prev, element]);
			onSelect(id);
			return;
		} else {
			element.width = 0;
			element.height = 0;
		}

		setNewElement(element);
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		if (readOnly || !isDrawing || !newElement) return;

		const stage = e.target.getStage();
		if (!stage) return;

		const pos = stage.getRelativePointerPosition();
		if (!pos) return;

		if (activeTool === "pencil" || activeTool === "eraser") {
			setNewElement({
				...newElement,
				points: [...(newElement.points || []), pos.x, pos.y],
			});
		} else {
			setNewElement({
				...newElement,
				width: snap(pos.x - newElement.x),
				height: snap(pos.y - newElement.y),
			});
		}
	};

	const handleMouseUp = () => {
		if (!isDrawing || !newElement) return;

		setElements((prev) => [...prev, newElement]);
		setNewElement(null);
		setIsDrawing(false);
	};

	const handleTransformEnd = (e: KonvaEventObject<Event>) => {
		const node = e.target;
		const id = node.id();
		setElements((prev) =>
			prev.map((el) => {
				if (el.id === id) {
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();

					node.scaleX(1);
					node.scaleY(1);

					return {
						...el,
						x: snap(node.x()),
						y: snap(node.y()),
						rotation: node.rotation(),
						width: el.width ? snap(Math.max(5, el.width * scaleX)) : el.width,
						height: el.height
							? snap(Math.max(5, el.height * scaleY))
							: el.height,
					};
				}
				return el;
			}),
		);
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const id = e.target.id();
		setElements((prev) =>
			prev.map((el) => {
				if (el.id === id) {
					return {
						...el,
						x: snap(e.target.x()),
						y: snap(e.target.y()),
					};
				}
				return el;
			}),
		);
	};

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;

		// Handle Panning (Standard Scroll)
		if (!e.evt.ctrlKey && !e.evt.metaKey) {
			const dx = -e.evt.deltaX;
			const dy = -e.evt.deltaY;
			stage.position({
				x: stage.x() + dx,
				y: stage.y() + dy,
			});
			return;
		}

		// Handle Zooming (Ctrl/Cmd + Scroll)
		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		const direction = e.evt.deltaY > 0 ? 1 : -1;
		const scaleBy = 1.1;
		const newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;

		// Limit zoom
		const finalScale = Math.max(0.1, Math.min(5, newScale));
		stage.scale({ x: finalScale, y: finalScale });
		setZoom(finalScale);

		const newPos = {
			x: pointer.x - mousePointTo.x * finalScale,
			y: pointer.y - mousePointTo.y * finalScale,
		};
		stage.position(newPos);
	};

	const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const clickedOnElement = e.target !== stage;
		if (clickedOnElement) {
			const id = e.target.id();
			if (id) {
				setContextMenu({
					x: pointer.x,
					y: pointer.y,
					elementId: id,
				});
				onSelect(id);
			}
		} else {
			setContextMenu(null);
		}
	};

	useEffect(() => {
		const handleClickOutside = () => setContextMenu(null);
		window.addEventListener("click", handleClickOutside);
		return () => window.removeEventListener("click", handleClickOutside);
	}, []);

	const renderGrid = () => {
		const lines = [];
		const width = size.width * 10;
		const height = size.height * 10;
		const stroke = isDark ? "#ffffff" : "#000000";
		const opacity = isDark ? 0.05 : 0.2;

		for (let i = -width; i < width; i += GRID_SIZE) {
			lines.push(
				<Line
					key={`v-${i}`}
					points={[i, -height, i, height]}
					stroke={stroke}
					strokeWidth={0.2}
					opacity={opacity}
					listening={false}
				/>,
			);
		}
		for (let j = -height; j < height; j += GRID_SIZE) {
			lines.push(
				<Line
					key={`h-${j}`}
					points={[-width, j, width, j]}
					stroke={stroke}
					strokeWidth={0.2}
					opacity={opacity}
					listening={false}
				/>,
			);
		}
		return lines;
	};

	return (
		<div
			ref={containerRef}
			className="h-full w-full bg-background relative overflow-hidden"
		>
			<Stage
				ref={stageRef}
				width={size.width}
				height={size.height}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={readOnly ? undefined : handleMouseUp}
				onWheel={handleWheel}
				onContextMenu={
					readOnly ? (e) => e.evt.preventDefault() : handleContextMenu
				}
				draggable={
					!readOnly && (activeTool === "select" || activeTool === "hand")
				}
				style={{
					cursor: readOnly
						? "default"
						: activeTool === "hand"
							? "grab"
							: "default",
				}}
			>
				{/* Background Grid Layer */}
				<Layer listening={false}>{renderGrid()}</Layer>

				{/* Artboard Background */}
				{canvasSize && (
					<Layer listening={false}>
						<Rect
							x={0}
							y={0}
							width={canvasSize.width}
							height={canvasSize.height}
							fill={artboardColor || (isDark ? "#18181b" : "#ffffff")}
							shadowColor="black"
							shadowBlur={20}
							shadowOpacity={0.1}
							shadowOffset={{ x: 0, y: 10 }}
						/>
					</Layer>
				)}

				{/* Main Drawing Layer */}
				<Layer>
					{elements.map((el) => (
						<RenderElement
							key={el.id}
							element={el}
							isSelected={selectedId === el.id}
							onSelect={() => {
								if (
									activeTool === "select" &&
									!el.isLocked &&
									el.isVisible !== false
								) {
									onSelect(el.id);
								}
							}}
							onDragEnd={handleDragEnd}
							draggable={
								activeTool === "select" &&
								!el.isLocked &&
								el.isVisible !== false
							}
						/>
					))}
					{newElement && (
						<RenderElement element={newElement} isSelected={false} />
					)}

					{activeTool === "select" && (
						<Transformer
							ref={transformerRef}
							onTransformEnd={handleTransformEnd}
							boundBoxFunc={(oldBox, newBox) => {
								if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
									return oldBox;
								}
								return newBox;
							}}
							anchorSize={10}
							anchorCornerRadius={3}
							anchorStroke="#3b82f6"
							anchorFill="#ffffff"
							borderStroke="#3b82f6"
							borderStrokeWidth={1}
							rotateAnchorOffset={20}
						/>
					)}
				</Layer>
			</Stage>

			{/* Context Menu */}
			{contextMenu && (
				<div
					className="absolute z-[100] bg-background/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-1.5 min-w-[180px] animate-in zoom-in-95 duration-200"
					style={{ top: contextMenu.y, left: contextMenu.x }}
				>
					<button
						className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all group"
						onClick={(e) => {
							e.stopPropagation();
							setElements((prev) =>
								prev.filter((el) => el.id !== contextMenu.elementId),
							);
							if (selectedId === contextMenu.elementId) onSelect(null);
							setContextMenu(null);
						}}
					>
						<span className="text-[10px] font-black uppercase tracking-widest">
							Vymazať objekt
						</span>
						<Trash2 className="size-3.5 opacity-50 group-hover:opacity-100" />
					</button>
				</div>
			)}
		</div>
	);
}

function RenderElement({
	element: el,
	isSelected,
	onSelect,
	onDragEnd,
	draggable,
}: {
	element: CanvasElement;
	isSelected: boolean;
	onSelect?: () => void;
	onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
	draggable?: boolean;
}) {
	const [image] = useImage(el.src || "");

	if (el.isVisible === false) return null;

	const commonProps = {
		id: el.id,
		x: el.x,
		y: el.y,
		stroke: el.stroke,
		fill:
			el.fillType === "gradient"
				? undefined
				: el.fill === "none"
					? undefined
					: el.fill,
		fillLinearGradientStartPoint:
			el.fillType === "gradient"
				? el.gradientStart || { x: 0, y: 0 }
				: undefined,
		fillLinearGradientEndPoint:
			el.fillType === "gradient"
				? el.gradientEnd || { x: el.width || 100, y: el.height || 100 }
				: undefined,
		fillLinearGradientColorStops:
			el.fillType === "gradient"
				? [
						0,
						el.gradientColors?.[0] || "#3b82f6",
						1,
						el.gradientColors?.[1] || "#10b981",
					]
				: undefined,
		strokeWidth: el.strokeWidth,
		dash: el.dash,
		rotation: el.rotation || 0,
		opacity: el.opacity ?? 1,
		onClick: onSelect,
		onTap: onSelect,
		draggable: draggable,
		onDragEnd: onDragEnd,
		shadowColor: isSelected ? "#3b82f6" : "#000000",
		shadowBlur: isSelected ? 15 : el.shadowBlur || 0,
		shadowOpacity: isSelected ? 0.5 : el.shadowBlur ? 0.3 : 0,
		globalCompositeOperation:
			el.globalCompositeOperation as GlobalCompositeOperation,
	};

	if (el.type === "rect") {
		return (
			<Rect
				{...commonProps}
				width={el.width}
				height={el.height}
				cornerRadius={el.cornerRadius}
			/>
		);
	}

	if (el.type === "circle") {
		const radius = Math.sqrt((el.width || 0) ** 2 + (el.height || 0) ** 2);
		return <Circle {...commonProps} radius={radius} />;
	}

	if (el.type === "pencil") {
		return (
			<Line
				{...commonProps}
				points={el.points}
				tension={0.5}
				lineCap="round"
				lineJoin="round"
			/>
		);
	}

	if (el.type === "text") {
		return (
			<Text
				{...commonProps}
				text={el.text}
				fontSize={el.fontSize}
				fontFamily={el.fontFamily || "Inter, sans-serif"}
				fontStyle="bold"
				fill={el.stroke}
				width={el.width}
				height={el.height}
			/>
		);
	}

	if (el.type === "image" && image) {
		return (
			<KonvaImage
				{...commonProps}
				image={image}
				width={el.width}
				height={el.height}
			/>
		);
	}

	if (el.type === "star") {
		return (
			<Star
				{...commonProps}
				innerRadius={Math.abs(el.width || 0) / 4}
				outerRadius={Math.abs(el.width || 0) / 2}
				numPoints={5}
			/>
		);
	}

	if (el.type === "arrow") {
		return (
			<Arrow
				{...commonProps}
				points={[0, 0, el.width || 0, el.height || 0]}
				pointerLength={20}
				pointerWidth={20}
			/>
		);
	}

	return null;
}
