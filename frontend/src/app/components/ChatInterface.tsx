"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";

// Define chat message type
export interface ChatMessage {
  id: number;
  sender: 'doctor' | 'patient' | 'ai';
  senderName: string;
  message: string;
  timestamp: string;
}

interface UserInfo {
  imageUrl: string;
  fullName: string;
  initials: string;
}

interface ChatInterfaceProps {
  chatId: number | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  headerInfo?: {
    title: string;
    subtitle?: string;
    badges?: Array<{
      text: string;
      variant?: "default" | "secondary" | "destructive" | "outline";
    }>;
  };
  userInfo?: UserInfo;
}

export default function ChatInterface({
  chatId,
  messages,
  onSendMessage,
  onBack,
  isReadOnly = false,
  headerInfo,
  userInfo
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (chatId) {
      setTimeout(scrollToBottom, 100); // Small delay to ensure DOM is updated
    }
  }, [messages, chatId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || isReadOnly) return;
    
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const getSenderAvatar = (sender: string, name: string) => {
    switch(sender) {
      case 'doctor':
        return (
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-800">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        );
      case 'patient':
        if (userInfo) {
          return (
            <Avatar>
              <AvatarImage src={userInfo.imageUrl} alt={userInfo.fullName} />
              <AvatarFallback className="bg-gray-100 text-gray-800">{userInfo.initials}</AvatarFallback>
            </Avatar>
          );
        } else {
          return (
            <Avatar>
              <AvatarFallback className="bg-gray-100 text-gray-800">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          );
        }
      case 'ai':
        return (
          <Avatar>
            <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
          </Avatar>
        );
      default:
        return (
          <Avatar>
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {headerInfo && (
        <CardHeader className="pb-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              {headerInfo.title && <span className="font-medium">{headerInfo.title}</span>}
              {headerInfo.subtitle && <Badge variant="outline">{headerInfo.subtitle}</Badge>}
              {headerInfo.badges?.map((badge, index) => (
                <Badge key={index} variant={badge.variant}>{badge.text}</Badge>
              ))}
            </div>
          </div>
        </CardHeader>
      )}
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={scrollAreaRef} 
          className="flex-1 px-4 py-2 overflow-y-auto"
        >
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'patient' && (
                  <div className="flex-shrink-0">
                    {getSenderAvatar(msg.sender, msg.senderName)}
                  </div>
                )}
                <div className={`flex flex-col max-w-[75%] ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 ${msg.sender === 'patient' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="font-medium text-sm">{msg.senderName}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <div className={`rounded-lg p-3 mt-1 ${
                    msg.sender === 'doctor' ? 'bg-blue-50 rounded-tl-none' :
                    msg.sender === 'ai' ? 'bg-purple-50 rounded-tl-none' : 
                    'bg-blue-500 text-white rounded-tr-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
                {msg.sender === 'patient' && (
                  <div className="flex-shrink-0">
                    {getSenderAvatar(msg.sender, msg.senderName)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {!isReadOnly ? (
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="gap-1">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <p className="text-sm text-gray-500 text-center">
              This conversation is read-only.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 