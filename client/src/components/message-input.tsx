import { useState, FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sticky bottom-0">
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
