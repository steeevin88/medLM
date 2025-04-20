"use client";

import { useState } from "react";
import { Button } from "./button";
import { generateDummyChats, DummyDataResult } from "@/lib/generateDummyData";
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { toast } from "./use-toast";

export function GenerateDummyDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DummyDataResult | null>(null);

  const handleGenerateData = async () => {
    setIsLoading(true);
    try {
      const result = await generateDummyChats();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `Created ${result.chatsCreated} chats with ${result.messagesCreated} messages.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate dummy data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating dummy data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleGenerateData}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {isLoading
              ? "Generating..."
              : result?.success
              ? "Generate More Data"
              : "Generate Test Data"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create sample chats with messages for testing</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function GenerateDataStatus({ result }: { result: DummyDataResult | null }) {
  if (!result) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
      {result.success ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>Generated {result.chatsCreated} chats with {result.messagesCreated} messages</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4" />
          <span>{result.error || "Failed to generate data"}</span>
        </>
      )}
    </div>
  );
} 