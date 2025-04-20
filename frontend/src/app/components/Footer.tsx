import React from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">MedLM Connect</h3>
            <p className="text-gray-600 text-sm">
              Connecting patients and doctors anonymously with privacy-first healthcare.
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-2">
                HIPAA Compliant
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                256-bit Encryption
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-gray-600 text-sm hover:text-blue-600 transition">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-600 text-sm hover:text-blue-600 transition">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-600 text-sm hover:text-blue-600 transition">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="bg-blue-50 rounded-md p-3 mb-4 border border-blue-100">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm font-medium">HIPAA Compliance Notice</p>
                <p className="text-blue-700 text-xs mt-1">
                  MedLM Connect complies with all HIPAA regulations for the protection of personal health information. 
                  Our platform employs best-in-class security measures to protect your medical data.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} MedLM Connect. All rights reserved. Medical information provided is for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 