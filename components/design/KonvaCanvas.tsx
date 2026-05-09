"use client";

import Konva from "konva";

if (typeof window !== "undefined") {
	require("konva/lib/shapes/Transformer");
	require("konva/lib/shapes/Rect");
	require("konva/lib/shapes/Circle");
	require("konva/lib/shapes/Line");
	require("konva/lib/shapes/Text");
}

import type { KonvaEventObject } from "konva/lib/Node";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
	Circle,
	Image as KonvaImage,
	Layer,
	Line,
	Rect,
	Stage,
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
}

interface KonvaCanvasProps {
	activeTool: string;
	elements: CanvasElement[];
	setElements: (elements: CanvasElement[]) => void;
	selectedId: string | null;
	onSelect: (id: string | null) => void;
	strokeColor: string;
	fillColor: string;
	strokeWidth: number;
	snapToGrid?: boolean;
}

const GRID_SIZE = 20;

export default function KonvaCanvas({
	activeTool,
	elements,
	setElements,
	selectedId,
	onSelect,
	strokeColor,
	fillColor,
	strokeWidth,
	snapToGrid = true,
}: KonvaCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<any>(null);
	const transformerRef = useRef<any>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [newElement, setNewElement] = useState<CanvasElement | null>(null);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	const elementsRef = useRef(elements);
	elementsRef.current = elements;

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

	// Handle transformer selection
	useEffect(() => {
		if (transformerRef.current && selectedId) {
			const selectedNode = stageRef.current.findOne(`#${selectedId}`);
			const element = elementsRef.current.find((el) => el.id === selectedId);

			// Don't show transformer for locked or hidden elements
			if (selectedNode && !element?.isLocked && element?.isVisible !== false) {
				if (typeof transformerRef.current.nodes === "function") {
					transformerRef.current.nodes([selectedNode]);
					transformerRef.current.getLayer().batchDraw();
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
		const clickedOnStage = e.target === e.target.getStage();
		if (clickedOnStage && activeTool === "select") {
			onSelect(null);
			return;
		}

		if (activeTool === "select") return;

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
			setElements([...elements, element]);
			onSelect(id);
			return;
		} else {
			element.width = 0;
			element.height = 0;
		}

		setNewElement(element);
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		if (!isDrawing || !newElement) return;

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

		setElements([...elements, newElement]);
		setNewElement(null);
		setIsDrawing(false);
	};

	const handleTransformEnd = (e: KonvaEventObject<Event>) => {
		const node = e.target;
		const id = node.id();
		const updatedElements = elements.map((el) => {
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
					height: el.height ? snap(Math.max(5, el.height * scaleY)) : el.height,
				};
			}
			return el;
		});

		setElements(updatedElements);
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const id = e.target.id();
		const updatedElements = elements.map((el) => {
			if (el.id === id) {
				return {
					...el,
					x: snap(e.target.x()),
					y: snap(e.target.y()),
				};
			}
			return el;
		});
		setElements(updatedElements);
	};

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		const direction = e.evt.deltaY > 0 ? 1 : -1;
		const newScale = direction > 0 ? oldScale * 0.9 : oldScale * 1.1;

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
	};

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
		<div ref={containerRef} className="h-full w-full bg-background">
			<Stage
				ref={stageRef}
				width={size.width}
				height={size.height}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onWheel={handleWheel}
				draggable={activeTool === "select"}
			>
				{/* Background Grid Layer */}
				<Layer listening={false}>{renderGrid()}</Layer>

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
		fill: el.fill === "none" ? undefined : el.fill,
		strokeWidth: el.strokeWidth,
		rotation: el.rotation || 0,
		opacity: el.opacity ?? 1,
		onClick: onSelect,
		onTap: onSelect,
		draggable: draggable,
		onDragEnd: onDragEnd,
		shadowColor: isSelected ? "#3b82f6" : "transparent",
		shadowBlur: isSelected ? 15 : 0,
		shadowOpacity: 0.5,
		globalCompositeOperation: el.globalCompositeOperation as any,
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

	return null;
}
