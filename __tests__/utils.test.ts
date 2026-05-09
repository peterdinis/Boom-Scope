import { describe, expect, test } from "vitest";
import { cn } from "../lib/utils";

describe("Utility: cn", () => {
	test("merges tailwind classes correctly", () => {
		expect(cn("px-2 py-2", "p-4")).toBe("p-4");
	});

	test("handles conditional classes", () => {
		expect(cn("base", true && "active", false && "hidden")).toBe("base active");
	});

	test("returns empty string for no arguments", () => {
		expect(cn()).toBe("");
	});
});
