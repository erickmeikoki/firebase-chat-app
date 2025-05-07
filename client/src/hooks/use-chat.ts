import { useState, useEffect, useRef } from 'react';
import { sendMessage as firebaseSendMessage, getCurrentUser, getMessages } from '@/lib/firebase';

export type Message = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userInitials: string;
  timestamp: number | null;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const currentUser = getCurrentUser();
  const socketRef = useRef<WebSocket | null>(null);
  
  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsNetworkError(false);
    const handleOffline = () => setIsNetworkError(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Setup WebSocket connection
  useEffect(() => {
    const setupWebsocket = () => {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log("Connecting to WebSocket:", wsUrl);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log("WebSocket connected");
        setIsNetworkError(false);
        
        // Register client
        socket.send(JSON.stringify({
          type: 'register',
          userId: currentUser.userId,
          username: currentUser.name
        }));
      };
      
      socket.onclose = () => {
        console.log("WebSocket disconnected");
        // Try to reconnect after a delay
        setTimeout(setupWebsocket, 3000);
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsNetworkError(true);
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages(prevMessages => {
              // Check if we already have this message
              const messageExists = prevMessages.some(m => 
                m.id === data.id || 
                (m.text === data.text && m.userId === data.userId && m.timestamp === data.timestamp)
              );
              
              if (!messageExists) {
                return [...prevMessages, {
                  id: data.id || `temp-${Date.now()}`,
                  text: data.text,
                  userId: data.userId,
                  userName: data.username,
                  userInitials: data.userInitials,
                  timestamp: data.timestamp
                }];
              }
              return prevMessages;
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    };
    
    setupWebsocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [currentUser.userId, currentUser.name]);
  
  // Initial message loading from Firebase
  useEffect(() => {
    async function loadInitialMessages() {
      setIsLoading(true);
      try {
        // Get messages from Firebase
        const firebaseMessages = await getMessages();
        
        // Also fetch messages from our server API
        const response = await fetch('/api/messages');
        if (response.ok) {
          const serverMessages = await response.json();
          
          // Combine both sources of messages and remove duplicates
          const allMessages = [...firebaseMessages];
          
          // Create a composite key of text+userId+timestamp to identify duplicates
          const messageKeys = new Set(allMessages.map(m => `${m.text}-${m.userId}-${m.timestamp}`));
          
          // Add server messages that aren't already in the list
          serverMessages.forEach((msg: any) => {
            const key = `${msg.text}-${msg.userId}-${msg.timestamp}`;
            if (!messageKeys.has(key)) {
              allMessages.push({
                id: msg.id || `server-${Date.now()}`,
                text: msg.text,
                userId: msg.userId,
                userName: msg.userName || 'Unknown',
                userInitials: msg.userInitials || 'U',
                timestamp: msg.timestamp
              });
              messageKeys.add(key);
            }
          });
          
          // Sort the combined list by timestamp
          const sortedMessages = allMessages.sort((a, b) => {
            if (!a.timestamp) return -1;
            if (!b.timestamp) return 1;
            return a.timestamp - b.timestamp;
          });
          
          setMessages(sortedMessages);
        } else {
          // If server API fails, still show Firebase messages
          setMessages(firebaseMessages);
        }
      } catch (error) {
        console.error("Error loading initial messages:", error);
        setIsNetworkError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialMessages();
  }, []);
  
  // Send a new message
  const sendNewMessage = async (text: string) => {
    if (!text.trim()) return false;
    
    if (navigator.onLine) {
      // Try to send via WebSocket first
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({
            type: 'message',
            userId: currentUser.userId,
            username: currentUser.name,
            userInitials: currentUser.initials,
            text: text
          }));
          
          // Also send to Firebase for redundancy
          await firebaseSendMessage(text);
          return true;
        } catch (error) {
          console.error("Error sending message via WebSocket:", error);
          // Fall back to Firebase only
          return await firebaseSendMessage(text);
        }
      } else {
        // WebSocket not available, use Firebase
        return await firebaseSendMessage(text);
      }
    } else {
      setIsNetworkError(true);
      return false;
    }
  };
  
  return {
    messages,
    isLoading,
    isNetworkError,
    currentUser,
    sendMessage: sendNewMessage
  };
}
