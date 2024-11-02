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
    // Adding an index to this table, in order to quickly access a user by their
    // Clerk ID.  Name the index and an array of fields we want to include in it.
  }).index("by_clerk_id", ["clerkId"]),
  // Define a messages table
  messages: defineTable({
    // Table properties and their types.
    sender: v.string(),
    content: v.string(),
  }),
});
