import { useChat } from "@/hooks/use-chat";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import NetworkStatus from "./network-status";

export default function ChatContainer() {
  const { messages, isLoading, isNetworkError, currentUser, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ChatHeader currentUser={currentUser} />
      
      {isNetworkError && <NetworkStatus />}
      
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          currentUserId={currentUser.userId} 
        />
        
        <MessageInput onSendMessage={sendMessage} />
      </main>
    </div>
  );
}
