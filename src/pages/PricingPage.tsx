import Pricing from '../components/home/Pricing';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const PricingPage = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Simple, Transparent <span className="text-primary-500">Pricing</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Start free for 30 days. No credit card required. Scale when you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Component */}
      <Pricing />

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">What happens after my free trial?</h3>
                <p className="text-gray-600">
                  After 30 days, you can choose to upgrade to a paid plan or your account will be downgraded to read-only mode. We'll never charge you without your explicit consent.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">Can I change plans later?</h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade at any time. Changes take effect at your next billing cycle.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">What's included in "Unlimited Employees"?</h3>
                <p className="text-gray-600">
                  All paid plans include unlimited employees. Add as many team members as you need without paying per-seat fees.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">Do you offer annual billing?</h3>
                <p className="text-gray-600">
                  Yes! Annual billing is available at a 20% discount. Contact us for details.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards through Stripe. For enterprise customers, we also offer invoicing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-success-100 text-success-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-gray-600 mb-8">
              If ShiftCheck doesn't transform how you run your restaurant within 30 days, we'll refund your first month. No questions asked.
            </p>
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded font-bold hover:bg-primary-600 transition-all shadow-lg"
            >
              Start Your Free Trial
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
