import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const CategoriesEnum = pgEnum("categories", [
  "tech",
  "health",
  "lifestyle",
  "education",
]);

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  title: varchar({ length: 255 }).notNull(),
  category: CategoriesEnum(),
  body: varchar({ length: 2047 }).notNull(),
});

export const createPostSchema = createInsertSchema(postsTable);
