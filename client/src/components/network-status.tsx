import { AlertCircle } from "lucide-react";

export default function NetworkStatus() {
  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center">
      <div className="flex items-center justify-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <p className="font-medium">You're offline. Messages will be sent when you reconnect.</p>
      </div>
    </div>
  );
}
