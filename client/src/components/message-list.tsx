import { useEffect, useRef } from "react";
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
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);
  
  return (
    <div className="flex-1 overflow-y-auto py-4 messages-container">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-32 my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading messages...</p>
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
