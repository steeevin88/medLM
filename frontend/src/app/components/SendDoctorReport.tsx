"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getDoctors } from "@/actions/doctor";
import { sendDoctorReport } from "@/actions/report";
import { toast } from "sonner";

type Step = "compose" | "select-doctor";

interface Doctor {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  specialization?: string | null;
  hospital?: string | null;
  email?: string | null;
}

export default function SendDoctorReport() {
  const [reportBody, setReportBody] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("compose");
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Check for a draft report in localStorage when component mounts
  useEffect(() => {
    if (!draftLoaded && typeof window !== 'undefined') {
      const draftReport = localStorage.getItem('medlm_report_draft');
      if (draftReport) {
        setReportBody(draftReport);
        localStorage.removeItem('medlm_report_draft'); // Remove after loading
      }
      setDraftLoaded(true);
    }
  }, [draftLoaded]);

  const handleContinue = () => {
    if (!reportBody.trim()) {
      toast.error("Please enter a report before continuing");
      return;
    }

    setCurrentStep("select-doctor");
  };

  const renderComposeStep = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send Doctor Report</CardTitle>
        <CardDescription>
          {draftLoaded && reportBody ?
            "I've prepared a report based on our conversation. You can edit it before sending to a doctor." :
            "Compose a detailed report to send to your doctor. You can use Markdown formatting."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter your report here using Markdown formatting..."
          className="min-h-[300px] font-mono"
          value={reportBody}
          onChange={(e) => setReportBody(e.target.value)}
        />
        <div className="mt-2 text-sm text-muted-foreground">
          <p>Markdown tips:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Bold text** for bold</li>
            <li>*Italic text* for italic</li>
            <li>- Item for bullet lists</li>
            <li>## Heading for headings</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setReportBody("")}>Clear</Button>
        <Button onClick={handleContinue}>Continue to Select Doctor</Button>
      </CardFooter>
    </Card>
  );

  const handleDoctorSelect = async (doctorId: string) => {
    try {
      const result = await sendDoctorReport({
        reportBody,
        doctorId,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send report");
      }

      toast.success("Report sent successfully!");
      setReportBody("");
      setCurrentStep("compose");
    } catch (error) {
      console.error("Error sending report:", error);
      toast.error("There was an error sending your report. Please try again.");
    }
  };

  const renderSelectDoctorStep = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select a Doctor</CardTitle>
        <CardDescription>
          Choose a doctor to send your report to
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DoctorList onSelect={handleDoctorSelect} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("compose")}>Back to Edit</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="max-w-3xl mx-auto py-6">
      {currentStep === "compose" ? renderComposeStep() : renderSelectDoctorStep()}
    </div>
  );
}

function DoctorList({ onSelect }: { onSelect: (doctorId: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getDoctors();

        if (result.error) {
          setError(result.error);
        } else {
          setDoctors(result.doctors as Doctor[]);
        }
      } catch (err) {
        console.error("Error loading doctors:", err);
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading available doctors...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <p className="text-sm">Please try again later or contact support.</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No doctors available at the moment.</p>
        <p className="text-sm">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {doctors.map(doctor => (
        <Card key={doctor.id} className="hover:bg-accent cursor-pointer" onClick={() => onSelect(doctor.id)}>
          <CardContent className="py-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium">{doctor.firstName} {doctor.lastName}</h3>
              <p className="text-sm text-muted-foreground">
                {doctor.specialization || "General Medicine"}
                {doctor.hospital && ` • ${doctor.hospital}`}
              </p>
            </div>
            <Button size="sm">Select</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
