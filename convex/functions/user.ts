// User-created file.

// Define some queries and mutations to update the user.

import {
  internalMutation,
  MutationCtx,
  query,
  QueryCtx,
} from "../_generated/server";
import { v } from "convex/values";

export const get = query({
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Internal mutation called upsert which handles creating/updating a user.
// Internal means we cannot call it from the front-end, but we can call it from an
// http action or from another function that's within the convex API.
export const upsert = internalMutation({
  args: {
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up the user by their Clerk ID.
    const user = await getUserByClerkId(ctx, args.clerkId);

    // If a user was found...
    if (user) {
      // ...update their information.
      await ctx.db.patch(user._id, {
        username: args.username,
        image: args.image,
      });
    } else {
      // Otherwise, create a user inside the users table with that information.
      await ctx.db.insert("users", {
        username: args.username,
        image: args.image,
        clerkId: args.clerkId,
      });
    }
  },
});

// Internal mutation to delete a user from the users table.
export const remove = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    // Look up the user by their Clerk ID.
    const user = await getUserByClerkId(ctx, clerkId);

    // If a user was found, delete it from the database.
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

// Helper to fetch the current user.
const getCurrentUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return await getUserByClerkId(ctx, identity.subject);
};

// Helper that looks up the user by their Clerk ID.
// Return a single user by using .unique()
const getUserByClerkId = async (
  ctx: QueryCtx | MutationCtx,
  clerkId: string
) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
};
