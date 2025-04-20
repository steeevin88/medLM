"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertCircle } from 'lucide-react';
import { getReportsForDoctor, getReportById, updateReportStatus } from '@/actions/user';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

// mock data b/c backend is empty rn
const mockReports = [
  {
    id: '507f1f77bcf86cd799439011',
    body: "# Patient Report\n\nThe patient has been experiencing **severe headaches** for the past 2 weeks, along with nausea and sensitivity to light.\n\nThey report that pain is worse in the mornings and is not relieved by over-the-counter painkillers.\n\n## Previous Medical History\nNo history of migraines or neurological conditions.",
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
    body: "# Urgent Review Needed\n\nPatient reports **chest pain** that radiates to the left arm, accompanied by shortness of breath.\n\nThese symptoms began yesterday after physical exertion and have not subsided.\n\n## Vitals\n- BP: 145/95\n- Heart rate: 92 bpm\n- Oxygen saturation: 94%",
    createdAt: new Date(),
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
    body: "# Follow-up Report\n\nPatient is 2 weeks post-surgery and reports good healing of the incision site.\n\nHowever, they've noticed increased swelling in the evenings and mild pain when walking long distances.\n\n## Current Medications\n- Acetaminophen as needed\n- Daily multivitamin",
    createdAt: new Date(),
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
  }
];

export default function DoctorDashboard() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestedDataAccess, setRequestedDataAccess] = useState<{[key: string]: {[field: string]: boolean}}>({});

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
      return;
    }

    async function getReport() {
      const reportId = selectedReportId!;

      try {
        const { report, error } = await getReportById(reportId);

        if (error || !report) {
          // Fall back to finding in mock data
          const mockReport = reports.find(r => r.id === reportId);
          setSelectedReport(mockReport || null);
        } else {
          setSelectedReport(report);
        }
      } catch (error) {
        console.error("Error loading report:", error);
        // Fallback to finding in reports array
        const fallbackReport = reports.find(r => r.id === reportId);
        setSelectedReport(fallbackReport || null);
      }
    }

    getReport();
  }, [selectedReportId, reports]);

  // Request access to protected field
  const requestFieldAccess = (reportId: string, field: string) => {
    setRequestedDataAccess(prev => ({
      ...prev,
      [reportId]: { ...(prev[reportId] || {}), [field]: true }
    }));
  };

  // Determine if a field has access requested
  const hasAccessToField = (reportId: string, field: string) => {
    return requestedDataAccess[reportId]?.[field] || false;
  };

  // Format health issues for display
  const formatHealthIssues = (issues: string[] | undefined) => {
    if (!issues || issues.length === 0) return "None reported";
    return issues.map(issue =>
      issue.split('_').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' ')
    ).join(', ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Reports List Card */}
      <Card className="md:col-span-1 flex flex-col h-[calc(100vh-12rem)]">
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
                        Patient Age: {report.obfuscatedUser?.age || <Badge variant="outline" className="text-xs">unknown</Badge>}
                      </p>
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

      {/* Report Details Area */}
      <div className="md:col-span-2">
        {selectedReportId === null ? (
          <Card className="h-full flex flex-col items-center justify-center p-8">
            <CardContent className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground">Select a report to view details</h3>
              <p className="text-muted-foreground mt-2">
                Patient information is anonymized to protect privacy while providing essential medical context.
              </p>
            </CardContent>
          </Card>
        ) : !selectedReport ? (
          <Card className="h-full flex flex-col items-center justify-center p-8">
            <CardContent className="text-center">
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Report Status Banner */}
            {selectedReport.status === 'PENDING' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-yellow-700">Pending Review</p>
                  <p className="text-yellow-600 text-sm">This report requires your attention.</p>
                </div>
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    if (!selectedReport) return;

                    // Try to update via the API
                    const updateStatus = async () => {
                      try {
                        const { success, report: updatedReport, error } = await updateReportStatus(selectedReport.id, 'REVIEWED');

                        if (success && updatedReport) {
                          // Update the reports list with the updated report
                          const updatedReports = reports.map(r =>
                            r.id === selectedReport.id ? updatedReport : r
                          );
                          setReports(updatedReports);
                          setSelectedReport(updatedReport);
                        } else {
                          // Fallback to just updating state locally if API fails
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
                        // Fallback to local update
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
              </div>
            )}

            {/* Patient Overview Card */}
            <Card>
              <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">Report #{selectedReport.id}</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(selectedReport.createdAt).toLocaleDateString()} • Status: {selectedReport.status}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Age:</span>
                        <span className="font-medium">{selectedReport.obfuscatedUser?.age ?? 'Data protected'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Sex:</span>
                        {hasAccessToField(selectedReport.id, 'sex') || selectedReport.obfuscatedUser?.sex !== undefined ? (
                          <span className="font-medium">
                            {selectedReport.obfuscatedUser?.sex === true ? 'Male' :
                             selectedReport.obfuscatedUser?.sex === false ? 'Female' : 'Other'}
                          </span>
                        ) : (
                          <button
                            onClick={() => requestFieldAccess(selectedReport.id, 'sex')}
                            className="text-blue-600 text-sm underline font-normal hover:text-blue-800"
                          >
                            Request access
                          </button>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Activity Level:</span>
                        <span className="font-medium">
                          {selectedReport.obfuscatedUser?.activityLevel ?
                            selectedReport.obfuscatedUser.activityLevel : 'Data protected'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Request Consultation</Button>
                </div>
              </CardHeader>
            </Card>

            {/* Report Content Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Content</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <ReactMarkdown>{selectedReport.body}</ReactMarkdown>
              </CardContent>
            </Card>

            {/* Health Data Cards (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedReport.obfuscatedUser?.healthIssues?.length ? (
                    <p className="text-muted-foreground">No health issues reported.</p>
                  ) : (
                    <ul className="space-y-3">
                      {selectedReport.obfuscatedUser.healthIssues.map((issue: string, idx: number) => (
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
                          <span className="text-gray-800">
                            {issue.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allergies</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedReport.obfuscatedUser?.allergies?.length ? (
                    <p className="text-muted-foreground">No allergies reported.</p>
                  ) : (
                    <ul className="space-y-3">
                      {selectedReport.obfuscatedUser.allergies.map((allergy: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-md">
                          <svg
                            className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
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
                          <span className="text-gray-800">
                            {allergy.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Diet & Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lifestyle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="font-medium mb-2">Diet Type</h5>
                    {selectedReport.obfuscatedUser?.diet?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.obfuscatedUser.diet.map((diet: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {diet.replace(/_/g, ' ').toLowerCase()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No diet information available</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="font-medium mb-2">Activity Level</h5>
                    <p>
                      {selectedReport.obfuscatedUser?.activityLevel ?
                        selectedReport.obfuscatedUser.activityLevel : 'Data protected'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
