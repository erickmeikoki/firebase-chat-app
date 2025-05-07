import { formatDistanceToNow } from "date-fns";
import { Check } from "lucide-react";
import { Message } from "@/hooks/use-chat";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageItem({ message, isOwn }: MessageItemProps) {
  // Format timestamp
  const formattedTime = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  
  return (
    <div className={`flex items-end ${isOwn ? 'justify-end' : ''}`}>
      <div className={`flex flex-col space-y-1 max-w-xs mx-2 ${isOwn ? 'order-1 items-end' : 'order-2 items-start'}`}>
        {!isOwn && (
          <div className="flex items-center mb-1">
            <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
              {message.userInitials}
            </div>
            <span className="ml-2 text-xs text-gray-500">{message.userName}</span>
          </div>
        )}
        
        <div className={`px-4 py-2 rounded-lg ${isOwn ? 'rounded-br-none bg-primary text-white' : 'rounded-bl-none bg-gray-200 text-gray-800'}`}>
          <p className="text-sm">{message.text}</p>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-gray-500 leading-none">{formattedTime}</span>
          {isOwn && (
            <Check className="h-4 w-4 text-gray-400 ml-1" aria-label="Sent" />
          )}
        </div>
      </div>
    </div>
  );
}
