import { Link } from 'react-router-dom';

const ROI = () => {
  return (
    <section id="roi" className="py-24 bg-white border-t border-gray-200 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="bg-primary-900 rounded-3xl p-8 md:p-16 border border-primary-800 text-center relative overflow-hidden shadow-2xl">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8">Invest in Consistency.<br />Harvest Peace of Mind.</h2>

            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto items-center mt-12">
              <div className="text-left space-y-4">
                <div className="text-primary-200 text-sm font-bold uppercase tracking-wider">Traditional Oversight</div>
                <div>
                  <div className="text-2xl font-bold text-primary-300/50 line-through decoration-primary-400/50">Regional Manager</div>
                  <div className="text-4xl font-extrabold text-white">$60,000<span className="text-lg font-medium text-primary-200">/yr</span></div>
                  <div className="text-sm text-primary-200 font-mono">($5,000 / month)</div>
                </div>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Physical visits are infrequent and quality varies based on personality. Employees rarely sustain change if they don't see their Manager often.
                </p>
              </div>

              <div className="text-left space-y-4 md:pl-12 md:border-l md:border-primary-700">
                <div className="text-primary-400 text-sm font-bold uppercase tracking-wider">The ShiftCheck System</div>
                <div>
                  <div className="text-2xl font-bold text-white">Digital Consistency</div>
                  <div className="text-4xl font-extrabold text-primary-300">~6.5 Hours<span className="text-lg font-medium text-primary-200"> of Labor</span></div>
                  <div className="text-sm text-primary-200 font-mono">(@ $15 / hr)</div>
                </div>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Check the quality of every shift, every day. Get <span className="text-white font-bold">unbiased consistency</span> that ensures no shift goes unnoticed.
                </p>
              </div>
            </div>

            <div className="mt-16">
              <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8 font-medium">
                For the price of paying a $15/hr employee for <strong className="text-white">just 6.5 hours</strong>, you can check the quality of every shift, every single day, <strong className="text-white">every month</strong>.
              </p>
              <Link
                to="/auth/verify-email"
                className="inline-block bg-white text-primary-900 px-10 py-4 rounded font-bold hover:bg-gray-100 transition-all shadow-xl"
              >
                Start My Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROI;
