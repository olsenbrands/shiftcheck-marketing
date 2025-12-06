const TermsPage = () => {
  return (
    <div className="pt-24">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-500 mb-12">Last updated: December 1, 2024</p>

            <div className="prose prose-lg max-w-none text-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using ShiftCheck's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
              <p>
                ShiftCheck provides a restaurant operations management platform that includes digital checklists, photo verification, performance tracking, and related features. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
              <p>To use our service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Upload malicious code or content</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Interfere with the service's operation</li>
                <li>Share account credentials with unauthorized users</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Content Ownership</h2>
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Your Content</h3>
              <p>
                You retain ownership of content you upload to ShiftCheck (photos, checklists, etc.). By uploading content, you grant us a license to use, store, and display that content to provide our services.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Our Content</h3>
              <p>
                ShiftCheck and its licensors own all intellectual property rights in the service, including software, design, and documentation. You may not copy, modify, or distribute our content without permission.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Payment Terms</h2>
              <p>
                Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as specified in our refund policy. We may change pricing with 30 days' notice.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cancellation</h2>
              <p>
                You may cancel your subscription at any time. Upon cancellation, you will retain access until the end of your current billing period. We may terminate or suspend your account for violations of these terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SHIFTCHECK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless ShiftCheck and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the service or violation of these terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
              <p>
                These terms are governed by the laws of the State of Utah, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Salt Lake County, Utah.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms. We will provide notice of material changes.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact</h2>
              <p>
                For questions about these terms, contact us at:
              </p>
              <p className="mt-4">
                <strong>ShiftCheck Inc.</strong><br />
                Email: legal@shiftcheck.app<br />
                Salt Lake City, UT
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
