import { ShieldCheck, TrendingUp } from 'lucide-react';

const AccountabilitySection = () => {
  return (
    <section id="accountability" className="py-24 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">The Missing Piece</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Successful operations hinge on one thing: <span className="text-primary-500">Accountability.</span>
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto mb-8">
            If your team continues to fail to run your restaurant the way you want, it's likely because there is no accountability when they don't.
          </p>
          <p className="text-2xl font-bold text-gray-900 max-w-3xl mx-auto">
            Give your team your standards, expectations, and the tool to create accountability. <span className="text-primary-500">Give them ShiftCheck.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="bg-white p-8 rounded-xl border border-gray-200 relative h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 rounded-l-xl"></div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-red-500">The "Pop-In" Trap</span>
            </h4>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You might speak up and point out issues when you stop by, and that might change things for a few days... but your team has spent months (maybe years) doing things the wrong way.
            </p>
            <p className="text-gray-600 leading-relaxed">
              It takes more than a "pop-in" to change the culture. Without a system, they slide right back into bad habits the moment you leave.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 relative h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-xl"></div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-500">The ShiftCheck System</span>
            </h4>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Don't just hope your team will do the right thing; hold them accountable when the standard isn't met. Implement the ShiftCheck system into your restaurant and watch the change in culture in weeks, not months.
            </p>
          </div>
        </div>

        {/* The Result / Dream Block */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <ShieldCheck size={200} className="text-primary-500" />
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                It may sound like a dream, but your restaurant <span className="text-primary-500 underline decoration-primary-200 underline-offset-4">CAN</span> be run the way you want.
              </h3>
              <p className="text-lg text-gray-500 italic mb-6">
                "Every shift. Every day."
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-6 min-h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 text-xs font-bold">1</div>
                  <p className="text-gray-600 text-sm">You'll discover the employees who are the true workhorses and leaders.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="min-w-6 min-h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 text-xs font-bold">2</div>
                  <p className="text-gray-600 text-sm">You'll instantly know who to promote to run your store.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="min-w-6 min-h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 text-xs font-bold">3</div>
                  <p className="text-gray-600 text-sm">You'll know who is dragging the team down and needs to move on.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-success-100 text-success-600 rounded-lg flex items-center justify-center border border-success-200">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-bold uppercase">Impact</div>
                  <div className="text-gray-900 font-bold">Culture Shift Speed</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-gray-500">
                    <span>With Pop-Ins</span>
                    <span>Temporary</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-gray-400"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 text-primary-700">
                    <span className="font-bold">With ShiftCheck Accountability</span>
                    <span className="font-bold">Permanent</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-primary-500"></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-900 font-bold text-sm">"Your store needs daily accountability."</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AccountabilitySection;
