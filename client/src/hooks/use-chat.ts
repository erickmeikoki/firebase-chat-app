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
          console.log("WebSocket message received:", event.data);
          const data = JSON.parse(event.data);
          console.log("Parsed WebSocket data:", data);
          
          if (data.type === 'message') {
            console.log("Received chat message:", data);
            
            const newMessage = {
              id: data.id || `temp-${Date.now()}`,
              text: data.text,
              userId: data.userId,
              userName: data.username,
              userInitials: data.userInitials,
              timestamp: data.timestamp
            };
            
            console.log("Adding new message to UI:", newMessage);
            
            setMessages(prevMessages => {
              // Check if we already have this message
              const messageExists = prevMessages.some(m => 
                m.id === data.id || 
                (m.text === data.text && m.userId === data.userId && m.timestamp === data.timestamp)
              );
              
              console.log("Message already exists?", messageExists);
              
              if (!messageExists) {
                const updatedMessages = [...prevMessages, newMessage];
                console.log("Updated messages array:", updatedMessages);
                return updatedMessages;
              }
              return prevMessages;
            });
            
            // Try an additional direct state update technique as fallback
            setTimeout(() => {
              setMessages(prev => {
                const exists = prev.some(m => m.id === newMessage.id);
                console.log("Retry adding message, exists?", exists);
                return exists ? prev : [...prev, newMessage];
              });
            }, 500);
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
        // Create a default message if there are none
        const demoMessage: Message = {
          id: `demo-${Date.now()}`,
          text: "Welcome to the chat! Click the Test WebSocket button to see a test message or type a message and hit send.",
          userId: "system",
          userName: "System",
          userInitials: "SYS",
          timestamp: Date.now()
        };
        
        // Get messages from Firebase
        console.log("Loading messages from Firebase...");
        const firebaseMessages = await getMessages();
        console.log("Firebase messages received:", firebaseMessages);
        
        // Also fetch messages from our server API
        console.log("Fetching messages from server API...");
        try {
          const response = await fetch('/api/messages');
          console.log("Server API response:", response);
          
          if (response.ok) {
            const serverMessages = await response.json();
            console.log("Server messages received:", serverMessages);
            
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
            
            // Add a system welcome message if there are no messages
            const finalMessages = sortedMessages.length === 0 ? [demoMessage] : sortedMessages;
            
            console.log("Combined sorted messages:", finalMessages);
            setMessages(finalMessages);
          } else {
            // If server API fails, still show Firebase messages or welcome message
            console.log("Server API request failed, using only Firebase messages");
            const finalMessages = firebaseMessages.length === 0 ? [demoMessage] : firebaseMessages;
            setMessages(finalMessages);
          }
        } catch (serverError) {
          console.error("Error fetching from server API:", serverError);
          const finalMessages = firebaseMessages.length === 0 ? [demoMessage] : firebaseMessages;
          setMessages(finalMessages);
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
          console.log("Sending message via WebSocket:", text);
          socketRef.current.send(JSON.stringify({
            type: 'message',
            userId: currentUser.userId,
            username: currentUser.name,
            userInitials: currentUser.initials,
            text: text
          }));
          
          // Add the message locally for immediate feedback
          const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            text: text,
            userId: currentUser.userId,
            userName: currentUser.name,
            userInitials: currentUser.initials,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, tempMessage]);
          
          try {
            // Try to send to Firebase for redundancy, but don't wait for it or let it fail our operation
            firebaseSendMessage(text).catch(e => console.log("Firebase backup send failed:", e));
          } catch (firebaseError) {
            console.log("Firebase backup send error:", firebaseError);
            // Ignore Firebase errors
          }
          
          return true;
        } catch (error) {
          console.error("Error sending message via WebSocket:", error);
          // Try Firebase as last resort
          try {
            await firebaseSendMessage(text);
            return true;
          } catch (fbErr) {
            console.error("Firebase fallback also failed:", fbErr);
            return false;
          }
        }
      } else {
        // WebSocket not available, show connecting status
        console.log("WebSocket not available, trying to send anyway");
        
        // Add message locally regardless
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          text: text,
          userId: currentUser.userId,
          userName: currentUser.name,
          userInitials: currentUser.initials,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, tempMessage]);
        
        // Try Firebase as backup
        try {
          await firebaseSendMessage(text);
          return true;
        } catch (e) {
          console.error("Firebase send failed:", e);
          return true; // Still return true since we showed the message locally
        }
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
