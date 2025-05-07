import { useState, useEffect } from 'react';
import { sendMessage, subscribeToMessages, getCurrentUser, getMessages } from '@/lib/firebase';

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
  
  // Initial message loading
  useEffect(() => {
    async function loadInitialMessages() {
      setIsLoading(true);
      try {
        const initialMessages = await getMessages();
        setMessages(initialMessages);
      } catch (error) {
        console.error("Error loading initial messages:", error);
        setIsNetworkError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialMessages();
  }, []);
  
  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToMessages((updatedMessages: Message[]) => {
      setMessages(updatedMessages);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Send a new message
  const sendNewMessage = async (text: string) => {
    if (!text.trim()) return false;
    
    if (navigator.onLine) {
      return await sendMessage(text);
    } else {
      setIsNetworkError(true);
      // Could implement offline queueing here
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
