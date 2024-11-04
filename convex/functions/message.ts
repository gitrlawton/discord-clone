// User-defined file which contains functions to use to interact with messages table.

// Helper to define a query or mutation.  A query is a function that fetches data, a
// mutation is a function that modifies it.
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";

// Query to return all messages.
export const list = authenticatedQuery({
  args: {
    directMessage: v.id("directMessages"),
  },
  // Every Convex query or mutation will pass ctx.  That's how we can access our
  // database.
  handler: async (ctx, { directMessage }) => {
    // Fetch the member record for verification.
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error("You are not a member of this direct message.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_direct_message", (q) =>
        q.eq("directMessage", directMessage)
      )
      .collect(); // returns every single message in our database.

    // For each message...
    return await Promise.all(
      messages.map(async (message) => {
        // ..fetch its sender.
        const sender = await ctx.db.get(message.sender);

        // Return the message with the sender object.
        return {
          ...message,
          sender,
        };
      })
    );
  },
});

// Mutation to create a new message.
export const create = authenticatedMutation({
  args: {
    content: v.string(),
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { content, directMessage }) => {
    // Fetch the member record for verification.  We want to make sure
    // they are a member of this DM thread before allowing them to send
    // a message.
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error("You are not a member of this direct message.");
    }

    await ctx.db.insert("messages", {
      content,
      directMessage,
      sender: ctx.user._id,
    });
  },
});
