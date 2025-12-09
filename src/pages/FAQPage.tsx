import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How long does it take to set up ShiftCheck?",
    answer: "Most restaurants are up and running within 30 minutes. You can create your first checklist in under 5 minutes. Our onboarding wizard guides you through the entire process step by step."
  },
  {
    category: "Getting Started",
    question: "Do I need any special equipment?",
    answer: "Just a tablet or smartphone for the team device. Any Android or iOS device works. Many customers use an inexpensive tablet mounted near the back of house."
  },
  {
    category: "Getting Started",
    question: "Can I import my existing checklists?",
    answer: "Yes! You can easily recreate your paper checklists in ShiftCheck. Just take photos of your current lists and our support team can help you digitize them."
  },

  // Features
  {
    category: "Features",
    question: "What's the difference between Shift Leads and Managers?",
    answer: "Shift Leads work on the team device completing checklists and doing mini-reviews of employee hustle. Managers work on a separate app where they grade submissions, leave feedback, and view performance analytics."
  },
  {
    category: "Features",
    question: "Can employees see their own performance data?",
    answer: "Yes! Employees can see their pass/fail rates and manager feedback. You can also enable optional leaderboards to foster healthy competition."
  },
  {
    category: "Features",
    question: "What happens if a task fails review?",
    answer: "Failed tasks automatically get sent back to the team device with the manager's feedback. The team must fix the issue, take a new photo, and resubmit. This loop continues until the task passes."
  },

  // Pricing & Plans
  {
    category: "Pricing & Plans",
    question: "Is there a free trial?",
    answer: "Yes! All new accounts get a free 30-day trial with full access to features. No credit card required to start."
  },
  {
    category: "Pricing & Plans",
    question: "What's the difference between plans?",
    answer: "The main differences are number of restaurants, number of managers, and access to advanced features like Performance Insights. All paid plans include unlimited checklists, tasks, and employees."
  },
  {
    category: "Pricing & Plans",
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your current billing period."
  },

  // Technical
  {
    category: "Technical",
    question: "Does ShiftCheck work offline?",
    answer: "The team device app works offline and syncs when connection is restored. Managers need an internet connection to review and grade submissions."
  },
  {
    category: "Technical",
    question: "Is my data secure?",
    answer: "Yes. We use industry-standard encryption and security practices. Your data is stored securely and never shared with third parties. We're SOC 2 compliant."
  },
  {
    category: "Technical",
    question: "Can I integrate ShiftCheck with other systems?",
    answer: "We offer API access for Enterprise customers. We're also working on integrations with popular POS and scheduling systems. Contact us to discuss your needs."
  },

  // Support
  {
    category: "Support",
    question: "What kind of support do you offer?",
    answer: "All plans include email support with 24-hour response times. Paid plans include chat support. Enterprise plans include dedicated account managers and phone support."
  },
  {
    category: "Support",
    question: "Do you offer training for my team?",
    answer: "Yes! We provide video tutorials, documentation, and live training sessions. Enterprise customers get customized onboarding and ongoing training."
  }
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = activeCategory === "All"
    ? faqs
    : faqs.filter(f => f.category === activeCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Frequently Asked <span className="text-primary-500">Questions</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Everything you need to know about ShiftCheck. Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-900">{faq.question}</span>
                    {openItems.includes(index) ? (
                      <ChevronUp className="text-gray-400 shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400 shrink-0" size={20} />
                    )}
                  </button>
                  {openItems.includes(index) && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-8">
            Our team is here to help. Get in touch and we'll respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded font-bold hover:bg-primary-600 transition-all"
            >
              Contact Support
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/auth/verify-email"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded font-bold hover:bg-gray-50 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
