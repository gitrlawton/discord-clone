import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

// List function to list all the users who are typing in the DM thread.
export const list = authenticatedQuery({
  args: {
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { directMessage }) => {
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_direct_message", (q) =>
        q.eq("directMessage", directMessage)
      )
      .filter((q) => q.neq(q.field("user"), ctx.user._id)) // filter out our username.
      .collect();

    // Fetch the usernames and retun them in an array.
    return await Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.user);

        if (!user) {
          throw new Error("User does not exist.");
        }

        return user.username;
      })
    );
  },
});

// Create a typing indicator up update the current one with a new expiration date.
// If you've been typing for awhile, we don't want it to expire, so we update the
// expiration time to continue showing the indicator.
export const upsert = authenticatedMutation({
  args: {
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { directMessage }) => {
    // Query the database for an already existing typing indicator.
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_direct_message", (q) =>
        q.eq("user", ctx.user._id).eq("directMessage", directMessage)
      )
      .unique();

    // Define the new expiration date.
    const expiresAt = Date.now() + 5000;
    // If a typing indicator exists, update it with the new time.
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    }
    // Otherwise, create a new typing indicator.
    else {
      await ctx.db.insert("typingIndicators", {
        user: ctx.user._id,
        directMessage,
        expiresAt,
      });
    }

    // Schedule mutation to run at expiration time.
    await ctx.scheduler.runAt(expiresAt, internal.functions.typing.remove, {
      directMessage,
      user: ctx.user._id,
      expiresAt,
    });
  },
});

// Once the new typing indicator is created, we're going to want to delete that
// record from the database after a couple seconds, unless the expiration time is
// updated.
export const remove = internalMutation({
  args: {
    directMessage: v.id("directMessages"),
    user: v.id("users"),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { directMessage, user, expiresAt }) => {
    // Query the database for an already existing typing indicator.
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_direct_message", (q) =>
        q.eq("user", user).eq("directMessage", directMessage)
      )
      .unique();

    // If we found one and the expiration date matches what we're expecting...
    if (existing && (!expiresAt || existing.expiresAt === expiresAt)) {
      // Delete it.
      await ctx.db.delete(existing._id);
    }
  },
});
