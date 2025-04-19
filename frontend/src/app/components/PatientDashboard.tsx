"use client";

import React, { useState } from 'react';
import { doctorsMockData, conditionsMockData } from '../context/MockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, SendHorizontal, Loader2, Search, User, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PatientDashboard() {
  const [selectedCondition, setSelectedCondition] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [userSymptoms, setUserSymptoms] = useState<string[]>([
    'Headache',
    'Dizziness'
  ]);

  // Chat and symptom description states
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'medlm' | 'doctor';
    message: string;
    timestamp: string;
  }>>([
    {
      id: 1,
      sender: 'medlm',
      message: "Hello! Please describe how you're feeling in detail so I can better understand your symptoms.",
      timestamp: 'Just now'
    }
  ]);
  const [isSendingToDoctor, setIsSendingToDoctor] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  // Add privacy control states
  const [sharingPreferences, setSharingPreferences] = useState({
    anonymousMode: true,
    shareMedicalHistory: false,
    shareForResearch: true,
    shareBiologicalSex: false
  });
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, type: 'biologicalSex', from: 'Dr. Sarah Johnson', requestDate: 'Just now' }
  ]);

  const addSymptom = () => {
    if (symptomInput.trim() && !userSymptoms.includes(symptomInput.trim())) {
      setUserSymptoms([...userSymptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setUserSymptoms(userSymptoms.filter(s => s !== symptom));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSymptom();
    }
  };

  // const handleSharingChange = (setting: keyof typeof sharingPreferences) => {
  //   setSharingPreferences(prev => ({
  //     ...prev,
  //     [setting]: !prev[setting]
  //   }));
  // };

  const handleApproveRequest = (requestId: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    // In a real app, you would also update the doctor's permissions on the backend
  };

  const handleDenyRequest = (requestId: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  // Chat handler functions
  const sendMessage = () => {
    if (!symptomsDescription.trim()) return;

    // Add user message
    const newUserMessage = {
      id: chatMessages.length + 1,
      sender: 'user' as const,
      message: symptomsDescription,
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setSymptomsDescription('');

    // Simulate MedLM AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        sender: 'medlm' as const,
        message: `Thank you for sharing. Based on your description, I've noted symptoms like ${userSymptoms.join(', ')}. Is there anything else you'd like to add about how you're feeling?`,
        timestamp: 'Just now'
      };

      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendToDoctor = (doctorId: number) => {
    setIsSendingToDoctor(true);
    setSelectedDoctor(doctorId);

    // Simulate sending to doctor
    setTimeout(() => {
      const doctorName = doctorsMockData.find(d => d.id === doctorId)?.name || 'the doctor';

      const confirmationMessage = {
        id: chatMessages.length + 1,
        sender: 'medlm' as const,
        message: `Your symptom information has been securely sent to ${doctorName}. They will review it and respond soon.`,
        timestamp: 'Just now'
      };

      setChatMessages(prev => [...prev, confirmationMessage]);
      setIsSendingToDoctor(false);

      // Simulate doctor response after a delay
      setTimeout(() => {
        const doctorResponse = {
          id: chatMessages.length + 2,
          sender: 'doctor' as const,
          message: `Hello, this is ${doctorName}. I've reviewed your symptoms. Based on what you've described, I recommend scheduling a video consultation to discuss treatment options.`,
          timestamp: 'Just now'
        };

        setChatMessages(prev => [...prev, doctorResponse]);
      }, 3000);
    }, 1500);
  };

  const filteredDoctors = doctorsMockData.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchedConditions = conditionsMockData.filter(condition =>
    condition.symptoms.some(symptom =>
      userSymptoms.some(userSymptom =>
        userSymptom.toLowerCase().includes(symptom.toLowerCase())
      )
    )
  );

  const currentCondition = selectedCondition !== null
    ? conditionsMockData.find(c => c.id === selectedCondition)
    : null;

  // Helper function to render stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {/* Half star logic can be added here if needed */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" /> // Use gray for empty
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
      {/* Left Sidebar - Symptoms & Privacy */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Add a symptom..."
                className="flex-1 text-black"
                value={symptomInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSymptomInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={addSymptom} size="sm">Add</Button>
            </div>
            <div className="space-y-2">
              {userSymptoms.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No symptoms added yet.</p>
              ) : (
                userSymptoms.map((symptom, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span className="text-black">{symptom}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeSymptom(symptom)} className="h-6 w-6 text-destructive hover:text-destructive/80">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="anonymous-mode" className="flex flex-col space-y-1">
                <span>Anonymous Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Hide personal information from doctors.
                </span>
              </Label>
              <Switch
                id="anonymous-mode"
                checked={sharingPreferences.anonymousMode}
                onCheckedChange={(checked: boolean) => setSharingPreferences(prev => ({...prev, anonymousMode: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
               <Label htmlFor="share-history" className="flex flex-col space-y-1">
                <span>Share Medical History</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Allow doctors to view past conditions.
                </span>
              </Label>
              <Switch
                id="share-history"
                checked={sharingPreferences.shareMedicalHistory}
                onCheckedChange={(checked: boolean) => setSharingPreferences(prev => ({...prev, shareMedicalHistory: checked}))}
              />
            </div>
             <div className="flex items-center justify-between">
               <Label htmlFor="share-research" className="flex flex-col space-y-1">
                <span>Data for Research</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Allow anonymous data for medical research.
                </span>
              </Label>
              <Switch
                id="share-research"
                checked={sharingPreferences.shareForResearch}
                onCheckedChange={(checked: boolean) => setSharingPreferences(prev => ({...prev, shareForResearch: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
               <Label htmlFor="share-sex" className="flex flex-col space-y-1">
                <span>Share Biological Sex</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Show biological sex to all doctors.
                </span>
              </Label>
              <Switch
                id="share-sex"
                checked={sharingPreferences.shareBiologicalSex}
                onCheckedChange={(checked: boolean) => setSharingPreferences(prev => ({...prev, shareBiologicalSex: checked}))}
              />
            </div>
          </CardContent>
        </Card>

        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>Data Access Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <svg
                      className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-800">{request.from} requests access to your {request.type === 'biologicalSex' ? 'biological sex' : request.type} information</h3>
                      <p className="text-sm text-gray-600 mt-1">Requested {request.requestDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-3">
                     <Button variant="outline" size="sm" onClick={() => handleDenyRequest(request.id)}>
                        Deny
                      </Button>
                      <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                        Approve
                      </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Center Column - Chat & Analysis */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">MedLM Assistant</h2>
                <p className="text-xs text-gray-500">Describe your symptoms in detail</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              AI-Powered
            </span>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {message.sender !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-2">
                    {message.sender === 'medlm' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                        <path fillRule="evenodd" d="M9 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 019 3zm1.5 1.5a.75.75 0 011.5 0v6.75a.75.75 0 01-1.5 0V4.5z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}

                <div className="max-w-[75%]">
                  {message.sender !== 'user' && (
                    <div className="text-xs font-medium text-gray-500 mb-1 ml-1">
                      {message.sender === 'medlm' ? 'MedLM Assistant' : 'Dr. Johnson'}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 inline-block ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : message.sender === 'medlm'
                          ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                          : 'bg-green-100 text-gray-800 rounded-tl-none border border-green-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 ml-1">
                    {message.timestamp}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-4 border-t">
            <div className="relative w-full">
              <Textarea
                placeholder="Type your symptoms and health concerns..."
                className="w-full p-3 pr-14 resize-none h-20 text-black"
                value={symptomsDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSymptomsDescription(e.target.value)}
                onKeyDown={handleChatKeyDown}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!symptomsDescription.trim()}
                className="absolute right-3 bottom-3 h-8 w-8"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <CardTitle>AI Analysis</CardTitle>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              Powered by MedLM
            </span>
          </CardHeader>
          <CardContent>
            {userSymptoms.length === 0 ? (
             <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1}/>
                <h3 className="text-lg font-medium text-gray-700">Add symptoms to get started</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Our AI will analyze your symptoms and suggest potential conditions while maintaining your privacy.
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-gray-700">
                  Based on your symptoms, here are some potential conditions to discuss with a healthcare provider:
                </p>

                <div className="space-y-3 mb-6">
                  {matchedConditions.map(condition => (
                    <Card
                     key={condition.id}
                     className={`mb-3 cursor-pointer transition-colors ${selectedCondition === condition.id ? 'border-primary bg-muted' : 'hover:bg-accent'}`}
                     onClick={() => setSelectedCondition(condition.id)}
                   >
                     <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800">{condition.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {condition.symptoms.filter(symptom =>
                              userSymptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
                            ).length} matching symptoms
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Click to learn more about this condition
                        </p>
                     </CardContent>
                   </Card>
                  ))}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-yellow-500 mt-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-800">Medical Disclaimer</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        This is not a diagnosis. Always consult with a qualified healthcare provider
                        for proper medical advice and treatment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Condition Details or Doctor List */}
      <div className="lg:col-span-1 space-y-6">
        {selectedCondition !== null ? (
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <CardTitle>{currentCondition?.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCondition(null)} className="h-6 w-6 text-muted-foreground">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <h3 className="font-medium text-gray-800 mb-3">Common Symptoms</h3>
                 <ul className="space-y-2">
                   {currentCondition?.symptoms.map((symptom, idx) => (
                     <li key={idx} className="flex items-center gap-2 text-sm">
                       <span
                         className={
                           userSymptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
                             ? "w-2 h-2 bg-green-500 rounded-full"
                             : "w-2 h-2 bg-gray-300 rounded-full"
                         }
                       ></span>
                       {symptom}
                       {userSymptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase())) && (
                         <span className="text-xs text-green-600">(you reported this)</span>
                       )}
                     </li>
                   ))}
                 </ul>
               </div>

               <div>
                 <h3 className="font-medium text-gray-800 mb-3">Common Treatments</h3>
                 <ul className="space-y-2">
                   {currentCondition?.commonTreatments.map((treatment, idx) => (
                     <li key={idx} className="flex items-center gap-2 text-sm">
                       <svg
                         className="w-4 h-4 text-blue-500"
                         xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 20 20"
                         fill="currentColor"
                       >
                         <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                           clipRule="evenodd"
                         />
                       </svg>
                       {treatment}
                     </li>
                   ))}
                 </ul>
               </div>

               <div>
                 <h3 className="font-medium text-gray-800 mb-3">Recommended Tests</h3>
                 <div className="flex flex-wrap gap-2">
                   {currentCondition?.relatedTests.map((test, idx) => (
                     <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                       {test}
                     </span>
                   ))}
                 </div>
               </div>
            </CardContent>
            <CardFooter className="mt-6 pt-6 border-t">
                <Button className="w-full">Connect with a specialist</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
                <CardTitle>Find a Specialist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="Search specialists..."
                  className="w-full pr-10 text-black"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {filteredDoctors.map(doctor => (
                  <Card key={doctor.id} className="hover:border-primary transition-colors overflow-hidden">
                    <CardContent className="p-4">
                       <div className="flex items-center gap-4 mb-3">
                         <Avatar>
                            <AvatarFallback>
                              <User className="h-5 w-5 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                         <div className="flex-1">
                           <h3 className="font-medium text-foreground">{doctor.name}</h3>
                           <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            {renderStars(doctor.rating)}
                         </div>
                       </div>
                       <div className="border-t pt-3">
                         <div className="text-xs text-muted-foreground mb-2">
                           {doctor.availableSlots} available slots • {doctor.yearsExperience} yrs exp.
                         </div>
                         <div className="flex flex-col space-y-2">
                           <Button
                             variant="outline"
                             onClick={() => sendToDoctor(doctor.id)}
                             disabled={isSendingToDoctor}
                             className="flex-1"
                           >
                              {isSendingToDoctor && selectedDoctor === doctor.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {isSendingToDoctor && selectedDoctor === doctor.id ? 'Sending...' : 'Send Symptoms'}
                           </Button>
                           <Button className="flex-1">Book Consult</Button>
                       </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
