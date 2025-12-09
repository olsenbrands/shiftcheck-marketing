import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye,
  MessageSquare,
  Shield,
  Smartphone,
  TrendingUp,
  UserCheck
} from 'lucide-react';

const SolutionPage = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-50 border border-primary-200 text-primary-600 text-xs font-mono mb-8 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              The ShiftCheck System
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Finally, a System That <span className="text-primary-500">Actually Works</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              ShiftCheck replaces paper checklists with photo-verified proof, turns every shift into a performance review, and gives you the data to make confident decisions.
            </p>
          </div>
        </div>
      </section>

      {/* The 4-Step Loop */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">How It Works</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">The Accountability Loop</h3>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              A simple, repeatable workflow that ensures every task gets done right, every shift, every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-6 border border-primary-100">
                <Smartphone size={24} />
              </div>
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100">1</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Assign</h4>
              <p className="text-gray-600">
                Checklists auto-populate on the store device. Your team sees exactly what needs to be done—with reference photos showing the standard.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-6 border border-purple-100">
                <Camera size={24} />
              </div>
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100">2</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Prove</h4>
              <p className="text-gray-600">
                Instead of checking a box, employees snap a photo. Real proof that the work was done—not just claimed as done.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-6 border border-orange-100">
                <UserCheck size={24} />
              </div>
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100">3</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Audit</h4>
              <p className="text-gray-600">
                Shift Leads review all tasks before submitting, flagging issues and reporting on team hustle. Built-in mini performance reviews.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-success-50 text-success-600 flex items-center justify-center mb-6 border border-success-100">
                <CheckCircle2 size={24} />
              </div>
              <div className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100">4</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Grade</h4>
              <p className="text-gray-600">
                Managers grade tasks as Pass, Exceptional, or Fail. Failed tasks go back to the team to fix immediately and resubmit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Why ShiftCheck Works</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100">
                <Eye size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Visual Standards, Not Guesswork</h4>
                <p className="text-gray-600">
                  Upload reference photos showing exactly what "done right" looks like. No more "I didn't know what you wanted."
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Camera size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Photo Proof, Not Trust</h4>
                <p className="text-gray-600">
                  Every completed task has a photo attached. You'll see exactly what was done, even when you're not there.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                <TrendingUp size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Data-Driven Performance</h4>
                <p className="text-gray-600">
                  Every employee builds a performance history. Pass/fail rates, on-time submissions, manager feedback—all tracked automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0 border border-success-100">
                <Shield size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Documented Accountability</h4>
                <p className="text-gray-600">
                  Promote with confidence. Fire with cause. You'll have the documentation to back up every decision.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <MessageSquare size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Remote Coaching</h4>
                <p className="text-gray-600">
                  Managers can leave feedback on any task from anywhere. Coach your team without being physically present.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 border border-yellow-100">
                <UserCheck size={28} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Culture Change in Weeks</h4>
                <p className="text-gray-600">
                  Not months. Not years. When accountability is consistent and daily, culture shifts fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join restaurant owners who are finally running their stores the way they've always wanted.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/verify-email"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded font-bold hover:bg-gray-100 transition-all"
            >
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white border border-primary-500 px-8 py-4 rounded font-bold hover:bg-primary-700 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionPage;
