import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isbn: varchar("isbn", { length: 13 }).notNull().unique(),
  title: text("title").notNull(),
  author: text("author"),
  publisher: text("publisher"),
  coverURL: text("cover_url"),
  genre: text("genre"),
  categories: text("categories").array(),
  scannedAt: timestamp("scanned_at").defaultNow(),
  metadataFetched: timestamp("metadata_fetched"),
  isManualEntry: text("is_manual_entry").default("false"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  scannedAt: true,
  metadataFetched: true,
});

export const updateBookSchema = createInsertSchema(books).omit({
  id: true,
  isbn: true,
  scannedAt: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type UpdateBook = z.infer<typeof updateBookSchema>;
export type Book = typeof books.$inferSelect;
