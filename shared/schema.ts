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
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).pick({
  text: true,
  userId: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
