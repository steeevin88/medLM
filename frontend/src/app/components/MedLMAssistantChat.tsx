"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import ChatInterface, { ChatMessage } from "./ChatInterface";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

export default function MedLMAssistantChat() {
  const { user } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSendToDoctorPrompt, setShowSendToDoctorPrompt] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: "Hello! I'm your MedLM assistant. How can I help with your health questions today?",
        timestamp: getCurrentTime(),
      }]);
    }
  }, [messages.length]);

  // Check if we should show the Send to Doctor prompt
  useEffect(() => {
    // Only suggest sending to doctor if there are at least 3 messages (including the welcome message)
    // and at least 2 are from the user, and they're discussing health concerns
    if (messages.length >= 4) {
      const userMessages = messages.filter(m => m.sender === 'patient');
      if (userMessages.length >= 2) {
        // Check if health keywords are present in the last few messages
        const lastMessages = messages.slice(-4);
        const healthKeywords = ['pain', 'hurt', 'symptoms', 'feel', 'sick', 'headache', 'stomach', 'fever', 'cough'];

        const containsHealthKeywords = lastMessages.some(m =>
          healthKeywords.some(keyword =>
            m.message.toLowerCase().includes(keyword)
          )
        );

        setShowSendToDoctorPrompt(containsHealthKeywords);
      }
    }
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'patient',
      senderName: user?.fullName || 'Patient',
      message,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Format messages for the API
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.sender === 'patient' ? 'user' : 'assistant',
        content: msg.message
      }));

      // Send to our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: data.response,
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToDoctor = async () => {
    // When the user clicks the "Send to Doctor" button,
    // we'll send a special request to generate a clean report
    setIsLoading(true);

    // Add a transition message to show we're switching to report generation mode
    const transitionMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'ai',
      senderName: 'MedLM Assistant',
      message: "🔄 **Switching to Report Generation Mode**\n\nI'll now create a professional medical report based on our conversation that you can share with your doctor.",
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, transitionMessage]);

    try {
      // Get all messages for context (excluding the transition message)
      const apiMessages = messages.map(msg => ({
        role: msg.sender === 'patient' ? 'user' : 'assistant',
        content: msg.message
      }));

      // Add a report generation message
      const reportingMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: "✏️ **Generating your medical report...**",
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, reportingMessage]);

      // Send to our API endpoint with a special flag to run the report cleaner
      const response = await fetch('/api/chat/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user?.id,
          cleanReport: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get report from AI');
      }

      const data = await response.json();

      // Show the generated report to the user
      const reportCompleteMessage: ChatMessage = {
        id: messages.length + 3,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: `✅ **Report Generated Successfully**\n\nI've prepared a professional medical report based on our conversation:\n\n${data.report}\n\n**Ready to send to your doctor?** Click "Continue" to proceed.`,
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, reportCompleteMessage]);

      // Store the cleaned report content in localStorage
      localStorage.setItem('medlm_report_draft', data.report);

      // Show a confirmation button instead of automatically redirecting
      setShowReportConfirmation(true);
    } catch (error) {
      console.error('Error generating report:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: messages.length + 3,
        sender: 'ai',
        senderName: 'MedLM Assistant',
        message: "❌ **Error Generating Report**\n\nI apologize, but I encountered an issue while creating your report. Let's try a simpler approach.",
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, errorMessage]);

      // Generate a simple report as fallback
      const reportContent = generateReport();
      localStorage.setItem('medlm_report_draft', reportContent);

      // Show the confirmation button
      setShowReportConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSendToDoctor = () => {
    // Navigate to the send doctor report page
    router.push('/patient?tab=doctor-report');

    // Hide the confirmation
    setShowReportConfirmation(false);
  };

  const generateReport = () => {
    const userMessages = messages.filter(m => m.sender === 'patient');
    const aiMessages = messages.filter(m => m.sender === 'ai');

    // Trigger report generation by adding a specific message to the conversation
    const reportRequest = "Please generate a medical report that I can send to my doctor based on our conversation.";

    // Call the API to generate a report
    handleSendMessage(reportRequest);

    // Fallback for no AI messages
    if (aiMessages.length === 0) {
      let report = `# Patient Report\n\n`;
      report += `## Patient Concerns\n\n`;

      // Add user messages
      userMessages.forEach(msg => {
        report += `- ${msg.message}\n`;
      });

      return report;
    }

    // Return most recent AI message as a placeholder until the report is generated
    return aiMessages[aiMessages.length - 1].message;
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return firstInitial + lastInitial || user.username?.[0] || "?";
  };

  const renderMarkdownMessage = (message: string) => {
    return (
      <div className="prose prose-sm max-w-none prose-headings:my-4 prose-h2:text-lg prose-h3:text-base prose-p:my-3 prose-ul:my-3 prose-li:my-1">
        <ReactMarkdown
          components={{
            h2: ({ node, ...props }) => <h2 className="font-bold text-lg mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="font-semibold text-base mt-5 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-3" {...props} />,
            ul: ({ node, ...props }) => <ul className="my-3 pl-5 list-disc" {...props} />,
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            hr: ({ node, ...props }) => <hr className="my-4 border-gray-300" {...props} />
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {showSendToDoctorPrompt && !showReportConfirmation && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="py-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-blue-800">Would you like to send this to a doctor?</h3>
              <p className="text-sm text-blue-600">
                I can prepare a report based on our conversation for a medical professional.
              </p>
            </div>
            <Button onClick={handleSendToDoctor} className="bg-blue-600 hover:bg-blue-700">
              Send to Doctor
            </Button>
          </CardContent>
        </Card>
      )}

      {showReportConfirmation && (
        <Card className="mb-4 bg-green-50 border-green-200">
          <CardContent className="py-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-green-800">Report is ready to send!</h3>
              <p className="text-sm text-green-600">
                Your medical report has been prepared and is ready to send to a doctor.
              </p>
            </div>
            <Button onClick={handleConfirmSendToDoctor} className="bg-green-600 hover:bg-green-700">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex-grow overflow-hidden">
        <ChatInterface
          chatId={1}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          headerInfo={{
            title: "MedLM Assistant",
            subtitle: "AI-powered health support"
          }}
          userInfo={{
            imageUrl: user?.imageUrl || "/avatar-placeholder.png",
            fullName: user?.fullName || user?.username || "User",
            initials: getUserInitials()
          }}
          renderMessage={renderMarkdownMessage}
        />
      </div>
    </div>
  );
}
