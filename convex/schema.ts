// This user-created file defines our database tables and the types for them.

import { defineSchema, defineTable } from "convex/server";
// A helper used to define the type and validate it as it's coming in.
import { v } from "convex/values";

export default defineSchema({
  // Define a messages table
  messages: defineTable({
    // Table properties and their types.
    sender: v.string(),
    content: v.string(),
  }),
});
