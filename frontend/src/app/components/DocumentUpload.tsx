"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpIcon, Trash2Icon, FileIcon, CheckCircleIcon } from "lucide-react";

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'processing' | 'ready' | 'error';
};

export default function DocumentUpload() {
  const [dragging, setDragging] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { 
      id: '1', 
      name: 'Blood Test Results.pdf', 
      type: 'PDF', 
      size: '1.2 MB', 
      uploadDate: '2023-11-15', 
      status: 'ready' 
    },
    { 
      id: '2', 
      name: 'Vaccination Record.jpg', 
      type: 'Image', 
      size: '850 KB', 
      uploadDate: '2023-10-22', 
      status: 'ready' 
    },
    { 
      id: '3', 
      name: 'MRI Scan.pdf', 
      type: 'PDF', 
      size: '5.4 MB', 
      uploadDate: '2023-11-28', 
      status: 'processing' 
    }
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newDocs: Document[] = Array.from(files).map((file, index) => {
      return {
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        size: formatFileSize(file.size),
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing'
      };
    });

    setDocuments([...newDocs, ...documents]);
    
    // Simulate processing completion
    setTimeout(() => {
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.status === 'processing' ? { ...doc, status: 'ready' } : doc
        )
      );
    }, 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle>Medical Documents</CardTitle>
        <CardDescription>
          Upload and manage your medical records, test results, and health documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-5">
        {/* Upload area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileUpIcon className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
          <h3 className="font-medium text-lg mb-2">Drop files here or click to upload</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Support for PDF, JPG, PNG up to 10MB
          </p>
          <div className="relative">
            <Input
              id="file-upload"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
              multiple
            />
            <Button variant="outline" type="button">
              Select Files
            </Button>
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-1">
          <h3 className="font-medium ml-1">Your Documents</h3>
          <div className="space-y-2 mt-3">
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No documents uploaded yet.
              </p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md">
                      <FileIcon className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'processing' ? (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                        Processing
                      </div>
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                      onClick={() => removeDocument(doc.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between">
        <div className="text-xs text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Manage All Documents
        </Button>
      </CardFooter>
    </Card>
  );
} 