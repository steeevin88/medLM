import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, HeartPulse, MessageSquare, User2 } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">MedLM Connect Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Bot className="h-12 w-12 text-blue-600 mb-2" />
            <CardTitle>Chat with MedLM</CardTitle>
            <CardDescription>
              Get AI-powered answers to your health questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ask questions about symptoms, conditions, treatments, and general health information.
              Your conversations are securely saved.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/chats">View Conversations</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <User2 className="h-12 w-12 text-green-600 mb-2" />
            <CardTitle>Patient Dashboard</CardTitle>
            <CardDescription>
              Manage your health information and track symptoms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Record symptoms, track your health metrics, and get personalized health insights
              based on your data.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/patient">Go to Patient Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <HeartPulse className="h-12 w-12 text-red-600 mb-2" />
            <CardTitle>Health Records</CardTitle>
            <CardDescription>
              View and manage your health records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access your medical history, test results, and health metrics all in one
              secure place. Share with healthcare providers when needed.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/records">View Records</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <MessageSquare className="h-12 w-12 text-purple-600 mb-2" />
            <CardTitle>Start New Chat</CardTitle>
            <CardDescription>
              Begin a fresh conversation with MedLM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start a new chat session to discuss your health concerns, 
              ask medical questions, or get information about conditions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/chats/new">New Conversation</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 