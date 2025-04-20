"use client";

import EnhancedChatInterface from "@/app/components/EnhancedChatInterface";
import { Button } from "@/components/ui/button";
import { getChat } from "@/lib/chatActions";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any>(null);
  
  useEffect(() => {
    async function loadChat() {
      try {
        setLoading(true);
        const data = await getChat(chatId);
        setChatData(data);
      } catch (err) {
        console.error("Error loading chat:", err);
        setError("Failed to load chat. The chat may not exist or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    }
    
    loadChat();
  }, [chatId]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/chats">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1">
          <div className="h-full border rounded-md flex flex-col">
            <div className="h-14 border-b px-4 flex items-center">
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    <Skeleton className={`h-10 w-48 ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4">
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6 h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/chats">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chat not found</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="bg-red-100 rounded-full p-4 mx-auto w-fit">
              <Bot className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-medium">Unable to load chat</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/dashboard/chats">Go back to chats</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Format messages for the chat interface
  const formattedMessages = chatData.messages.map((message: any) => ({
    id: message.id,
    content: message.content,
    isAI: message.isAI,
    createdAt: new Date(message.createdAt)
  }));
  
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/chats">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold truncate">
          {chatData.title || "Untitled Chat"}
        </h1>
      </div>
      <div className="flex-1">
        <EnhancedChatInterface
          chatId={chatId}
          initialMessages={formattedMessages}
        />
      </div>
    </div>
  );
} 