import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Fetch all of the DMs that you're a part of.
export const list = authenticatedQuery({
  handler: async (ctx) => {
    const directMessages = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
      .collect();

    return await Promise.all(
      directMessages.map((dm) => getDirectMessage(ctx, dm.directMessage))
    );
  },
});

// Function to create a new DM.
export const create = authenticatedMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (!user) {
      throw new Error("User does not exist.");
    }

    /** See if a DM thread between the two users already exists. */

    // Grab all the current user's DMs.
    const directMessagesForCurrentUser = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
      .collect();

    // Grab all the other user's DMs.
    const directMessagesForOtherUser = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();

    // Search for a DM that both the current user and the other user are part of.
    const directMessage = directMessagesForCurrentUser.find((dm) =>
      directMessagesForOtherUser.find(
        (dm2) => dm.directMessage === dm2.directMessage
      )
    );

    // If one exists, return it.
    if (directMessage) {
      return directMessage.directMessage;
    }

    // Otherwise, create one by inserting a new empty record into the directMessages
    // table.
    const newDirectMessage = await ctx.db.insert("directMessages", {});

    // Add both members to the DM.
    await Promise.all([
      ctx.db.insert("directMessageMembers", {
        user: ctx.user._id,
        directMessage: newDirectMessage,
      }),
      ctx.db.insert("directMessageMembers", {
        user: user._id,
        directMessage: newDirectMessage,
      }),
    ]);

    // Return the id of the newly created DM.
    return newDirectMessage;
  },
});

// Look up the user by their username, find the DM thread, and if it doesn't
// already exist, create it.

// Given a DM id, return the DM and the name of the other user in the DM.
export const get = authenticatedQuery({
  args: {
    id: v.id("directMessages"),
  },
  // Look up the direct message by the ID, and return it if you're a
  // member of that DM.
  handler: async (ctx, { id }) => {
    // Fetch the member record.
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_user", (q) =>
        q.eq("directMessage", id).eq("user", ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error("You are not a member of this DM.");
    }

    return await getDirectMessage(ctx, id);
  },
});

const getDirectMessage = async (
  ctx: QueryCtx & { user: Doc<"users"> },
  id: Id<"directMessages">
) => {
  // Fetch the DM by the ID.
  const dm = await ctx.db.get(id);

  if (!dm) {
    throw new Error("DM does not exist.");
  }

  // Fetch the other member of this DM, ie. filter out the current user.
  const otherMember = await ctx.db
    .query("directMessageMembers")
    .withIndex("by_direct_message", (q) => q.eq("directMessage", id))
    .filter((q) => q.neq(q.field("user"), ctx.user._id))
    .first();

  if (!otherMember) {
    throw new Error("This direct message has no other members.");
  }

  // Otherwise, fetch the user.
  const user = await ctx.db.get(otherMember.user);

  if (!user) {
    throw new Error("Other member does not exist.");
  }

  // Return the DM and the other user.
  return {
    ...dm,
    user,
  };
};
