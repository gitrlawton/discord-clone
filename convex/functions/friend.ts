// This file contains the friends API.

import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";

// For getting a list of accepted friends.
export const listAccepted = authenticatedQuery({
  handler: async (ctx) => {
    // Retrieve all of the friend requests where you are user2 and the
    // status is pending.
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1_status", (q) =>
        q.eq("user1", ctx.user._id).eq("status", "accepted")
      )
      .collect();

    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2_status", (q) =>
        q.eq("user2", ctx.user._id).eq("status", "accepted")
      )
      .collect();

    const friendsWithUser1 = await mapWithUsers(ctx, friends1, "user2");
    const friendsWithUser2 = await mapWithUsers(ctx, friends2, "user1");

    return [...friendsWithUser1, ...friendsWithUser2];
  },
});

// For getting a list of pending friend requests.
export const listPending = authenticatedQuery({
  handler: async (ctx) => {
    // Retrieve all of the friend requests where you are user2 and the
    // status is pending.
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user2_status", (q) =>
        q.eq("user2", ctx.user._id).eq("status", "pending")
      )
      .collect();

    return await mapWithUsers(ctx, friends, "user1");
  },
});

// Function to create a friend request.
export const createFriendRequest = authenticatedMutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (!user) {
      throw new Error("User not found.");
    } else if (user._id === ctx.user._id) {
      throw new Error("You cannot add yourself.");
    }

    // Otherwise, create a friend object with status pending.
    await ctx.db.insert("friends", {
      user1: ctx.user._id,
      user2: user._id,
      status: "pending",
    });
  },
});

// Function to update the status of the friend request.
export const updateStatus = authenticatedMutation({
  args: {
    id: v.id("friends"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, { id, status }) => {
    // Lookup the friend by their ID.
    const friend = await ctx.db.get(id);

    if (!friend) {
      throw new Error("Friend not found.");
    }

    if (friend.user1 !== ctx.user._id && friend.user2 !== ctx.user._id) {
      throw new Error("Unauthorized");
    }

    // Update the status.
    await ctx.db.patch(id, { status });
  },
});

const mapWithUsers = async <
  K extends string,
  T extends { [key in K]: Id<"users"> },
>(
  ctx: QueryCtx,
  items: T[],
  key: K
) => {
  // Return the user so we can display it on the front-end.
  const result = await Promise.allSettled(
    // Map over the users, and for each one...
    items.map(async (item) => {
      // ...get the friend object.
      const user = await ctx.db.get(item[key]);

      if (!user) {
        throw new Error("User not found");
      }

      // Return the friend object with the user.
      return {
        ...item,
        user,
      };
    })
  );

  // Return the value of result only.
  return result.filter((r) => r.status === "fulfilled").map((r) => r.value);
};
