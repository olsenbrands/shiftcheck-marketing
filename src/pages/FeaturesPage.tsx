import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  Eye,
  ListChecks,
  MessageSquare,
  Repeat,
  Shield,
  Smartphone,
  Trophy,
  UserCheck,
  Users,
  Zap
} from 'lucide-react';

const FeaturesPage = () => {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Everything You Need to Run Your Store <span className="text-primary-500">Your Way</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              ShiftCheck combines task management, photo verification, performance tracking, and manager oversight into one powerful system.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          {/* Checklist Management */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">Checklist Management</h2>
              <h3 className="text-3xl font-extrabold text-gray-900">Digital Checklists That Actually Work</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <ListChecks className="text-primary-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Unlimited Checklists</h4>
                <p className="text-gray-600 text-sm">Create as many checklists as you need—opening, closing, deep clean, prep, whatever your operation requires.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Calendar className="text-primary-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Flexible Scheduling</h4>
                <p className="text-gray-600 text-sm">Schedule checklists daily, weekly, bi-weekly, or monthly. Assign to specific shifts or days of the week.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Eye className="text-primary-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Reference Photos</h4>
                <p className="text-gray-600 text-sm">Upload photos showing exactly what "done right" looks like. Eliminate "I didn't know" forever.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Smartphone className="text-primary-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Team Device App</h4>
                <p className="text-gray-600 text-sm">One shared tablet for the store. Checklists auto-populate so the team always knows what to work on.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Repeat className="text-primary-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Task Recycling</h4>
                <p className="text-gray-600 text-sm">Failed tasks automatically go back to the team device for immediate correction and resubmission.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Bell className="text-primary-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Smart Notifications</h4>
                <p className="text-gray-600 text-sm">Managers get notified when checklists are submitted for review. Never miss a shift again.</p>
              </div>
            </div>
          </div>

          {/* Photo Verification */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-purple-600 font-mono text-xs tracking-widest uppercase mb-4">Photo Verification</h2>
              <h3 className="text-3xl font-extrabold text-gray-900">Proof Over Promises</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Camera className="text-purple-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Photo-Required Tasks</h4>
                <p className="text-gray-600 text-sm">Every task completion requires a photo. No more checking boxes without actually doing the work.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <CheckCircle2 className="text-purple-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Side-by-Side Compare</h4>
                <p className="text-gray-600 text-sm">Managers can compare submitted photos against reference standards at a glance.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Shield className="text-purple-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Timestamp & Location</h4>
                <p className="text-gray-600 text-sm">Photos are timestamped and location-verified. You'll know exactly when and where the work was done.</p>
              </div>
            </div>
          </div>

          {/* Performance Tracking */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-orange-600 font-mono text-xs tracking-widest uppercase mb-4">Performance Intelligence</h2>
              <h3 className="text-3xl font-extrabold text-gray-900">Data-Driven Team Management</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <UserCheck className="text-orange-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Shift Lead Reviews</h4>
                <p className="text-gray-600 text-sm">Shift Leads complete quick reviews on team hustle before submitting checklists. Built-in mini performance reviews.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Activity className="text-orange-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Individual Metrics</h4>
                <p className="text-gray-600 text-sm">Track pass/fail rates, on-time submissions, and manager feedback for every employee.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <BarChart3 className="text-orange-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Manager Dashboard</h4>
                <p className="text-gray-600 text-sm">See team performance at a glance. Identify top performers and those who need coaching.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Trophy className="text-orange-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Leaderboards</h4>
                <p className="text-gray-600 text-sm">Optional gamification with team leaderboards. Spark healthy competition and recognize top performers.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Users className="text-orange-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Manager Tracking</h4>
                <p className="text-gray-600 text-sm">Track manager response times and engagement. Hold your managers accountable too.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Zap className="text-orange-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Weekly Insights</h4>
                <p className="text-gray-600 text-sm">Automated weekly emails to employees with their performance stats and improvement tips.</p>
              </div>
            </div>
          </div>

          {/* Manager Tools */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-success-600 font-mono text-xs tracking-widest uppercase mb-4">Manager Tools</h2>
              <h3 className="text-3xl font-extrabold text-gray-900">Remote Oversight Made Easy</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <CheckCircle2 className="text-success-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Task Grading</h4>
                <p className="text-gray-600 text-sm">Grade each task as Pass, Exceptional, or Fail. Failed tasks get sent back for immediate correction.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <MessageSquare className="text-success-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Inline Feedback</h4>
                <p className="text-gray-600 text-sm">Leave coaching comments directly on any task. Build a feedback history for each employee.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <Smartphone className="text-success-500 mb-4" size={28} />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Mobile Manager App</h4>
                <p className="text-gray-600 text-sm">Review and grade checklists from anywhere on your phone. No need to be at the store.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            See ShiftCheck in Action
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Ready to transform how you run your restaurant? Let us show you how ShiftCheck works.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-900 px-8 py-4 rounded font-bold hover:bg-gray-100 transition-all"
          >
            Request a Demo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
