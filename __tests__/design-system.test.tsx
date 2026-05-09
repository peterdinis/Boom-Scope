import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import DesignSystemPage from "../app/dashboard/design-system/page";

// Mock Sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock FileReader
class MockFileReader {
	onload: any;
	readAsDataURL() {
		this.onload();
	}
	result = "data:image/png;base64,abc";
}
(global as any).FileReader = MockFileReader;

describe("Page: Design System Generator", () => {
	test("renders initial upload state", () => {
		render(<DesignSystemPage />);
		expect(screen.getByText(/Presuňte inšpiráciu sem/i)).toBeDefined();
	});

	test("shows generation button after image upload", async () => {
		const { container } = render(<DesignSystemPage />);
		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;

		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(screen.getByText(/Generovať Identitu/i)).toBeDefined();
		});
	});

	test("enters analyzing state on button click", async () => {
		const { container } = render(<DesignSystemPage />);

		const input = container.querySelector(
			"input[type='file']",
		) as HTMLInputElement;
		const file = new File(["dummy content"], "test.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [file] } });

		const generateBtn = await screen.findByText(/Generovať Identitu/i);
		fireEvent.click(generateBtn);

		expect(screen.getByText(/Analyzujem vizuálnu DNA/i)).toBeDefined();
	});
});
