import React from 'react';
import { DataRequest } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataRequests: (DataRequest & { doctor: any; report: any })[];
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

function RequestCard({ request }: { request: DataRequest & { doctor: any; report: any } }) {
  console.log(request);
  return (
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
    </Card>
  );
}
