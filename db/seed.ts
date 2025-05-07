import { db } from "./index";
import * as schema from "@shared/schema";
import { nanoid } from "nanoid";

// Sample chat messages for demonstration
const sampleUsers = [
  { username: "alex_morgan", password: "password123" },
  { username: "john_doe", password: "securepass456" }
];

const sampleMessages = [
  { 
    text: "Hey there! How's it going?",
    userId: 1, // Will be linked to the first user
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    text: "Hi! I'm doing well, thanks for asking. Just working on this new Firebase chat app. How about you?",
    userId: 2, // Will be linked to the second user
    timestamp: new Date(Date.now() - 1000 * 60 * 28) // 28 minutes ago
  },
  {
    text: "That sounds awesome! I've been meaning to try Firebase. Is it easy to work with?",
    userId: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 26) // 26 minutes ago
  },
  {
    text: "Yes, Firebase is incredibly user-friendly! The real-time database makes it perfect for chat applications like this one.",
    userId: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 24) // 24 minutes ago
  },
  {
    text: "I'll definitely check it out! By the way, the UI of this chat app looks really clean.",
    userId: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  }
];

async function seed() {
  try {
    console.log("Starting to seed the database...");
    
    // Check if users already exist
    const existingUsers = await db.query.users.findMany();
    
    if (existingUsers.length === 0) {
      console.log("Seeding users...");
      
      // Insert sample users
      for (const user of sampleUsers) {
        await db.insert(schema.users).values(user);
      }
      
      console.log("Users seeded successfully.");
    } else {
      console.log("Users already exist, skipping user seeding.");
    }
    
    // Check if messages already exist
    const existingMessages = await db.query.messages.findMany();
    
    if (existingMessages.length === 0) {
      console.log("Seeding messages...");
      
      // Insert sample messages
      for (const message of sampleMessages) {
        await db.insert(schema.messages).values(message);
      }
      
      console.log("Messages seeded successfully.");
    } else {
      console.log("Messages already exist, skipping message seeding.");
    }
    
    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
