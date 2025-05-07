import { useState, FormEvent } from "react";
import { Send, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/firebase";

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<boolean>;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    setIsSending(true);
    try {
      const success = await onSendMessage(messageText);
      
      if (success) {
        setMessageText("");
      } else {
        toast({
          title: "Error sending message",
          description: "Your message could not be sent. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Add function to test WebSocket directly
  const testWebSocketConnection = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log("Testing WebSocket connection to:", wsUrl);
      
      const testSocket = new WebSocket(wsUrl);
      
      testSocket.onopen = () => {
        console.log("Test WebSocket connected successfully");
        const user = getCurrentUser();
        
        // Send registration
        testSocket.send(JSON.stringify({
          type: 'register',
          userId: user.userId,
          username: user.name
        }));
        
        // Send a test message
        setTimeout(() => {
          testSocket.send(JSON.stringify({
            type: 'message',
            userId: user.userId,
            username: user.name,
            userInitials: user.initials,
            text: "Test message from direct WebSocket at " + new Date().toLocaleTimeString()
          }));
          console.log("Test message sent via WebSocket");
          
          // Close after sending
          setTimeout(() => {
            testSocket.close();
            console.log("Test WebSocket closed");
          }, 1000);
        }, 500);
      };
      
      testSocket.onerror = (error) => {
        console.error("Test WebSocket error:", error);
        toast({
          title: "WebSocket Error",
          description: "Could not connect to WebSocket server.",
          variant: "destructive"
        });
      };
    } catch (error) {
      console.error("Error testing WebSocket:", error);
    }
  };
  
  // Add function to test REST API
  const testRestAPI = async () => {
    try {
      console.log("Testing REST API by fetching messages");
      const response = await fetch('/api/messages');
      console.log("REST API response:", response);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Messages from REST API:", data);
        toast({
          title: "REST API Test",
          description: `Received ${data.length} messages from server.`,
        });
      } else {
        console.error("REST API error:", response.statusText);
        toast({
          title: "REST API Error",
          description: `Status: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error testing REST API:", error);
      toast({
        title: "REST API Error",
        description: "Failed to connect to server API.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sticky bottom-0">
      <div className="flex items-center justify-end mb-2 space-x-2">
        <Button 
          type="button" 
          size="sm"
          variant="outline"
          onClick={testWebSocketConnection}
          className="text-xs"
        >
          Test WebSocket
        </Button>
        <Button 
          type="button" 
          size="sm"
          variant="outline"
          onClick={testRestAPI}
          className="text-xs"
        >
          Test REST API
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSending}
          />
        </div>
        
        <Button 
          type="submit" 
          size="icon"
          disabled={isSending || !messageText.trim()}
          className="rounded-full h-10 w-10 bg-primary text-white hover:bg-primary/90"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
