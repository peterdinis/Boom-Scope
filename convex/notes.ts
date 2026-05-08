import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    let q = ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc");

    // Filtering by project if provided
    if (args.projectId) {
      q = ctx.db
        .query("notes")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .order("desc");
    }

    const result = await q.paginate(args.paginationOpts);

    // Manual filtering for search term (Convex doesn't have native full-text search in basic queries easily without separate search index)
    if (args.searchTerm) {
      const lowerSearch = args.searchTerm.toLowerCase();
      result.page = result.page.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerSearch) ||
          note.content.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  },
});

export const get = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) return null;
    return note;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("notes", {
      title: args.title,
      content: args.content,
      projectId: args.projectId,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.noteId);
    if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

    const { noteId, ...updates } = args;
    await ctx.db.patch(noteId, updates);
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.noteId);
    if (!existing || existing.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.noteId);
  },
});
