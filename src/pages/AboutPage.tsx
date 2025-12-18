import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, Target, Users, Zap } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              We're Building the Future of <span className="text-primary-500">Restaurant Operations</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              ShiftCheck was born from a simple observation: restaurant owners know exactly how they want their stores to run—they just lack the tools to make it happen consistently.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Our Story</h2>

            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Every restaurant owner has experienced it: you walk into your store after a few days away and immediately see a dozen things that aren't right. The floors weren't mopped properly. The prep station is disorganized. The bathrooms need attention.
              </p>

              <p>
                You mention it to the team. They nod, apologize, and fix it. But two weeks later? Same problems. It's like nothing ever changes.
              </p>

              <p>
                <strong className="text-gray-900">That's because nothing actually did change.</strong>
              </p>

              <p>
                Paper checklists get checked without work being done. Verbal instructions get forgotten. Standards live in the owner's head but never make it to the team in a way that sticks.
              </p>

              <p>
                ShiftCheck was created to solve this problem. We give restaurant owners and managers the tools to:
              </p>

              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary-500 shrink-0 mt-1" size={18} />
                  <span>Show their team exactly what "done right" looks like with visual standards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary-500 shrink-0 mt-1" size={18} />
                  <span>Get photo proof that work was actually completed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary-500 shrink-0 mt-1" size={18} />
                  <span>Hold employees accountable with documented performance data</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary-500 shrink-0 mt-1" size={18} />
                  <span>Identify who's really performing and who's just talking</span>
                </li>
              </ul>

              <p>
                Our mission is simple: help restaurant owners run their stores exactly the way they want—every shift, every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-12 text-center">What We Stand For</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 border border-primary-100">
                <Target size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Proof Over Promises</h3>
              <p className="text-gray-600 text-sm">
                We believe in verifiable results, not just checked boxes. Every feature we build is about creating accountability you can see.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
                <Zap size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Simple Beats Complex</h3>
              <p className="text-gray-600 text-sm">
                Restaurant teams are busy. Our tools are designed to be intuitive and fast—no training manuals required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <Users size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">People First</h3>
              <p className="text-gray-600 text-sm">
                Great restaurants are built by great teams. Our goal is to help you identify and develop your best people.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Heart size={28} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Owner Obsessed</h3>
              <p className="text-gray-600 text-sm">
                We build for the owner who cares deeply about their restaurant. Your success is our success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-white mb-2">100+</div>
              <p className="text-primary-200">Beta Restaurants</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white mb-2">50K+</div>
              <p className="text-primary-200">Checklists Completed</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white mb-2">89%</div>
              <p className="text-primary-200">Average Completion Rate</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white mb-2">4.8/5</div>
              <p className="text-primary-200">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Join the restaurant owners who are taking control of their operations with ShiftCheck.
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded font-bold hover:bg-primary-600 transition-all shadow-lg"
          >
            Start Free Trial
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
