"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, User, CornerDownLeft } from "lucide-react";

type Message = {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

export default function PatientChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      content: "Hello! I'm your MedLM assistant. How can I help you with your health questions today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I understand your concern. Based on your symptoms, it could be several things. Have you noticed any other symptoms?",
        "Thank you for sharing. Let me ask you a few more questions to better understand your situation.",
        "I appreciate you providing that information. It's important to consult with a healthcare professional for a proper diagnosis.",
        "That's helpful to know. Your symptoms might be related to a common condition, but a doctor should evaluate you to be sure.",
        "I see. Can you tell me more about when these symptoms started and if anything makes them better or worse?"
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const newAiMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="px-4 py-3 border-b flex flex-row items-center gap-3 bg-muted/40 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold">MedLM Assistant</h2>
          <p className="text-xs text-muted-foreground">AI-powered health support</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {message.sender === 'ai' ? (
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
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  } rounded-lg p-3 break-words`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
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
      <CardFooter className="p-3 border-t flex-shrink-0 flex flex-col">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={isTyping || inputMessage.trim() === ''}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex w-full mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> Press Enter to send
          </span>
        </div>
      </CardFooter>
    </Card>
  );
} 