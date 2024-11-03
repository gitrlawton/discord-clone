// This user-created file defines our database tables and the types for them.

import { defineSchema, defineTable } from "convex/server";
// A helper used to define the type and validate it as it's coming in.
import { v } from "convex/values";

export default defineSchema({
  // Define a users table
  users: defineTable({
    // Table properties and their types.
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  })
    // Adding indices to this table, in order to quickly access a user by their
    // Clerk ID and by their username.  Give the index a name and an array of fields
    // we want to include in it.
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"]),
  // Define a friends table
  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  })
    .index("by_user1_status", ["user1", "status"])
    .index("by_user2_status", ["user2", "status"]),
  // Define a messages table
  messages: defineTable({
    // Table properties and their types.
    sender: v.string(),
    content: v.string(),
  }),
});
