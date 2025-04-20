"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertCircle, X } from 'lucide-react';
import { getReportsForDoctor, getReportById, updateReportStatus } from '@/actions/report';
import { createDataRequest } from '@/actions/dataRequest';
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
}) => {
  if (status === 'APPROVED') {
    return (
      <div className="flex items-center justify-between">
        <div className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded flex items-center">
          <span className="mr-1">✓</span> Access Granted
        </div>
      </div>
    );
  }

  if (status === 'DENIED') {
    return (
      <div className="flex items-center justify-between">
        <div className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded flex items-center">
          <span className="mr-1">✕</span> Access Denied
        </div>
        <button
          onClick={() => onRequest(reportId, field)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded cursor-pointer transition-colors"
        >
          Request Again
        </button>
      </div>
    );
  }

  return (
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
};

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
        const { reports: doctorReports } = await getReportsForDoctor(user.id);
        setReports(doctorReports);
      } catch (error) {
        console.error("Error loading reports:", error);
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
  }).sort((a, b) => {
    // First sort by status: PENDING first, REVIEWED last
    if (a.status !== b.status) {
      // If a is REVIEWED, it should come after b
      if (a.status === 'REVIEWED') return 1;
      // If b is REVIEWED, it should come after a
      if (b.status === 'REVIEWED') return -1;
      // For other status comparisons, alphabetical order
      return a.status.localeCompare(b.status);
    }

    // Then sort by date (most recent first) within the same status
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
        if (!selectedReport) return;

        const { success, dataRequest, error } = await createDataRequest(
          reportId,
          user?.id || '',
          selectedReport.patientId,
          field
        );

        if (!success || error) {
          throw new Error(error || 'Failed to create data request');
        }

        console.log(`Access requested for ${field} in report ${reportId}`);
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

  const getFieldRequestStatus = (reportId: string, field: string) => {
    return accessRequestStatus[reportId]?.[field] || null;
  };

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

  // Handler to toggle a report's status between REVIEWED and PENDING
  const toggleReportStatus = async (e: React.MouseEvent, report: any) => {
    e.stopPropagation(); // Prevent card click event

    if (report.status !== 'REVIEWED') return;

    try {
      const { success, report: updatedReport, error } = await updateReportStatus(report.id, 'PENDING');

      if (success && updatedReport) {
        // Update in reports array
        const updatedReports = reports.map(r =>
          r.id === report.id ? updatedReport : r
        );
        setReports(updatedReports);

        // Update selected report if it's the same one
        if (selectedReport && selectedReport.id === report.id) {
          setSelectedReport(updatedReport);
        }
      } else {
        // Fallback update if API call succeeds but doesn't return data
        const updatedReports = reports.map(r =>
          r.id === report.id ? {...r, status: 'PENDING'} : r
        );
        setReports(updatedReports);

        if (selectedReport && selectedReport.id === report.id) {
          setSelectedReport({...selectedReport, status: 'PENDING'});
        }
      }
    } catch (error) {
      console.error("Error updating report status:", error);
    }
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
                className={selectedReportId === report.id
                  ? "cursor-pointer transition-colors border-primary bg-muted"
                  : report.status === "REVIEWED"
                    ? "cursor-pointer transition-colors bg-gray-300 hover:bg-zinc-300"
                    : "cursor-pointer transition-colors hover:bg-accent"
                }
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
                    <Badge
                      variant={report.status === 'PENDING'
                        ? 'secondary'
                        : report.status === 'REVIEWED'
                          ? 'outline'
                          : 'default'
                      }
                      className={report.status === 'REVIEWED' ? 'cursor-pointer hover:bg-gray-200' : ''}
                      onClick={report.status === 'REVIEWED' ? (e) => toggleReportStatus(e, report) : undefined}
                    >
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
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[1400px] h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {selectedReport && (
            <>
              <DialogHeader className="px-6 pt-4 bg-gray-50 border-b sticky top-0 z-10 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <DialogTitle className="text-2xl font-semibold">Report #{selectedReport.id}</DialogTitle>
                    <DialogDescription className="flex flex-wrap items-center gap-3 mt-1">
                      Submitted on {new Date(selectedReport.createdAt).toLocaleDateString()} •
                      <Badge
                        variant={selectedReport.status === 'PENDING' ? 'secondary' : 'default'}
                        className={selectedReport.status === 'REVIEWED' ? 'cursor-pointer hover:bg-gray-200' : ''}
                        onClick={selectedReport.status === 'REVIEWED' ? (e) => toggleReportStatus(e, selectedReport) : undefined}
                      >
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

              <div className="overflow-auto flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-full">
                  {/* Left side - Report content */}
                  <div className="p-6 border-b md:border-b-0 md:border-r">
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown components={MarkdownComponents}>
                        {selectedReport.body}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Right side - Patient information */}
                  <div className="p-6">
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
