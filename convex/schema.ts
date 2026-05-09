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
		elements: v.string(),
		canvasSize: v.optional(
			v.object({
				width: v.number(),
				height: v.number(),
			}),
		),
		artboardColor: v.optional(v.string()),
		projectId: v.id("projects"),
		userId: v.id("users"),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
	design_systems: defineTable({
		projectId: v.id("projects"),
		userId: v.id("users"),
		colors: v.array(
			v.object({
				name: v.string(),
				hex: v.string(),
				rgb: v.string(),
			}),
		),
		fonts: v.array(v.string()),
		description: v.optional(v.string()),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
});
