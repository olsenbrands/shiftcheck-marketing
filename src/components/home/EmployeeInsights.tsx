import {
  Activity,
  BarChart3,
  Eye,
  FileWarning,
  Trophy,
  UserCheck,
  Users
} from 'lucide-react';

const EmployeeInsights = () => {
  return (
    <section className="py-24 bg-gray-50 border-y border-gray-200 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/50 via-transparent to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">Performance Intelligence</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            A Performance Review.<br />
            <span className="text-gray-500">Every Employee. Every Shift.</span>
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
            ShiftCheck doesn't just track tasks; it tracks people. Every completed checklist builds a permanent performance history for each team member.
          </p>
        </div>

        {/* Dashboard Mockup Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-200 shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">The Mini-Review</h4>
                <p className="text-gray-600 leading-relaxed">
                  Before submitting a checklist, Shift Leads complete a quick questionnaire on team hustle. Are they helping guests? Are they on their phones? It's recorded instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-success-50 text-success-600 flex items-center justify-center border border-success-200 shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Stats</h4>
                <p className="text-gray-600 leading-relaxed">
                  Pass/Fail rates are tied to the employee. Missed tasks? Late checklists? It's all logged. You'll know exactly who is reliable and who isn't.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                <Eye size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Track your Managers' performance.</h4>
                <p className="text-gray-600 leading-relaxed">
                  We even track your Managers. Are they slow to review checklists? Do they provide lazy feedback? You'll see their response times and engagement levels on your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Dashboard Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl shadow-gray-200/50 relative">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-primary-500" size={20} />
                <span className="text-gray-900 font-bold">Live Team Performance</span>
              </div>
              <div className="text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded border border-primary-200 animate-pulse">
                Live Feed
              </div>
            </div>

            <div className="space-y-4">
              {/* High Performer */}
              <div className="p-4 bg-success-50/50 rounded-lg border border-success-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center text-white font-bold text-xs">JD</div>
                    <div>
                      <div className="text-gray-900 font-bold text-sm">John Doe</div>
                      <div className="text-success-600 text-[10px] font-bold uppercase tracking-wider">Top Performer</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-mono font-bold">98%</div>
                    <div className="text-[10px] text-gray-500">Task Completion</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-success-500 h-full w-[98%]"></div>
                </div>
              </div>

              {/* Average Performer */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">AS</div>
                    <div>
                      <div className="text-gray-900 font-bold text-sm">Sarah Smith</div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wider">Consistent</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-mono font-bold">84%</div>
                    <div className="text-[10px] text-gray-500">Task Completion</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full w-[84%]"></div>
                </div>
              </div>

              {/* Low Performer */}
              <div className="p-4 bg-red-50/50 rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">MR</div>
                    <div>
                      <div className="text-gray-900 font-bold text-sm">Mike Ross</div>
                      <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Needs Coaching</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-mono font-bold">62%</div>
                    <div className="text-[10px] text-gray-500">Task Completion</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">Late: 3x</span>
                  <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">Failed Items: 12</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Truth/Action Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors shadow-sm">
            <Trophy className="text-primary-500 mb-4" size={32} />
            <h4 className="text-gray-900 font-bold text-lg mb-2">Promote with Confidence</h4>
            <p className="text-gray-600 text-sm">
              Don't be fooled by brown-nosers. See who actually does the work when you aren't looking. Identify your true leaders instantly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-red-300 transition-colors shadow-sm">
            <FileWarning className="text-red-500 mb-4" size={32} />
            <h4 className="text-gray-900 font-bold text-lg mb-2">Fire with Cause</h4>
            <p className="text-gray-600 text-sm">
              Identify who is dragging the team down. You'll have a documented performance history that allows you to let them go with cause.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
            <Users className="text-primary-500 mb-4" size={32} />
            <h4 className="text-gray-900 font-bold text-lg mb-2">Transparent Gamification</h4>
            <p className="text-gray-600 text-sm">
              Optionally display leaderboards on the team device. Let the team see who is getting the best reviews and spark healthy competition.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeeInsights;
