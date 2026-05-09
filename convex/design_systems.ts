import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
	args: {
		projectId: v.id("projects"),
		colors: v.array(
			v.object({
				name: v.string(),
				hex: v.string(),
				rgb: v.string(),
			}),
		),
		fonts: v.array(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Unauthorized");

		// Verify project ownership
		const project = await ctx.db.get(args.projectId);
		if (!project || project.userId !== userId) throw new Error("Unauthorized");

		return await ctx.db.insert("design_systems", {
			projectId: args.projectId,
			userId,
			colors: args.colors,
			fonts: args.fonts,
			description: args.description,
		});
	},
});

export const getByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const systems = await ctx.db
			.query("design_systems")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.collect();

		return systems;
	},
});
