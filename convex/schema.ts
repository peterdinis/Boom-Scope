import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,
	projects: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		userId: v.id("users"),
	}).index("by_userId", ["userId"]),
	notes: defineTable({
		title: v.string(),
		content: v.string(),
		projectId: v.optional(v.id("projects")),
		userId: v.id("users"),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	designs: defineTable({
		name: v.string(),
		elements: v.string(), // JSON string of canvas elements
		projectId: v.id("projects"),
		userId: v.id("users"),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	design_systems: defineTable({
		name: v.string(),
		data: v.string(), // JSON string of colors, fonts, vibe
		projectId: v.id("projects"),
		userId: v.id("users"),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
});
