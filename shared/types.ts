export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Message {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  userInitials: string;
  timestamp: number | null;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  networkError: boolean;
}
