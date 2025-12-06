import { useState } from 'react';
import { CheckCircle2, Play } from 'lucide-react';

const DemoPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    restaurantCount: '1',
    currentSystem: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement Supabase lead capture
    // For now, simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-success-100 text-success-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-8">
              We've received your demo request. A member of our team will reach out within 24 hours to schedule your personalized demo.
            </p>
            <p className="text-gray-500">
              In the meantime, check your email for a link to our product overview video.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              See ShiftCheck <span className="text-primary-500">In Action</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Schedule a personalized demo and see how ShiftCheck can transform your restaurant operations.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Video Placeholder */}
            <div>
              <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-gray-900"></div>
                <div className="relative z-10 text-center">
                  <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors">
                    <Play size={32} className="text-white ml-1" />
                  </button>
                  <p className="text-white font-medium">Watch Product Overview</p>
                  <p className="text-white/60 text-sm">2 min video</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll See in the Demo</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-success-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-600">How to set up your first checklist in under 5 minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-success-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-600">The team device experience your employees will use</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-success-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-600">Manager grading and feedback workflow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-success-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-600">Performance tracking and employee insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-success-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-600">Q&A with a ShiftCheck expert</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Your Demo</h2>
              <p className="text-gray-500 mb-6">Fill out the form and we'll be in touch within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant/Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="restaurantCount" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Locations *
                  </label>
                  <select
                    id="restaurantCount"
                    name="restaurantCount"
                    required
                    value={formData.restaurantCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="1">1 location</option>
                    <option value="2-5">2-5 locations</option>
                    <option value="6-10">6-10 locations</option>
                    <option value="11-25">11-25 locations</option>
                    <option value="26+">26+ locations</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="currentSystem" className="block text-sm font-medium text-gray-700 mb-1">
                    Current System (Optional)
                  </label>
                  <input
                    type="text"
                    id="currentSystem"
                    name="currentSystem"
                    placeholder="Paper checklists, spreadsheets, other software..."
                    value={formData.currentSystem}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Anything else we should know?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-500 text-white py-4 rounded-lg font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Demo'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;
