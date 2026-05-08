import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,
	projects: defineTable({
		name: v.string(),
		userId: v.id("users"),
	}).index("by_userId", ["userId"]),
	notes: defineTable({
		title: v.string(),
		content: v.string(), // HTML or JSON string
		projectId: v.optional(v.id("projects")),
		userId: v.id("users"),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"]),
});
