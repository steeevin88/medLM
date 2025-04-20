import EnhancedChatInterface from "@/app/components/EnhancedChatInterface";

export default function NewChatPage() {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-6rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">New Conversation</h1>
      <div className="flex-1">
        <EnhancedChatInterface 
          isMockMode={true}
          initialMessages={[
            {
              id: "welcome",
              content: "Hello! I'm your MedLM health assistant. How can I help you today?",
              isAI: true,
              createdAt: new Date()
            }
          ]}
        />
      </div>
    </div>
  );
} 