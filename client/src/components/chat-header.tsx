import { MessageSquare } from "lucide-react";

interface ChatHeaderProps {
  currentUser: {
    name: string;
    initials: string;
  };
}

export default function ChatHeader({ currentUser }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-2xl font-bold text-gray-800">FireChat</h1>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">{currentUser.name}</span>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {currentUser.initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
