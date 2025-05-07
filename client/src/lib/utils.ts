import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message } from "@/hooks/use-chat";
import { format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageDate(timestamp: number | null): string {
  if (!timestamp) return "Just now";
  
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
}

interface MessageGroup {
  date: string;
  messages: Message[];
}

export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  const groups: Record<string, Message[]> = {};
  
  messages.forEach(message => {
    const dateStr = formatMessageDate(message.timestamp);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(message);
  });
  
  return Object.keys(groups).map(date => ({
    date,
    messages: groups[date]
  }));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}
