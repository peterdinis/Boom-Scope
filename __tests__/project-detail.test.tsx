import { render, screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import ProjectDetailPage from "../app/dashboard/projects/[projectId]/page";

// Mock Convex
vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		back: vi.fn(),
	}),
	useParams: vi.fn(),
}));

describe("Page: Project Detail", () => {
	test("renders project title and description", () => {
		(useParams as any).mockReturnValue({ projectId: "test-id" });
		(useQuery as any).mockReturnValue({
			_id: "test-id",
			name: "Architecture Project",
			description: "A custom villa design",
		});

		render(<ProjectDetailPage />);

		expect(screen.getByText("Architecture Project")).toBeDefined();
		expect(screen.getByText("A custom villa design")).toBeDefined();
	});

	test("shows the correct module sections", () => {
		(useParams as any).mockReturnValue({ projectId: "test-id" });
		(useQuery as any).mockReturnValue({
			_id: "test-id",
			name: "Test Project",
		});

		render(<ProjectDetailPage />);

		expect(screen.getByText("Poznámky")).toBeDefined();
		expect(screen.getByText("Dizajny")).toBeDefined();
		expect(screen.getByText("Design Systems")).toBeDefined();
	});

	test("handles non-existent project", () => {
		(useParams as any).mockReturnValue({ projectId: "wrong-id" });
		(useQuery as any).mockReturnValue(null);

		render(<ProjectDetailPage />);

		expect(screen.getByText(/Projekt neexistuje/i)).toBeDefined();
	});
});
