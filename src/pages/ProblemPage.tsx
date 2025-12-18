import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';

const ProblemPage = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Your Restaurant <span className="text-red-500">Isn't</span> Running the Way You Want
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              And you know it. The question is: why does this keep happening—and what can you actually do about it?
            </p>
            <Link
              to="/solution"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded font-bold hover:bg-primary-600 transition-all shadow-lg"
            >
              See the Solution
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem Grid */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">The Reality</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">Sound Familiar?</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <XCircle className="text-red-500 mb-4" size={32} />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Tasks Get "Done" But Not Done Right</h4>
              <p className="text-gray-600">
                Your team checks boxes on the paper checklist, but when you actually look... the floors are sticky, the prep station is a mess, and the bathrooms? Don't even get started.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <Clock className="text-red-500 mb-4" size={32} />
              <h4 className="text-xl font-bold text-gray-900 mb-3">"I Didn't Know" Is the Default Excuse</h4>
              <p className="text-gray-600">
                Every time something goes wrong, it's the same story. But how would they know? Your standards live in your head, not in a system they can actually follow.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <Eye className="text-red-500 mb-4" size={32} />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Things Only Run Right When You're There</h4>
              <p className="text-gray-600">
                Pop in unexpectedly and everyone suddenly gets busy. Leave for a week and the whole operation falls apart. You shouldn't have to be omnipresent.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <Users className="text-red-500 mb-4" size={32} />
              <h4 className="text-xl font-bold text-gray-900 mb-3">You Don't Know Who's Actually Good</h4>
              <p className="text-gray-600">
                Some employees talk a big game but deliver nothing. Others quietly do the work but never get recognized. Without data, you're guessing on promotions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <MessageSquare className="text-red-500 mb-4" size={32} />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Managers Can't Coach What They Can't See</h4>
              <p className="text-gray-600">
                Your managers want to help the team improve, but they're not there for every shift. How can they give feedback on work they never witnessed?
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <AlertTriangle className="text-red-500 mb-4" size={32} />
              <h4 className="text-xl font-bold text-gray-900 mb-3">Holding People Accountable Feels Impossible</h4>
              <p className="text-gray-600">
                You want to fire the dead weight, but you have no documentation. You want to reward the stars, but you can't prove who they are. It's all hearsay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Cost */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                The Real Cost of <span className="text-red-500">Inconsistency</span>
              </h2>
              <p className="text-xl text-gray-500">
                It's not just frustration—it's money walking out the door.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-8 bg-red-50 rounded-xl border border-red-100">
                <TrendingUp className="text-red-500 mx-auto mb-4" size={40} />
                <div className="text-4xl font-extrabold text-red-600 mb-2">15%</div>
                <p className="text-gray-700 font-medium">Food waste from poor prep</p>
              </div>

              <div className="p-8 bg-red-50 rounded-xl border border-red-100">
                <Users className="text-red-500 mx-auto mb-4" size={40} />
                <div className="text-4xl font-extrabold text-red-600 mb-2">$5,000+</div>
                <p className="text-gray-700 font-medium">Cost to replace one employee</p>
              </div>

              <div className="p-8 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
                <div className="text-4xl font-extrabold text-red-600 mb-2">1 in 3</div>
                <p className="text-gray-700 font-medium">Customers don't return after bad experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Ready to Fix This?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            ShiftCheck gives you the system to hold your team accountable, recognize top performers, and finally run your restaurant the way you've always wanted.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/solution"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded font-bold hover:bg-gray-100 transition-all"
            >
              See How It Works
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white border border-primary-500 px-8 py-4 rounded font-bold hover:bg-primary-700 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProblemPage;
