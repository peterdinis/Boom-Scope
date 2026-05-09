"use client";

import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Circle, Layer, Line, Rect, Stage, Transformer } from "react-konva";

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
}

export default function KonvaCanvas({
	activeTool,
	elements,
	setElements,
	selectedId,
	onSelect,
	strokeColor,
	fillColor,
	strokeWidth,
}: KonvaCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<any>(null);
	const transformerRef = useRef<any>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [newElement, setNewElement] = useState<CanvasElement | null>(null);

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
			if (selectedNode) {
				transformerRef.current.nodes([selectedNode]);
				transformerRef.current.getLayer().batchDraw();
			} else {
				transformerRef.current.nodes([]);
			}
		} else if (transformerRef.current) {
			transformerRef.current.nodes([]);
		}
	}, [selectedId, elements]);

	const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		// Deselect if clicking on stage empty area
		const clickedOnStage = e.target === e.target.getStage();
		if (clickedOnStage && activeTool === "select") {
			onSelect(null);
			return;
		}

		if (activeTool === "select") return;

		onSelect(null); // Deselect while drawing
		const pos = e.target.getStage()?.getPointerPosition();
		if (!pos) return;

		setIsDrawing(true);
		const id = `el-${Date.now()}`;
		const element: CanvasElement = {
			id,
			type: activeTool,
			x: pos.x,
			y: pos.y,
			stroke: strokeColor,
			fill: fillColor,
			strokeWidth: strokeWidth,
			rotation: 0,
		};

		if (activeTool === "pencil") {
			element.points = [pos.x, pos.y];
		} else {
			element.width = 0;
			element.height = 0;
		}

		setNewElement(element);
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		if (!isDrawing || !newElement) return;

		const pos = e.target.getStage()?.getPointerPosition();
		if (!pos) return;

		if (activeTool === "pencil") {
			setNewElement({
				...newElement,
				points: [...(newElement.points || []), pos.x, pos.y],
			});
		} else {
			setNewElement({
				...newElement,
				width: pos.x - newElement.x,
				height: pos.y - newElement.y,
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
				return {
					...el,
					x: node.x(),
					y: node.y(),
					rotation: node.rotation(),
					// For rect and circle, we might want to update width/height based on scale
					width: el.width ? el.width * node.scaleX() : el.width,
					height: el.height ? el.height * node.scaleY() : el.height,
				};
			}
			return el;
		});

		// Reset scale to 1 after applying it to width/height
		node.scaleX(1);
		node.scaleY(1);

		setElements(updatedElements);
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const id = e.target.id();
		const updatedElements = elements.map((el) => {
			if (el.id === id) {
				return {
					...el,
					x: e.target.x(),
					y: e.target.y(),
				};
			}
			return el;
		});
		setElements(updatedElements);
	};

	return (
		<div ref={containerRef} className="h-full w-full">
			<Stage
				ref={stageRef}
				width={size.width}
				height={size.height}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			>
				<Layer>
					{elements.map((el) => (
						<RenderElement
							key={el.id}
							element={el}
							isSelected={selectedId === el.id}
							onSelect={() => activeTool === "select" && onSelect(el.id)}
							onDragEnd={handleDragEnd}
							draggable={activeTool === "select"}
						/>
					))}
					{newElement && <RenderElement element={newElement} isSelected={false} />}
					{activeTool === "select" && <Transformer ref={transformerRef} onTransformEnd={handleTransformEnd} />}
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
	const commonProps = {
		id: el.id,
		x: el.x,
		y: el.y,
		stroke: el.stroke,
		fill: el.fill === "none" ? undefined : el.fill,
		strokeWidth: el.strokeWidth,
		rotation: el.rotation || 0,
		onClick: onSelect,
		onTap: onSelect,
		draggable: draggable,
		onDragEnd: onDragEnd,
		opacity: isSelected ? 0.8 : 1,
	};

	if (el.type === "rect") {
		return (
			<Rect
				{...commonProps}
				width={el.width}
				height={el.height}
			/>
		);
	}

	if (el.type === "circle") {
		const radius = Math.sqrt((el.width || 0) ** 2 + (el.height || 0) ** 2);
		return (
			<Circle
				{...commonProps}
				radius={radius}
			/>
		);
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

	return null;
}
