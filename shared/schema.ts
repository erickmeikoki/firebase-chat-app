import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Messages table for storing message history
export const messages = pgTable("messages", {
  id: text("id").primaryKey(), // Using string IDs for better compatibility with WebSockets
  text: text("text").notNull(),
  userId: text("user_id").notNull(), // Using string user IDs from client
  userName: text("user_name").notNull(),
  userInitials: text("user_initials").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages, {
  id: z.string(),
  text: z.string(),
  userId: z.string(),
  userName: z.string(),
  userInitials: z.string(),
  timestamp: z.date(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
