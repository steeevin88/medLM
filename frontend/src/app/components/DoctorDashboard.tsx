"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertCircle, X } from 'lucide-react';
import { getReportsForDoctor, getReportById, updateReportStatus } from '@/actions/user';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

// mock data b/c backend is empty rn
const mockReports = [
  {
    id: '507f1f77bcf86cd799439011',
    body: "# Patient Report\n\nThe patient has been experiencing **severe headaches** for the past 2 weeks, along with nausea and sensitivity to light.\n\nThey report that pain is worse in the mornings and is not relieved by over-the-counter painkillers.\n\n## Previous Medical History\nNo history of migraines or neurological conditions.\n\n## Current Symptoms\n- Throbbing pain on one side of the head\n- Sensitivity to light and sound\n- Nausea and occasional vomiting\n- Visual disturbances before headache onset\n\n## Current Medications\n- Acetaminophen (ineffective for current symptoms)\n- Multivitamin daily",
    createdAt: new Date(),
    status: 'PENDING',
    obfuscatedUser: {
      id: '507f1f77bcf86cd799439012',
      age: 34,
      sex: true,
      activityLevel: 'MEDIUM',
      allergies: ['POLLEN'],
      healthIssues: ['HIGH_BLOOD_PRESSURE'],
      diet: ['MEDITERRANEAN']
    }
  },
  {
    id: '507f1f77bcf86cd799439013',
    body: "# Urgent Review Needed\n\nPatient reports **chest pain** that radiates to the left arm, accompanied by shortness of breath.\n\nThese symptoms began yesterday after physical exertion and have not subsided.\n\n## Vitals\n- BP: 145/95\n- Heart rate: 92 bpm\n- Oxygen saturation: 94%\n\n## Risk Factors\n- Family history of heart disease\n- Sedentary lifestyle\n- Poor diet high in processed foods\n- Recent increase in work stress\n\n## Recent Changes\nPatient reports increased work hours and decreased sleep over the past month.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'PENDING',
    obfuscatedUser: {
      id: '507f1f77bcf86cd799439014',
      age: 56,
      sex: true,
      activityLevel: 'LOW',
      allergies: [],
      healthIssues: ['DIABETES', 'HEART_DISEASE'],
      diet: ['LOW_CARB']
    }
  },
  {
    id: '507f1f77bcf86cd799439015',
    body: "# Follow-up Report\n\nPatient is 2 weeks post-surgery and reports good healing of the incision site.\n\nHowever, they've noticed increased swelling in the evenings and mild pain when walking long distances.\n\n## Current Medications\n- Acetaminophen as needed\n- Daily multivitamin\n- Antibiotic course (completed)\n\n## Wound Site\n- No redness or discharge\n- Mild swelling at end of day\n- Sutures intact with good approximation\n\n## Activity Level\nGradually increasing daily steps as tolerated, but experiencing fatigue by evening.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'PENDING',
    obfuscatedUser: {
      id: '507f1f77bcf86cd799439016',
      age: 45,
      sex: false,
      activityLevel: 'MEDIUM',
      allergies: ['ANTIBIOTICS'],
      healthIssues: [],
      diet: ['REGULAR']
    }
  },
  {
    id: '507f1f77bcf86cd799439017',
    body: "# Chronic Pain Evaluation\n\nPatient reports **ongoing lower back pain** that has persisted for 8+ months with gradually increasing intensity.\n\nPain is described as dull and constant with occasional sharp flares, particularly after prolonged sitting or standing.\n\n## Pain Management Attempts\n- Physical therapy (minimal relief)\n- Over-the-counter NSAIDs (moderate temporary relief)\n- Heat therapy (some relief)\n- Massage therapy (temporary relief)\n\n## Impact on Daily Life\n- Difficulty sleeping due to pain\n- Reduced ability to exercise\n- Problems sitting at work for extended periods\n- Affecting mood and overall quality of life\n\n## Imaging History\nNo recent imaging studies have been conducted.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'PENDING',
    obfuscatedUser: {
      id: '507f1f77bcf86cd799439018',
      // Intentionally omitted fields
      age: null, // Omitted age
      sex: undefined, // Omitted sex
      activityLevel: 'HIGH',
      allergies: ['NSAIDS', 'SHELLFISH'],
      healthIssues: ['ANXIETY', 'HYPERTENSION'],
      diet: [] // No diet info provided
    }
  },
  {
    id: '507f1f77bcf86cd799439019',
    body: "# Skin Condition Consultation\n\nPatient presents with a **persistent rash** on both arms and upper chest that developed approximately 3 weeks ago.\n\nThe rash is described as itchy, red, and slightly raised with small bumps.\n\n## Aggravating Factors\n- Heat and humidity worsen symptoms\n- Certain fabrics (specifically synthetic materials) increase itchiness\n- Stress appears to trigger flare-ups\n\n## Attempted Treatments\n- OTC hydrocortisone cream (minimal effect)\n- Cold compresses (temporary relief from itching)\n- Antihistamines (slight improvement)\n\n## Environmental Changes\n- Recently moved to a new apartment\n- Changed laundry detergent 1 month ago\n- New workplace with different ventilation system\n\n## Previous Dermatological History\nNo previous skin conditions other than occasional mild acne.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'PENDING',
    obfuscatedUser: {
      id: '507f1f77bcf86cd799439020',
      age: 29,
      sex: false,
      activityLevel: null, // Omitted activity level
      allergies: [], // Empty allergies
      healthIssues: null, // Omitted health issues
      diet: null // Omitted diet information
    }
  },
  {
    id: '507f1f77bcf86cd799439021',
    body: "# Sleep Disorder Assessment\n\nPatient reports **chronic insomnia** with both sleep initiation and maintenance difficulties for the past 6 months.\n\nTypically takes 1-2 hours to fall asleep and wakes 3-4 times throughout the night, often staying awake for 30+ minutes.\n\n## Sleep Hygiene Assessment\n- Regular sleep/wake schedule attempted but difficult to maintain\n- Bedroom is dark and cool\n- No screen time 1 hour before bed\n- No caffeine after noon\n\n## Daytime Symptoms\n- Excessive daytime fatigue\n- Difficulty concentrating at work\n- Irritability and mood changes\n- Occasional headaches\n\n## Previous Interventions\n- Melatonin supplements (limited effect)\n- Sleep meditation apps (somewhat helpful for initial sleep)\n- White noise machine (helps with staying asleep)\n\n## Relevant Psychosocial Factors\nReports high job stress and recent divorce proceedings contributing to nighttime rumination.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: 'REVIEWED',
    obfuscatedUser: {
      id: '507f1f77bcf86cd799439022',
      age: null, // Omitted age
      sex: null, // Omitted sex
      activityLevel: null, // Omitted activity level
      allergies: null, // Omitted allergies
      healthIssues: ['DEPRESSION', 'ANXIETY', 'INSOMNIA'],
      diet: [] // Empty diet info
    }
  }
];

