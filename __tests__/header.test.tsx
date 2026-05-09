import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, describe, vi } from "vitest";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { SidebarProvider } from "../components/dashboard/sidebar-context";
import { usePathname } from "next/navigation";
import React from "react";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
}));

// Mock ModeToggle and UserMenu to avoid complex dependencies
vi.mock("@/components/mode-toggle", () => ({
	ModeToggle: () => <div data-testid="mode-toggle" />,
}));
vi.mock("@/components/UserMenu", () => ({
	UserMenu: () => <div data-testid="user-menu" />,
}));

describe("Component: DashboardHeader", () => {
	test("renders the correct title based on pathname", () => {
		(usePathname as any).mockReturnValue("/dashboard/notes");
		
		render(
			<SidebarProvider>
				<DashboardHeader />
			</SidebarProvider>
		);
		
		expect(screen.getByText("Poznámky")).toBeDefined();
		expect(screen.getByText(/Správa vašich poznámok/i)).toBeDefined();
	});

	test("toggles sidebar on button click", () => {
		(usePathname as any).mockReturnValue("/dashboard");
		
		render(
			<SidebarProvider>
				<DashboardHeader />
			</SidebarProvider>
		);
		
		const toggleBtn = screen.getByTitle(/Zatvoriť bočný panel/i);
		fireEvent.click(toggleBtn);
		
		expect(screen.getByTitle(/Otvoriť bočný panel/i)).toBeDefined();
	});
});
