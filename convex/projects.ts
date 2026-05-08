import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];
		return await ctx.db
			.query("projects")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		return await ctx.db.insert("projects", {
			name: args.name,
			userId,
		});
	},
});
