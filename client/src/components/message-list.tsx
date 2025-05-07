import { useEffect, useRef, useState } from "react";
import MessageItem from "./message-item";
import { Message } from "@/hooks/use-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { groupMessagesByDate } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: string;
}

export default function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  
  // Update the visible messages whenever we get new messages
  useEffect(() => {
    console.log("Messages updated in MessageList component:", messages);
    
    // Ensure all messages have IDs and valid properties
    const processedMessages = messages.map(msg => ({
      ...msg,
      id: msg.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userName: msg.userName || 'Unknown',
      userInitials: msg.userInitials || 'U'
    }));
    
    setVisibleMessages(processedMessages);
  }, [messages]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (visibleMessages.length > 0) {
      console.log("Scrolling to bottom due to new messages");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleMessages]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(visibleMessages);
  
  console.log("Grouped messages:", groupedMessages);
  
  return (
    <div className="flex-1 overflow-y-auto py-4 messages-container">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-32 my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading messages...</p>
        </div>
      ) : visibleMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 my-8">
          <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {groupedMessages.map(group => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex justify-center mb-4">
                <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                  {group.date}
                </div>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-4">
                {group.messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={message.userId === currentUserId}
                  />
                ))}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
