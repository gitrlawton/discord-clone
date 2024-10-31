// User-defined file which contains functions to use to interact with messages table.

// Helper to define a query or mutation.  A query is a function that fetches data, a
// mutation is a function that modifies it.
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Query to return all messages.
export const list = query({
  // Every Convex query or mutation will pass ctx.  That's how we can access our
  // database.
  handler: async (ctx) => {
    // collect() returns every single message in our database.
    return await ctx.db.query("messages").collect();
  },
});

// Mutation to create a new message.
export const reate = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { sender, content }) => {
    await ctx.db.insert("messages", { sender, content });
  },
});
