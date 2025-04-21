import React, { useState, useEffect } from 'react';
import { DataRequest } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { getPatientFieldValue, updateDataRequestStatus } from '@/actions/user';
import { toast } from "sonner";

interface Doctor {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

interface Report {
  id: string;
  body: string;
  createdAt: string | Date;
  status: string;
}

interface RequestWithRelations extends DataRequest {
  doctor: Doctor;
  report: Report;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataRequests: RequestWithRelations[];
}

export function NotificationModal({
  isOpen,
  onClose,
  dataRequests
}: NotificationModalProps) {
  const pendingRequests = dataRequests.filter(req => req.status === 'PENDING');
  const completedRequests = dataRequests.filter(req => req.status !== 'PENDING');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Data Access Requests</DialogTitle>
          <DialogDescription>
            Doctors requesting access to your health information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedRequests.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {completedRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="max-h-[50vh] overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No pending requests</p>
              ) : (
                <div className="space-y-3 py-2">
                  {pendingRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="max-h-[50vh] overflow-y-auto">
              {completedRequests.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No completed requests</p>
              ) : (
                <div className="space-y-3 py-2">
                  {completedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function RequestCard({ request }: { request: RequestWithRelations }) {
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [fieldValue, setFieldValue] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get the requested field value when the modal opens
  useEffect(() => {
    if (approvalModalOpen) {
      setIsLoading(true);
      getPatientFieldValue(request.patientId, request.field)
        .then((result) => {
          if (result.success) {
            setFieldValue(result.value);
          } else {
            setFieldValue(null);
            toast.error("Error fetching data", {
              description: result.error,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching patient data:", error);
          setFieldValue(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [approvalModalOpen, request.patientId, request.field]);

  // Check if the field has a value
  const hasValue = fieldValue !== undefined && fieldValue !== null;

  function handleApprove() {
    setApprovalModalOpen(true);
  }

  function handleDeny() {
    setIsUpdating(true);
    updateDataRequestStatus(request.id, 'DENIED')
      .then((result) => {
        if (result.success) {
          toast.success("Request denied", {
            description: "The data request has been denied.",
          });
          // Force refresh to update the UI
          window.location.reload();
        } else {
          toast.error("Error", {
            description: result.error || "Failed to deny request",
          });
        }
      })
      .catch((error) => {
        console.error("Error denying request:", error);
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }

  function confirmApproval() {
    setIsUpdating(true);
    updateDataRequestStatus(request.id, 'APPROVED')
      .then((result) => {
        if (result.success) {
          toast.success("Request approved", {
            description: "The data has been shared with the doctor.",
          });
          setApprovalModalOpen(false);
          // Force refresh to update the UI
          window.location.reload();
        } else {
          toast.error("Error", {
            description: result.error || "Failed to approve request",
          });
        }
      })
      .catch((error) => {
        console.error("Error approving request:", error);
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }

  function renderFieldValue() {
    if (!fieldValue) return null;

    if (Array.isArray(fieldValue)) {
      return (
        <ul className="list-disc list-inside">
          {fieldValue.length > 0 ? (
            fieldValue.map((value, index) => (
              <li key={index} className="text-sm">{value}</li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">No items</li>
          )}
        </ul>
      );
    }

    // Handle boolean values for sex field specifically
    if (typeof fieldValue === 'boolean' && request.field === 'sex') {
      return <p className="text-sm">{fieldValue ? 'Male' : 'Female'}</p>;
    }

    // Handle other boolean values
    if (typeof fieldValue === 'boolean') {
      return <p className="text-sm">{fieldValue ? 'Yes' : 'No'}</p>;
    }

    // Default for strings, numbers, etc.
    return <p className="text-sm">{String(fieldValue)}</p>;
  }

  return (
    <>
      <Card className="p-3 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium text-sm">
              Dr. {request.doctor.lastName || 'Unknown Doctor'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Requested: {format(new Date(request.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <Badge
            variant={
              request.status === 'PENDING' ? 'outline' :
              request.status === 'APPROVED' ? 'default' : 'destructive'
            }
            className="text-xs"
          >
            {request.status}
          </Badge>
        </div>
        <p className="text-sm mt-1">
          Requesting access to your <span className="font-semibold">{request.field}</span> data
        </p>
        {request.report && (
          <p className="text-xs text-muted-foreground mt-1">
            For report: {request.report.id || 'Untitled Report'}
          </p>
        )}

        {request.status === 'PENDING' && (
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeny}
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : "Deny"}
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isUpdating}
            >
              {isUpdating ? "Processing..." : "Approve"}
            </Button>
          </div>
        )}
      </Card>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Data Access</DialogTitle>
            <DialogDescription>
              You&apos;re about to share your {request.field} information with Dr. {request.doctor.lastName || 'Unknown'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : hasValue ? (
              <div className="border rounded-md p-3">
                <h4 className="text-sm font-medium mb-2">Your {request.field} data:</h4>
                {renderFieldValue()}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Information</AlertTitle>
                <AlertDescription>
                  You don&apos;t have any {request.field} information stored.{" "}
                  <Link href="/patient/health-profile" className="underline font-medium">
                    Update your health profile
                  </Link>{" "}
                  to add this information.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              disabled={!hasValue || isUpdating || isLoading}
            >
              {isUpdating ? "Processing..." : "Confirm Sharing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
