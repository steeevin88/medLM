"use client";

import React, { useState } from 'react';
import { patientsMockData, conditionsMockData } from '../context/MockData';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User } from 'lucide-react';

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedDataAccess, setRequestedDataAccess] = useState<{[key: number]: {biologicalSex: boolean}}>({});

  const requestSexDataAccess = (patientId: number) => {
    setRequestedDataAccess(prev => ({
      ...prev,
      [patientId]: { ...prev[patientId], biologicalSex: true }
    }));
  };

  const filteredPatients = patientsMockData.filter(patient =>
    patient.anonymizedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.recentSymptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentPatient = selectedPatient !== null
    ? patientsMockData.find(p => p.id === selectedPatient)
    : null;

  const suggestedConditions = currentPatient
    ? conditionsMockData.filter(condition =>
        condition.symptoms.some(symptom =>
          currentPatient.recentSymptoms.some(patientSymptom =>
            patientSymptom.toLowerCase().includes(symptom.toLowerCase())
          )
        )
      )
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Patient List Card */}
      <Card className="md:col-span-1 flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="p-4">
          <CardTitle className="text-xl mb-2">Anonymous Patients</CardTitle>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by ID or symptoms..."
              className="w-full pr-10 text-black"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1 space-y-3 p-4 pt-0">
          {filteredPatients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No patients match your search.</p>
          ) : (
            filteredPatients.map(patient => (
              <Card
                key={patient.id}
                className={`cursor-pointer transition-colors ${selectedPatient === patient.id ? 'border-primary bg-muted' : 'hover:bg-accent'}`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium mb-1">ID: {patient.anonymizedId}</h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.age} years • <Badge variant="outline" className="select-none cursor-not-allowed">data protected</Badge>
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {patient.pendingTests.length} pending tests
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted-foreground uppercase font-medium mb-1.5">Recent Symptoms:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.recentSymptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Patient Details Area */}
      <div className="md:col-span-2">
        {selectedPatient === null ? (
          <Card className="h-full flex flex-col items-center justify-center p-8">
            <CardContent className="text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground">Select a patient to view details</h3>
              <p className="text-muted-foreground mt-2">
                Patient information is anonymized to protect privacy while providing essential medical context.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Patient Overview Card */}
            <Card>
              <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">Patient {currentPatient?.anonymizedId}</CardTitle>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Age:</span>
                        <span className="font-medium">{currentPatient?.age}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Sex:</span>
                        {requestedDataAccess[currentPatient?.id ?? 0]?.biologicalSex ? (
                          <span className="font-medium">{currentPatient?.biologicalSex}</span>
                        ) : (
                          <button
                            onClick={() => currentPatient && requestSexDataAccess(currentPatient.id)}
                            className="text-blue-600 text-sm underline font-normal hover:text-blue-800"
                          >
                            Request access
                          </button>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Last Visit:</span>
                        <span className="font-medium">{currentPatient?.lastVisit}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Request Consultation</Button>
                </div>
              </CardHeader>
            </Card>

            {/* Symptoms & Tests Cards (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reported Symptoms</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentPatient?.recentSymptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                        <svg
                          className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-800">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentPatient?.pendingTests.map((test, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                        <svg
                          className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-800">{test}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Suggested Conditions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedConditions.length === 0 ? (
                  <p className="text-muted-foreground">No conditions suggested based on current symptoms.</p>
                ) : (
                  <div className="space-y-4">
                    {suggestedConditions.map(condition => (
                      <Card key={condition.id} className="border-muted-foreground/30">
                        <CardHeader>
                          <CardTitle className="text-base">{condition.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Matching Symptoms:</h5>
                            <ul className="mt-1 text-sm space-y-2">
                              {condition.symptoms.map((symptom, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span
                                    className={
                                      currentPatient?.recentSymptoms.some(s =>
                                        s.toLowerCase().includes(symptom.toLowerCase())
                                      )
                                        ? "w-2 h-2 bg-green-500 rounded-full"
                                        : "w-2 h-2 bg-gray-300 rounded-full"
                                    }
                                  ></span>
                                  <span className="text-gray-800">{symptom}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Tests:</h5>
                            <ul className="mt-1 text-sm space-y-2">
                              {condition.relatedTests.map((test, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span
                                    className={
                                      currentPatient?.pendingTests.includes(test)
                                        ? "w-2 h-2 bg-blue-500 rounded-full"
                                        : "w-2 h-2 bg-gray-300 rounded-full"
                                    }
                                  ></span>
                                  <span className="text-gray-800">{test}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Access Request Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Protected Patient Data</CardTitle>
                <CardDescription>
                  Some patient data is protected. Request access when medically necessary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-800">Biological Sex</span>
                    </div>
                    {requestedDataAccess[currentPatient?.id ?? 0]?.biologicalSex ? (
                      <Badge variant="secondary">Access Granted</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => currentPatient && requestSexDataAccess(currentPatient.id)}
                      >
                        Request Access
                      </Button>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    {requestedDataAccess[currentPatient?.id ?? 0]?.biologicalSex ? (
                      <p className="text-gray-800">{currentPatient?.biologicalSex}</p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-500">Protected information - requires explicit access request</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Patient will be notified of your request and must consent before this information is shared.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
