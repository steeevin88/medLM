import { Suspense } from "react";
import { getUserChats } from "@/lib/chatActions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Bot, Clock, MessageSquarePlus } from "lucide-react";
import { GenerateDummyDataButton } from "@/components/ui/GenerateDummyDataButton";
import { Toaster } from "@/components/ui/toaster";

async function ChatsList() {
  const chats = await getUserChats();
  
  // Format date to readable format
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Get preview text of last message
  const getPreviewText = (content: string) => {
    if (!content) return "";
    return content.length > 70 ? `${content.substring(0, 70)}...` : content;
  };

  return (
    <div className="space-y-4">
      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
          <div className="rounded-full bg-blue-100 p-3">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">No chats yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a new conversation with MedLM to get healthcare insights
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/dashboard/chats/new">
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                New Conversation
              </Link>
            </Button>
            <GenerateDummyDataButton />
          </div>
        </div>
      ) : (
        chats.map((chat) => (
          <Link href={`/dashboard/chats/${chat.id}`} key={chat.id} className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-1">
                  {chat.title || "Untitled Chat"}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {chat.messages.length > 0 
                    ? getPreviewText(chat.messages[0].content) 
                    : "No messages yet"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 text-xs flex justify-between text-muted-foreground border-t">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(chat.updatedAt)}
                </div>
                <div>
                  {chat.isArchived && (
                    <span className="bg-muted px-2 py-0.5 rounded text-xs">Archived</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}

function ChatsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardFooter className="pt-2 text-xs border-t">
            <Skeleton className="h-3 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function ChatsPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Conversations</h1>
        <div className="flex gap-2">
          <GenerateDummyDataButton />
          <Button asChild>
            <Link href="/dashboard/chats/new">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New Chat
            </Link>
          </Button>
        </div>
      </div>
      
      <Suspense fallback={<ChatsListSkeleton />}>
        <ChatsList />
      </Suspense>
      
      <Toaster />
    </div>
  );
} 