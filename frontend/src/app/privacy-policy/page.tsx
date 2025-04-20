import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Introduction</h2>
        <p className="text-gray-700 mb-4">
          At MedLM Connect, we prioritize the privacy and security of your medical information. 
          This Privacy Policy outlines how we collect, use, disclose, and protect your personal health information.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">HIPAA Compliance</h2>
        <p className="text-gray-700 mb-4">
          We are fully committed to complying with the Health Insurance Portability and Accountability Act (HIPAA). 
          All protected health information (PHI) is handled in accordance with HIPAA regulations, ensuring:
        </p>
        <ul className="list-disc pl-8 mb-4 text-gray-700 space-y-2">
          <li>Strict access controls to sensitive health information</li>
          <li>End-to-end encryption of all health data</li>
          <li>Regular security audits and compliance assessments</li>
          <li>Staff training on privacy and security procedures</li>
          <li>Breach notification protocols in the unlikely event of a data breach</li>
        </ul>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <p className="text-blue-700 font-medium">HIPAA Compliance Certification</p>
          <p className="text-blue-600 text-sm">
            MedLM Connect maintains HIPAA compliance certification through regular third-party audits and assessments.
            Our last certification was renewed on April 1, 2023.
          </p>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We collect information you provide directly to us, including:
        </p>
        <ul className="list-disc pl-8 mb-4 text-gray-700 space-y-2">
          <li>Personal identifiers (name, email, date of birth)</li>
          <li>Medical history and information</li>
          <li>Symptoms and health concerns</li>
          <li>Communication preferences</li>
          <li>Device and usage information</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          Your information is used only for the following purposes:
        </p>
        <ul className="list-disc pl-8 mb-4 text-gray-700 space-y-2">
          <li>Providing anonymous doctor-patient consultations</li>
          <li>Generating AI-powered health insights</li>
          <li>Improving our services and user experience</li>
          <li>Research purposes (only with anonymized data)</li>
          <li>Compliance with legal obligations</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Rights</h2>
        <p className="text-gray-700 mb-4">
          Under HIPAA and other privacy regulations, you have the right to:
        </p>
        <ul className="list-disc pl-8 mb-4 text-gray-700 space-y-2">
          <li>Access your personal health information</li>
          <li>Request corrections to your data</li>
          <li>Obtain an accounting of disclosures</li>
          <li>Request restrictions on certain uses and disclosures</li>
          <li>Receive a copy of your data in an electronic format</li>
          <li>File a complaint if you believe your privacy rights have been violated</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have questions about our privacy practices or would like to exercise your rights, please contact our Privacy Officer at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700">Email: privacy@medlmconnect.com</p>
          <p className="text-gray-700">Phone: (555) 123-4567</p>
          <p className="text-gray-700">Address: 123 Health Avenue, Medical District, CA 90210</p>
        </div>
      </section>
      
      <div className="text-sm text-gray-500 border-t pt-4">
        Last updated: April 15, 2023
      </div>
    </div>
  );
} 