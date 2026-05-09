import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const saveDesign = mutation({
  args: {
    name: v.string(),
    elements: v.string(),
    projectId: v.id("projects"),
    canvasSize: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    artboardColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const designId = await ctx.db.insert("designs", {
      name: args.name,
      elements: args.elements,
      projectId: args.projectId,
      userId: userId,
      canvasSize: args.canvasSize,
      artboardColor: args.artboardColor,
    });

    return designId;
  },
});

export const getDesign = query({
  args: { designId: v.id("designs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.designId);
  },
});
