import { Link } from 'react-router-dom';
import { CheckCircle2, Zap } from 'lucide-react';

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">Pricing</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Simple, Transparent Pricing.
          </h3>
          <p className="text-xl text-gray-500">
            Start for free. Scale when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* FREE TIER */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col relative overflow-hidden group hover:border-gray-300 transition-colors shadow-sm">
            <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase text-gray-600">Trial</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Free Starter</h4>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">$0</div>
            <p className="text-gray-500 text-sm mb-6">Free for 30 days</p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                1 Restaurant
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                3 checklists per day
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                10 tasks per checklist
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                1 Manager
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                3 Shift Leads
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited Employees
              </li>
            </ul>
            <Link
              to="/demo"
              className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-center"
            >
              Start Free Trial
            </Link>
          </div>

          {/* GROW TIER */}
          <div className="bg-white rounded-2xl p-8 border border-primary-500/50 flex flex-col relative overflow-hidden shadow-2xl shadow-primary-900/10 ring-1 ring-primary-500">
            <div className="absolute top-0 right-0 bg-primary-600 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase text-white">Most Popular</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Grow</h4>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">$99<span className="text-lg font-medium text-gray-500">/mo</span></div>
            <p className="text-gray-500 text-sm mb-6">For single store owners</p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                1 Restaurant
              </li>
              <li className="flex gap-3 text-sm text-gray-900 font-bold">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited checklists
              </li>
              <li className="flex gap-3 text-sm text-gray-900 font-bold">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited tasks
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                2 Managers
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited Shift Leads
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited Employees
              </li>
              <li className="flex flex-col gap-2 text-sm text-primary-600">
                <div className="flex gap-3">
                  <Zap size={16} className="text-primary-500 shrink-0" />
                  <span className="font-bold">Performance Insights</span>
                </div>
                <ul className="pl-9 space-y-2 text-gray-500 text-xs">
                  <li>• Shift Lead Performance Reviews</li>
                  <li>• On Time Submission KPIs</li>
                  <li>• Top (and bottom) Performers</li>
                  <li>• Email employees weekly insights</li>
                </ul>
              </li>
            </ul>
            <Link
              to="/demo"
              className="w-full py-3 rounded-lg bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 text-center"
            >
              Get Started
            </Link>
          </div>

          {/* EXPAND TIER */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col hover:border-gray-300 transition-colors shadow-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Expand</h4>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">$349<span className="text-lg font-medium text-gray-500">/mo</span></div>
            <p className="text-gray-500 text-sm mb-6">For growing groups</p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                <span className="font-bold text-gray-900">5 Restaurants</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited checklists
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited tasks
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                2 Managers per store
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited Shift Leads
              </li>
              <li className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                Unlimited Employees
              </li>
              <li className="flex flex-col gap-2 text-sm text-primary-600">
                <div className="flex gap-3">
                  <Zap size={16} className="text-primary-500 shrink-0" />
                  <span className="font-bold">Performance Insights</span>
                </div>
                <ul className="pl-9 space-y-2 text-gray-500 text-xs">
                  <li>• Shift Lead Performance Reviews</li>
                  <li>• On Time Submission KPIs</li>
                  <li>• Top (and bottom) Performers</li>
                  <li>• Email employees weekly insights</li>
                </ul>
              </li>
            </ul>
            <Link
              to="/demo"
              className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-center"
            >
              Get Started
            </Link>
          </div>

          {/* ENTERPRISE TIER */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>
            <h4 className="text-xl font-bold text-white mb-2 relative z-10">Enterprise</h4>
            <div className="text-3xl font-extrabold text-white mb-1 relative z-10">Custom</div>
            <p className="text-gray-400 text-sm mb-6 relative z-10">For large multi-unit operations</p>

            <ul className="space-y-4 mb-8 flex-1 relative z-10">
              <li className="flex gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-gray-500 shrink-0" />
                Multi-Unit Dashboard
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-gray-500 shrink-0" />
                Dedicated Onboarding Manager
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-gray-500 shrink-0" />
                Dedicated Success Manager
              </li>
            </ul>
            <button className="relative z-10 w-full py-3 rounded-lg bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors">
              Let's Talk!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
