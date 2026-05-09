import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");

		const projectId = await ctx.db.insert("projects", {
			name: args.name,
			description: args.description,
			userId,
		});

		return projectId;
	},
});

export const list = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("projects")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
	},
});

export const getById = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		try {
			const project = await ctx.db.get(args.projectId);
			if (!project) return null;

			// Narrowing for TypeScript
			if (project.userId === userId) {
				return project;
			}
			return null;
		} catch {
			return null;
		}
	},
});

export const remove = mutation({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");

		const project = await ctx.db.get(args.projectId);
		if (!project || project.userId !== userId) throw new Error("Unauthorized");

		// TODO: Cleanup related notes, designs, etc.
		await ctx.db.delete(args.projectId);
	},
});
