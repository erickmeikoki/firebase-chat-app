import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./storage";
import * as schema from "../shared/schema";

type Client = {
  id: string;
  username: string;
  ws: WebSocket;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Track connected clients
  const clients: Map<string, Client> = new Map();
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    let clientId = '';
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle initial connection with user info
        if (data.type === 'register' && data.userId) {
          clientId = data.userId;
          clients.set(clientId, { 
            id: data.userId, 
            username: data.username || 'Anonymous', 
            ws 
          });
          console.log(`Client registered: ${data.username || 'Anonymous'} (${data.userId})`);
        }
        
        // Handle new messages
        if (data.type === 'message') {
          // Generate a unique ID for the message
          const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          // We create a message object with the received data
          const messageObject = {
            id: messageId,
            type: 'message',
            userId: data.userId,
            username: data.username || 'Anonymous',
            userInitials: data.userInitials || 'A',
            text: data.text,
            timestamp: Date.now()
          };
          
          // Store the message in the database
          try {
            await db.insert(schema.messages).values({
              id: messageId,
              text: data.text,
              userId: data.userId,
              userName: data.username || 'Anonymous',
              userInitials: data.userInitials || 'A',
              timestamp: new Date(messageObject.timestamp)
            });
            console.log(`Message saved to database: ${messageId}`);
          } catch (dbError) {
            console.error('Error saving message to database:', dbError);
            // Continue with broadcast even if database save fails
          }
          
          // Broadcast to all connected clients
          clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify(messageObject));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle disconnections
    ws.on('close', () => {
      if (clientId) {
        clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
      }
    });
  });
  
  // REST API routes for chat messages
  app.get('/api/messages', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await db.query.messages.findMany({
        orderBy: (messages, { desc }) => [desc(messages.timestamp)],
        limit: limit,
      });
      
      res.json(messages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      connections: clients.size,
      wsServerRunning: wss.clients.size >= 0
    });
  });
  
  return httpServer;
}
