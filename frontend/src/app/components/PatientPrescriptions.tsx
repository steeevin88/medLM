"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, RefreshCcw, PlusCircle, MessageSquare, AlertTriangle, Info } from "lucide-react";

const prescriptionData = [
  {
    id: 1,
    name: "Hydrocodone/Acetaminophen",
    brand: "Vicodin",
    dosage: "5mg/325mg",
    frequency: "1 tablet every 4-6 hours as needed for pain",
    prescribedBy: "Dr. Sarah Johnson",
    dateIssued: "May 15, 2023",
    endDate: "May 29, 2023",
    refillsRemaining: 0,
    status: "expired",
    instructions: "Take with food. Do not exceed 6 tablets in 24 hours.",
    type: "pain",
    comparison: {
      avgDosage: "5-10mg 4-6 times daily",
      isBelow: true,
      notes: "Your prescription is at the lower end of the typical dosage range."
    },
    warnings: [
      "May cause drowsiness or dizziness",
      "Do not drive or operate machinery",
      "Do not consume alcohol"
    ]
  },
  {
    id: 2,
    name: "Oxycodone",
    brand: "OxyContin",
    dosage: "10mg",
    frequency: "1 tablet every 12 hours",
    prescribedBy: "Dr. James Wilson",
    dateIssued: "June 8, 2023",
    endDate: "June 22, 2023",
    refillsRemaining: 0,
    status: "expired",
    instructions: "Take as directed for severe pain. Do not crush or chew tablets.",
    type: "pain",
    comparison: {
      avgDosage: "10-20mg every 12 hours",
      isBelow: true,
      notes: "Your prescription is at the lower end of the typical dosage range for moderate to severe pain."
    },
    warnings: [
      "May be habit-forming",
      "May cause respiratory depression",
      "Do not consume alcohol"
    ]
  },
  {
    id: 3,
    name: "Tramadol",
    brand: "Ultram",
    dosage: "50mg",
    frequency: "1 tablet every 6 hours as needed for pain",
    prescribedBy: "Dr. Sarah Johnson",
    dateIssued: "July 10, 2023",
    endDate: "August 9, 2023",
    refillsRemaining: 1,
    status: "active",
    instructions: "Take with or without food. Do not exceed 400mg per day.",
    type: "pain",
    comparison: {
      avgDosage: "50-100mg every 4-6 hours (max 400mg/day)",
      isBelow: true,
      notes: "Your prescription is at the standard starting dosage for moderate pain."
    },
    warnings: [
      "May cause dizziness or drowsiness",
      "May increase risk of seizures",
      "Do not stop taking suddenly"
    ]
  }
];

export default function PatientPrescriptions() {
  const [, setActiveTab] = React.useState("current");

  const currentPrescriptions = prescriptionData.filter(p => p.status === "active");
  const expiredPrescriptions = prescriptionData.filter(p => p.status === "expired");

  const renderPrescriptionCard = (prescription: typeof prescriptionData[0]) => {
    const isPainMed = prescription.type === "pain";

    return (
      <Card key={prescription.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{prescription.name}</CardTitle>
              <CardDescription>{prescription.brand}</CardDescription>
            </div>
            <Badge
              variant={prescription.status === "active" ? "default" : "secondary"}
            >
              {prescription.status === "active" ? "Active" : "Expired"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Dosage</p>
                  <p className="text-sm">{prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Frequency</p>
                  <p className="text-sm">{prescription.frequency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Prescribed By</p>
                  <p className="text-sm">{prescription.prescribedBy}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Issued</p>
                    <div className="flex items-center text-sm gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{prescription.dateIssued}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">End Date</p>
                    <div className="flex items-center text-sm gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{prescription.endDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isPainMed && (
              <div className="bg-blue-50 p-3 rounded-md space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700">Pain Medication Comparison</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Average dosage:</p>
                    <p className="text-sm font-medium">{prescription.comparison.avgDosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 mb-1">Your prescription:</p>
                    <div className="flex items-center gap-2">
                      {prescription.comparison.isBelow ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Below Average
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Above Average
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-blue-800">{prescription.comparison.notes}</p>

                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full text-blue-700 border-blue-200 bg-blue-100 hover:bg-blue-200">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ask Doctor About This Prescription
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Instructions</p>
            <p className="text-sm">{prescription.instructions}</p>
          </div>

          {prescription.warnings && prescription.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium text-amber-700">Warnings</p>
              </div>
              <ul className="space-y-1">
                {prescription.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="block h-1.5 w-1.5 mt-1.5 rounded-full bg-amber-500" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          {prescription.status === "active" && (
            <>
              <Button variant="outline" className="gap-1.5">
                <RefreshCcw className="h-4 w-4" />
                Refill ({prescription.refillsRemaining})
              </Button>
              <Button variant="secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Doctor
              </Button>
            </>
          )}
          {prescription.status === "expired" && (
            <Button variant="outline" className="gap-1.5 w-full">
              <Clock className="h-4 w-4" />
              Request Similar Prescription
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21h6m-6 0v-3.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V21m-6 0H4a1 1 0 0 1-1-1v-3.5a6 6 0 0 1 6-6h0" />
            <path d="M20 10h-3.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H20a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1Z" />
            <path d="M9 5.5V.5" />
            <path d="M6 3h6" />
          </svg>
          Prescriptions
        </CardTitle>
        <CardDescription>
          Manage your medication prescriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Tabs defaultValue="current" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="expired">Past</TabsTrigger>
            </TabsList>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Request New</span>
            </Button>
          </div>

          <TabsContent value="current" className="space-y-4">
            {currentPrescriptions.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21h6m-6 0v-3.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V21m-6 0H4a1 1 0 0 1-1-1v-3.5a6 6 0 0 1 6-6h0" />
                      <path d="M20 10h-3.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H20a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1Z" />
                      <path d="M9 5.5V.5" />
                      <path d="M6 3h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No active prescriptions</h3>
                  <p className="text-gray-500 mb-4">
                    You don&apos;t have any active medication prescriptions.
                  </p>
                  <Button>
                    Request a Prescription
                  </Button>
                </CardContent>
              </Card>
            ) : (
              currentPrescriptions.map(renderPrescriptionCard)
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {expiredPrescriptions.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21h6m-6 0v-3.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V21m-6 0H4a1 1 0 0 1-1-1v-3.5a6 6 0 0 1 6-6h0" />
                      <path d="M20 10h-3.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2H20a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1Z" />
                      <path d="M9 5.5V.5" />
                      <path d="M6 3h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No past prescriptions</h3>
                  <p className="text-gray-500 mb-4">
                    You don&apos;t have any expired medication prescriptions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              expiredPrescriptions.map(renderPrescriptionCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
