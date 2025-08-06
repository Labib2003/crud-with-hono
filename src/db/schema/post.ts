import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
// @ts-ignore
import { usersTable } from "./user.ts";
import z from "zod";

export const CategoriesEnum = pgEnum("categories", [
  "TECH",
  "HEALTH",
  "LIFESTYLE",
  "EDUCATION",
]);

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  title: varchar({ length: 255 }).notNull(),
  category: CategoriesEnum().notNull(),
  body: varchar({ length: 2047 }).notNull(),
  created_by: integer()
    .references(() => usersTable.id)
    .notNull(),

  created_at: timestamp().defaultNow(),
});

export const createPostSchema = createInsertSchema(postsTable, {
  created_by: z.undefined(),
});
export const updatePostSchema = createUpdateSchema(postsTable);
