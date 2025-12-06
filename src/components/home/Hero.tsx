import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye,
  Zap
} from 'lucide-react';

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
                to="/demo"
                className="flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
              >
                Request Demo
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

          {/* Interactive Mockup */}
          <div className="lg:w-1/2 relative">
            <div className="relative mx-auto border-gray-200 bg-white border-[8px] rounded-[2rem] h-[600px] w-[340px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5">
              {/* Mobile Status Bar */}
              <div className="bg-white px-6 py-3 flex justify-between items-center text-xs text-gray-900 border-b border-gray-100">
                <span className="font-semibold">9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-900"></div>
                </div>
              </div>

              {/* App Content */}
              <div className="flex-1 bg-gray-50 overflow-y-auto pb-8 relative">

                {/* Positive Header */}
                <div className="bg-white border-b border-gray-200 p-4 mb-4 shadow-sm">
                  <div className="flex items-center gap-2 text-primary-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Zap size={14} /> Current Streak: 12 Days
                  </div>
                  <div className="text-gray-900 font-bold text-sm">Close Checklist: On Track</div>
                </div>

                <div className="px-4 space-y-4">
                  {/* Active Task with Guidance */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 relative shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">Setup Prep Station</h3>
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-sm"></div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Ensure all bins are filled to the max line and labeled.</p>

                    {/* Reference Image Button */}
                    <div className="flex gap-2 mb-3">
                      <button className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 flex items-center gap-1 transition-colors">
                        <Eye size={10} /> View Reference Photo
                      </button>
                    </div>

                    <button className="w-full py-3 bg-primary-500 text-white rounded border border-primary-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                      <Camera size={14} />
                      SNAP CONFIRMATION
                    </button>
                  </div>

                  {/* Completed Task */}
                  <div className="bg-white rounded-lg p-4 border border-success-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-success-100 text-success-700 text-[10px] font-bold px-2 py-1 rounded-bl">APPROVED</div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-sm">Lobby Floors</h3>
                    </div>
                    <div className="h-20 bg-gray-100 rounded-md mb-2 relative overflow-hidden border border-gray-100">
                      <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581578731117-104f8a3d46a8?auto=format&fit=crop&q=80&w=300)' }}></div>
                      <div className="absolute bottom-2 right-2 bg-success-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <CheckCircle2 size={10} /> Perfect
                      </div>
                    </div>
                  </div>

                  {/* Feedback Task */}
                  <div className="bg-white rounded-lg p-4 border border-orange-200 relative shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-sm">Restroom Check</h3>
                    </div>
                    <div className="bg-orange-50 p-2 rounded border border-orange-100 mb-3">
                      <p className="text-xs text-orange-800"><span className="font-bold">Coach's Tip:</span> "Don't forget to wipe the mirror corners!"</p>
                    </div>
                    <button className="w-full py-2 bg-gray-50 text-gray-600 rounded text-xs font-bold flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100">
                      <Camera size={14} />
                      Update Photo
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