// OmittedDataField component for consistent rendering
const OmittedDataField = ({
  reportId,
  field,
  onRequest,
  status
}: {
  reportId: string;
  field: string;
  onRequest: (reportId: string, field: string) => void;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | null;
}) => (
  <div className="flex items-center justify-between">
    <div className="bg-black text-white px-2 py-1 text-xs rounded">DATA OMITTED</div>
    <button
      onClick={() => onRequest(reportId, field)}
      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded cursor-pointer transition-colors"
      disabled={status === 'PENDING'}
    >
      {status === 'PENDING' ? 'Request Sent' : 'Request Access'}
    </button>
  </div>
);

export default function DoctorDashboard() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedDataAccess, setRequestedDataAccess] = useState<{[key: string]: {[field: string]: boolean}}>({});
  const [accessRequestStatus, setAccessRequestStatus] = useState<{[key: string]: {[field: string]: 'PENDING' | 'APPROVED' | 'DENIED' | null}}>({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadReports() {
      if (!isUserLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const { reports: doctorReports, error } = await getReportsForDoctor(user.id);

        if (error || !doctorReports || doctorReports.length === 0) {
          // Fallback to mock data if no reports or error
          setReports(mockReports);
        } else {
          setReports(doctorReports);
        }
      } catch (error) {
        console.error("Error loading reports:", error);
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    }

    if (isUserLoaded) {
      loadReports();
    }
  }, [isUserLoaded, user]);

  const filteredReports = reports.filter(report => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      report.body.toLowerCase().includes(lowerSearchQuery) ||
      report.id.toLowerCase().includes(lowerSearchQuery) ||
      (report.obfuscatedUser?.healthIssues?.some((issue: string) =>
        issue.toLowerCase().includes(lowerSearchQuery)
      ))
    );
  });

  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReport(null);
      setModalOpen(false);
      return;
    }

    async function getReport() {
      const reportId = selectedReportId!;

      try {
        const { report, error } = await getReportById(reportId);

        if (error || !report) {
          const mockReport = reports.find(r => r.id === reportId);
          setSelectedReport(mockReport || null);
        } else {
          setSelectedReport(report);
        }

        setModalOpen(true);
      } catch (error) {
        console.error("Error loading report:", error);
        const fallbackReport = reports.find(r => r.id === reportId);
        setSelectedReport(fallbackReport || null);

        if (fallbackReport) {
          setModalOpen(true);
        }
      }
    }

    getReport();
  }, [selectedReportId, reports]);

  const requestFieldAccess = (reportId: string, field: string) => {
    setRequestedDataAccess(prev => ({
      ...prev,
      [reportId]: { ...(prev[reportId] || {}), [field]: true }
    }));

    setAccessRequestStatus(prev => ({
      ...prev,
      [reportId]: { ...(prev[reportId] || {}), [field]: 'PENDING' }
    }));

    const sendAccessRequest = async () => {
      try {
        // TODO: request logic
        setTimeout(() => {
          console.log(`Access requested for ${field} in report ${reportId}`);
        }, 500);

      } catch (error) {
        console.error("Error requesting access:", error);
        setAccessRequestStatus(prev => ({
          ...prev,
          [reportId]: { ...(prev[reportId] || {}), [field]: null }
        }));
      }
    };

    sendAccessRequest();
  };

  const hasAccessToField = (reportId: string, field: string) => {
    return requestedDataAccess[reportId]?.[field] || false;
  };

  const getFieldRequestStatus = (reportId: string, field: string) => {
    return accessRequestStatus[reportId]?.[field] || null;
  };

  // Check if field is omitted (null, undefined, or empty array)
  const isFieldOmitted = (value: any) => {
    return value === null ||
           value === undefined ||
           (Array.isArray(value) && value.length === 0);
  };

  const MarkdownComponents = {
    h1: (props: any) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: (props: any) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: (props: any) => <h3 className="text-lg font-medium my-2" {...props} />,
    p: (props: any) => <p className="my-2" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-5 my-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-5 my-2" {...props} />,
    li: (props: any) => <li className="ml-2 my-1" {...props} />,
    strong: (props: any) => <strong className="font-bold" {...props} />,
    em: (props: any) => <em className="italic" {...props} />
  };

  return (
    <div className="mt-6">
      {/* Reports List Card */}
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="p-4">
          <CardTitle className="text-xl mb-2">Anonymous Reports</CardTitle>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search reports..."
              className="w-full pr-10 text-black"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1 space-y-3 p-4 pt-0">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2 mb-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-5/6" />
              </Card>
            ))
          ) : filteredReports.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No reports match your search.</p>
          ) : (
            filteredReports.map(report => (
              <Card
                key={report.id}
                className={`cursor-pointer transition-colors ${selectedReportId === report.id ? 'border-primary bg-muted' : 'hover:bg-accent'}`}
                onClick={() => setSelectedReportId(report.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium mb-1">Report #{report.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Patient Age: {report.obfuscatedUser?.age !== null && report.obfuscatedUser?.age !== undefined
                          ? report.obfuscatedUser.age
                          : <Badge variant="outline" className="text-xs">omitted</Badge>}
                      </p>
                      <p className="text-sm text-muted-foreground">Created: {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={report.status === 'PENDING' ? 'secondary' : report.status === 'REVIEWED' ? 'outline' : 'default'}>
                      {report.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted-foreground uppercase font-medium mb-1.5">Health Issues:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {report.obfuscatedUser?.healthIssues?.length > 0 ?
                        report.obfuscatedUser.healthIssues.map((issue: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {issue.replace(/_/g, ' ').toLowerCase()}
                          </Badge>
                        )) :
                        <span className="text-sm text-muted-foreground">None reported</span>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) setSelectedReportId(null);
      }}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[1400px] h-[90vh] p-0 overflow-hidden">
          {selectedReport && (
            <>
              <DialogHeader className="px-6 pt-4 bg-gray-50 border-b sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <DialogTitle className="text-2xl font-semibold">Report #{selectedReport.id}</DialogTitle>
                    <DialogDescription className="flex items-center gap-3 mt-1">
                      Submitted on {new Date(selectedReport.createdAt).toLocaleDateString()} •
                      <Badge variant={selectedReport.status === 'PENDING' ? 'secondary' : 'default'}>
                        {selectedReport.status}
                      </Badge>

                      {selectedReport.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 hover:cursor-pointer"
                          onClick={() => {
                            if (!selectedReport) return;

                            const updateStatus = async () => {
                              try {
                                const { success, report: updatedReport, error } = await updateReportStatus(selectedReport.id, 'REVIEWED');

                                if (success && updatedReport) {
                                  const updatedReports = reports.map(r =>
                                    r.id === selectedReport.id ? updatedReport : r
                                  );
                                  setReports(updatedReports);
                                  setSelectedReport(updatedReport);
                                } else {
                                  const updatedReports = reports.map(r =>
                                    r.id === selectedReport.id
                                      ? {...r, status: 'REVIEWED'}
                                      : r
                                  );
                                  setReports(updatedReports);
                                  setSelectedReport({...selectedReport, status: 'REVIEWED'});
                                }
                              } catch (error) {
                                console.error("Error updating report status:", error);
                                const updatedReports = reports.map(r =>
                                  r.id === selectedReport.id
                                    ? {...r, status: 'REVIEWED'}
                                    : r
                                );
                                setReports(updatedReports);
                                setSelectedReport({...selectedReport, status: 'REVIEWED'});
                              }
                            };

                            updateStatus();
                          }}
                        >
                          Mark as Reviewed
                        </Button>
                      )}
                    </DialogDescription>
                  </div>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

              <div className="overflow-auto h-full pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  {/* Left side - Report content */}
                  <div className="p-6 border-r">
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown components={MarkdownComponents}>
                        {selectedReport.body}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Right side - Patient information */}
                  <div className="p-6 overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                    <div className="space-y-6">
                      {/* Demographics Section */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-md border-b pb-2">Demographics</h3>

                        <div className="grid grid-cols-2 gap-y-3">
                          <div>
                            <span className="text-muted-foreground text-sm">Age:</span>
                          </div>
                          <div>
                            {isFieldOmitted(selectedReport.obfuscatedUser?.age) ? (
                              <OmittedDataField
                                reportId={selectedReport.id}
                                field="age"
                                onRequest={requestFieldAccess}
                                status={getFieldRequestStatus(selectedReport.id, 'age')}
                              />
                            ) : (
                              <span className="font-medium">{selectedReport.obfuscatedUser?.age}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-muted-foreground text-sm">Sex:</span>
                          </div>
                          <div>
                            {isFieldOmitted(selectedReport.obfuscatedUser?.sex) ? (
                              <OmittedDataField
                                reportId={selectedReport.id}
                                field="sex"
                                onRequest={requestFieldAccess}
                                status={getFieldRequestStatus(selectedReport.id, 'sex')}
                              />
                            ) : (
                              <span className="font-medium">
                                {selectedReport.obfuscatedUser?.sex === true ? 'Male' :
                                selectedReport.obfuscatedUser?.sex === false ? 'Female' : 'Other'}
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-muted-foreground text-sm">Activity Level:</span>
                          </div>
                          <div>
                            {isFieldOmitted(selectedReport.obfuscatedUser?.activityLevel) ? (
                              <OmittedDataField
                                reportId={selectedReport.id}
                                field="activityLevel"
                                onRequest={requestFieldAccess}
                                status={getFieldRequestStatus(selectedReport.id, 'activityLevel')}
                              />
                            ) : (
                              <span className="font-medium">{selectedReport.obfuscatedUser?.activityLevel}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Health Data Section */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-md border-b pb-2">Health Profile</h3>

                        <div>
                          <h4 className="text-sm text-muted-foreground mb-1">Health Issues:</h4>
                          {isFieldOmitted(selectedReport.obfuscatedUser?.healthIssues) ? (
                            <OmittedDataField
                              reportId={selectedReport.id}
                              field="healthIssues"
                              onRequest={requestFieldAccess}
                              status={getFieldRequestStatus(selectedReport.id, 'healthIssues')}
                            />
                          ) : (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {selectedReport.obfuscatedUser.healthIssues.map((issue: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-red-50">
                                  {issue.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <h4 className="text-sm text-muted-foreground mb-1">Allergies:</h4>
                          {isFieldOmitted(selectedReport.obfuscatedUser?.allergies) ? (
                            <OmittedDataField
                              reportId={selectedReport.id}
                              field="allergies"
                              onRequest={requestFieldAccess}
                              status={getFieldRequestStatus(selectedReport.id, 'allergies')}
                            />
                          ) : (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {selectedReport.obfuscatedUser.allergies.map((allergy: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-amber-50">
                                  {allergy.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <h4 className="text-sm text-muted-foreground mb-1">Diet Type:</h4>
                          {isFieldOmitted(selectedReport.obfuscatedUser?.diet) ? (
                            <OmittedDataField
                              reportId={selectedReport.id}
                              field="diet"
                              onRequest={requestFieldAccess}
                              status={getFieldRequestStatus(selectedReport.id, 'diet')}
                            />
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedReport.obfuscatedUser.diet.map((diet: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-green-50">
                                  {diet.replace(/_/g, ' ').toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Doctor Actions */}
                      <div className="pt-4 border-t">
                        <div className="flex justify-end gap-3">
                          <Button size="sm" variant="outline">
                            Message Patient
                          </Button>
                          <Button size="sm">
                            Request Consultation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
