import { Link } from 'react-router-dom';
import { ArrowRight, Quote, TrendingUp } from 'lucide-react';

const CaseStudiesPage = () => {
  const caseStudies = [
    {
      company: "Fast Casual Chain",
      industry: "Quick Service Restaurant",
      locations: "12 locations",
      challenge: "Inconsistent closing procedures across locations leading to health inspection issues",
      solution: "Implemented standardized closing checklists with photo verification",
      results: [
        { metric: "40%", label: "Reduction in health violations" },
        { metric: "95%", label: "Checklist completion rate" },
        { metric: "2 hrs", label: "Saved per location weekly" }
      ],
      quote: "ShiftCheck gave us visibility into every shift at every location. We went from hoping things got done to knowing they did.",
      author: "Regional Manager",
      image: "bg-gradient-to-br from-primary-500 to-primary-700"
    },
    {
      company: "Family Restaurant Group",
      industry: "Full Service Dining",
      locations: "5 locations",
      challenge: "High turnover and difficulty identifying top performers for promotion",
      solution: "Used performance tracking and Shift Lead reviews to build employee portfolios",
      results: [
        { metric: "25%", label: "Reduction in turnover" },
        { metric: "3", label: "Internal promotions in 6 months" },
        { metric: "88%", label: "Employee satisfaction score" }
      ],
      quote: "Now I know exactly who deserves a promotion based on data, not just who talks a good game.",
      author: "Owner",
      image: "bg-gradient-to-br from-purple-500 to-purple-700"
    },
    {
      company: "Coffee Shop Mini-Chain",
      industry: "Specialty Beverage",
      locations: "3 locations",
      challenge: "Opening procedures taking too long, affecting customer service during morning rush",
      solution: "Created optimized opening checklists with time benchmarks and reference photos",
      results: [
        { metric: "35%", label: "Faster opening times" },
        { metric: "15 min", label: "Earlier doors-open on average" },
        { metric: "4.8", label: "Google rating (up from 4.2)" }
      ],
      quote: "Our morning rush used to be chaotic. Now we're ready before the first customer walks in.",
      author: "Operations Manager",
      image: "bg-gradient-to-br from-orange-500 to-orange-700"
    }
  ];

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Real Results from <span className="text-primary-500">Real Restaurants</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              See how restaurants like yours are transforming their operations with ShiftCheck.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              * Case studies based on beta customer experiences. Names anonymized for privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="space-y-20">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                <div className="grid lg:grid-cols-2">
                  {/* Image/Visual Side */}
                  <div className={`${study.image} p-12 flex flex-col justify-center text-white min-h-[400px]`}>
                    <div className="text-sm font-mono uppercase tracking-wider opacity-75 mb-2">{study.industry}</div>
                    <h2 className="text-3xl font-extrabold mb-2">{study.company}</h2>
                    <p className="text-white/80">{study.locations}</p>

                    <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-xl">
                      <Quote className="opacity-50 mb-2" size={24} />
                      <p className="text-lg italic mb-4">{study.quote}</p>
                      <p className="text-sm font-bold">— {study.author}</p>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-12">
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">The Challenge</h3>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-2">The Solution</h3>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-success-600 uppercase tracking-wider mb-4">The Results</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {study.results.map((result, idx) => (
                          <div key={idx} className="text-center p-4 bg-success-50 rounded-lg border border-success-100">
                            <div className="text-2xl font-extrabold text-success-600 mb-1">{result.metric}</div>
                            <div className="text-xs text-gray-600">{result.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Average Results Across Beta Customers</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <TrendingUp className="text-primary-500 mx-auto mb-4" size={32} />
              <div className="text-4xl font-extrabold text-gray-900 mb-2">89%</div>
              <p className="text-gray-600">Checklist completion rate</p>
            </div>
            <div className="text-center">
              <TrendingUp className="text-primary-500 mx-auto mb-4" size={32} />
              <div className="text-4xl font-extrabold text-gray-900 mb-2">35%</div>
              <p className="text-gray-600">Reduction in task failures</p>
            </div>
            <div className="text-center">
              <TrendingUp className="text-primary-500 mx-auto mb-4" size={32} />
              <div className="text-4xl font-extrabold text-gray-900 mb-2">2 weeks</div>
              <p className="text-gray-600">To see culture change</p>
            </div>
            <div className="text-center">
              <TrendingUp className="text-primary-500 mx-auto mb-4" size={32} />
              <div className="text-4xl font-extrabold text-gray-900 mb-2">4.6/5</div>
              <p className="text-gray-600">Customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the restaurants that are transforming their operations with ShiftCheck.
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded font-bold hover:bg-gray-100 transition-all"
          >
            Start Free Trial
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CaseStudiesPage;
