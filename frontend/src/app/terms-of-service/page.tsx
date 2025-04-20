import React from 'react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Agreement to Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using MedLM Connect, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">HIPAA Authorization</h2>
        <p className="text-gray-700 mb-4">
          By using MedLM Connect, you authorize us to use and disclose your protected health information (PHI) in accordance with the Health Insurance Portability and Accountability Act (HIPAA) for the purposes of:
        </p>
        <ul className="list-disc pl-8 mb-4 text-gray-700 space-y-2">
          <li>Providing anonymous healthcare consultations</li>
          <li>Connecting you with appropriate medical professionals</li>
          <li>Generating AI-powered health insights</li>
          <li>Improving our services and user experience</li>
        </ul>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <p className="text-blue-700 font-medium">HIPAA Compliance Statement</p>
          <p className="text-blue-600 text-sm">
            MedLM Connect maintains all necessary safeguards to protect your PHI as required by HIPAA. We implement administrative, physical, and technical measures to ensure the confidentiality, integrity, and availability of your health information.
          </p>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Medical Disclaimer</h2>
        <p className="text-gray-700 mb-4">
          The content provided through MedLM Connect is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
        <p className="text-gray-700 mb-4">
          Our AI-powered insights are designed to assist healthcare providers and should not be used as a substitute for professional medical judgment. Healthcare providers remain solely responsible for all decisions regarding patient care.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">User Accounts</h2>
        <p className="text-gray-700 mb-4">
          When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account and password, and you agree to accept responsibility for all activities that occur under your account.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Acceptable Use</h2>
        <p className="text-gray-700 mb-4">
          You agree not to use MedLM Connect for any purpose that is unlawful or prohibited by these Terms. You may not:
        </p>
        <ul className="list-disc pl-8 mb-4 text-gray-700 space-y-2">
          <li>Impersonate any person or entity</li>
          <li>Submit false or misleading information</li>
          <li>Interfere with the proper working of the service</li>
          <li>Attempt to gain unauthorized access to the service or its systems</li>
          <li>Use the service to transmit harmful content or malware</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          To the maximum extent permitted by law, MedLM Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Changes to Terms</h2>
        <p className="text-gray-700 mb-4">
          We reserve the right to modify these terms at any time. We will provide notice of any material changes by posting the new terms on the site or via email. Your continued use of the service after such modifications will constitute your acknowledgment and acceptance of the modified terms.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have any questions about these Terms, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700">Email: legal@medlmconnect.com</p>
          <p className="text-gray-700">Phone: (555) 987-6543</p>
          <p className="text-gray-700">Address: 123 Health Avenue, Medical District, CA 90210</p>
        </div>
      </section>
      
      <div className="text-sm text-gray-500 border-t pt-4">
        Last updated: April 15, 2023
      </div>
    </div>
  );
} 