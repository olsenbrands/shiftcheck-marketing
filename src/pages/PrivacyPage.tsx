const PrivacyPage = () => {
  return (
    <div className="pt-24">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-500 mb-12">Last updated: December 1, 2024</p>

            <div className="prose prose-lg max-w-none text-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
              <p>
                ShiftCheck Inc. ("ShiftCheck," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Personal Information</h3>
              <p>We may collect personal information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Business information (company name, restaurant details)</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Communications with us</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Usage Information</h3>
              <p>We automatically collect certain information when you use our service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (type, operating system, browser)</li>
                <li>Log data (access times, pages viewed, IP address)</li>
                <li>Location data (with your consent)</li>
                <li>Photos uploaded through the service</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve our service</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who assist in our operations</li>
                <li>Professional advisors (lawyers, accountants)</li>
                <li>Law enforcement when required by law</li>
                <li>Business transferees in case of merger or acquisition</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and access controls.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 16. We do not knowingly collect personal information from children under 16.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <p className="mt-4">
                <strong>ShiftCheck Inc.</strong><br />
                Email: privacy@shiftcheck.app<br />
                Salt Lake City, UT
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
