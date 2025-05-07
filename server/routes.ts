import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./storage";

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
    
    ws.on('message', (message) => {
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
          // We create a message object with the received data
          const messageObject = {
            type: 'message',
            userId: data.userId,
            username: data.username || 'Anonymous',
            userInitials: data.userInitials || 'A',
            text: data.text,
            timestamp: Date.now()
          };
          
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
