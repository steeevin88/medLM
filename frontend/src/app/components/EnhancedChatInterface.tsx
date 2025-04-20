"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, Bot, Archive, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Message } from "@prisma/client";
import { saveMessage, createChat, deleteChat, archiveChat } from "@/lib/chatActions";
import { Skeleton } from "@/components/ui/skeleton";

type ChatMessage = {
  id: string;
  content: string;
  isAI: boolean;
  createdAt: Date;
};

type EnhancedChatInterfaceProps = {
  chatId?: string;
  initialMessages?: ChatMessage[];
  isMockMode?: boolean;
};

export default function EnhancedChatInterface({ 
  chatId, 
  initialMessages = [],
  isMockMode = false
}: EnhancedChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper for getting AI responses - in a real app, this would call an actual AI service
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Mock response generation - in a real app this would be a call to an AI model API
    const responses = [
      "I understand your health concerns. Based on what you've described, I recommend consulting with a healthcare professional who can provide a proper diagnosis.",
      "Thanks for sharing that information. Your symptoms could be related to several conditions. It might be helpful to track when they occur and their severity.",
      "I appreciate you trusting me with your health information. While I can provide general information, remember that only a doctor can give you personalized medical advice.",
      "Based on the symptoms you've mentioned, it would be beneficial to speak with a specialist who can conduct appropriate tests and provide a diagnosis.",
      "I understand this may be concerning. Many people experience similar symptoms, which can have various causes ranging from minor to more serious conditions."
    ];
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to the UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(), // Temporary ID
      content: input,
      isAI: false,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let currentChatId = chatId;
      
      if (isMockMode) {
        // Mock mode - don't save to database, just simulate response
        setTimeout(async () => {
          const aiResponse = await getAIResponse(userMessage.content);
          
          const aiMessage: ChatMessage = {
            id: Date.now().toString(),
            content: aiResponse,
            isAI: true,
            createdAt: new Date(),
          };
          
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
        }, 1000);
        
        return;
      }
      
      // If no chatId, create new chat
      if (!currentChatId) {
        try {
          const newChat = await createChat(input);
          currentChatId = newChat.id;
          
          // Redirect to the new chat page
          router.push(`/dashboard/chats/${currentChatId}`);
        } catch (error) {
          console.error("Failed to create chat:", error);
          // If database operation fails, continue in mock mode
          setIsLoading(false);
          return;
        }
      } else {
        // Save user message to database
        try {
          await saveMessage({
            chatId: currentChatId,
            content: input,
            isAI: false
          });
        } catch (error) {
          console.error("Failed to save message:", error);
        }
      }

      // Get AI response
      try {
        const aiResponse = await getAIResponse(input);
        
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          content: aiResponse,
          isAI: true,
          createdAt: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        // Save AI message to database if we have a chat ID
        if (currentChatId) {
          await saveMessage({
            chatId: currentChatId,
            content: aiResponse,
            isAI: true
          });
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in chat flow:", error);
      setIsLoading(false);
    }
  }

  const handleDeleteChat = async () => {
    if (!chatId || isMockMode) return;
    
    setIsDeleting(true);
    try {
      await deleteChat(chatId);
      router.push('/dashboard/chats');
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveChat = async () => {
    if (!chatId || isMockMode) return;
    
    setIsArchiving(true);
    try {
      await archiveChat(chatId);
      router.push('/dashboard/chats');
    } catch (error) {
      console.error("Error archiving chat:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="px-4 py-3 border-b flex justify-between items-center bg-muted/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">MedLM Assistant</CardTitle>
            <p className="text-xs text-muted-foreground">AI-powered health support</p>
          </div>
        </div>
        {chatId && !isMockMode && (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleArchiveChat}
              disabled={isArchiving}
              className="h-8 w-8"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteChat}
              disabled={isDeleting}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 py-12">
              <div className="text-center">
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <p>Start a conversation with MedLM Connect</p>
                <p className="text-sm text-muted-foreground mt-2">Ask about symptoms, conditions, or health advice</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] ${
                    message.isAI ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {message.isAI ? (
                    <Avatar className="h-8 w-8 bg-blue-100 flex-shrink-0">
                      <AvatarFallback className="text-blue-600 text-xs">AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8 bg-gray-100 flex-shrink-0">
                      <AvatarFallback className="text-gray-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`space-y-1 ${
                      message.isAI
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    } rounded-lg p-3 break-words`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 text-right">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <Avatar className="h-8 w-8 bg-blue-100 flex-shrink-0">
                  <AvatarFallback className="text-blue-600 text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t flex-shrink-0">
        <form onSubmit={handleSubmit} className="w-full space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none min-h-[80px]"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Shift + Enter for new line
            </span>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="gap-2"
            >
              <span>Send</span>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
} 