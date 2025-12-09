import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.6] pointer-events-none bg-grid h-full"></div>

      <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-bl from-primary-50 to-white -z-10 rounded-bl-[100px] opacity-60"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          <div className="lg:w-1/2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-50 border border-primary-200 text-primary-600 text-xs font-mono mb-8 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Proof, Not Promises
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tighter mb-6 leading-[0.95]">
              Run Your Store <br />
              <span className="text-primary-500">Your Way.</span> <br />
              Every. Single. Shift.
            </h1>

            <p className="text-xl text-gray-500 max-w-xl leading-relaxed mb-10 border-l-4 border-primary-500 pl-6">
              Your restaurant employees want to succeed—they just need a clear system. ShiftCheck provides the <b>visual standards</b> and <b>automated guidance</b> to turn "I didn't know" into "Here's what I did."
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/auth/verify-email"
                className="flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/solution"
                className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-300 px-8 py-4 rounded font-bold hover:bg-gray-50 transition-all hover:text-gray-900"
              >
                See The Difference
              </Link>
            </div>
          </div>

          {/* Phone Frame with Scrollable Screen */}
          <div className="lg:w-1/2 relative">
            <div className="relative mx-auto bg-gray-900 border-[12px] border-gray-900 rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl ring-1 ring-black/10">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-b-2xl z-20"></div>

              {/* Screen Area - Scrollable */}
              <div
                className="absolute inset-0 rounded-[1.5rem] overflow-y-auto overflow-x-hidden bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                <img
                  src="/images/app-screenshot.png"
                  alt="ShiftCheck App - Active Checklists"
                  className="w-full"
                  draggable={false}
                />
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full z-20"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
