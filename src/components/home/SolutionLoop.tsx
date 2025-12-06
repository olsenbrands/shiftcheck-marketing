import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  ListChecks,
  Repeat,
  Smartphone,
  UserCheck
} from 'lucide-react';

const SolutionLoop = () => {
  const steps = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "1. The Assignment",
      desc: "Checklists auto-populate on the store device. The team sees exactly what they need to work on in-between helping guests.",
      color: "text-primary-600"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "2. The Proof",
      desc: "Instead of checking off a paper checklist, they snap a photo. Real proof that the job was done to standard.",
      color: "text-purple-500"
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "3. The Lead Audit",
      desc: "Shift Leads review tasks before submitting and report on team hustle—noting who is excelling on shift, and flagging those who are struggling or who are on their phone.",
      color: "text-orange-500"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "4. The Manager Grade",
      desc: "Managers grade tasks as 'Passed', 'Exceptional', or 'Failed'. Failed tasks go back to the team device to be fixed immediately and resubmitted.",
      color: "text-success-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 md:text-center max-w-3xl md:mx-auto">
          <h2 className="text-primary-600 font-mono text-xs tracking-widest uppercase mb-4">The ShiftCheck Workflow</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">How does ShiftCheck work?</h3>
          <p className="text-lg text-gray-500">
            A simple, repeatable loop that ensures standards are met before the shift ends.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-gray-200 via-primary-200 to-gray-200 z-0"></div>

          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 transition-all group shadow-sm hover:shadow-md">
                <div className={`w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center ${step.color} font-bold mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customization / Total Control Section */}
        <div className="mt-24 grid lg:grid-cols-12 gap-12 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="lg:col-span-7 p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Total Customization. Your Store, Your Schedule.</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Owners and Managers can make as many checklists as they like. Assign them to repeat weekly, or on certain days of the week. Create Deep Clean tasks that repeat weekly, bi-weekly, or monthly. Whatever works best for your restaurant.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-200 shrink-0">
                  <ListChecks size={16} />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-sm mb-1">Morning Prep</h4>
                  <p className="text-xs text-gray-500">"Prep extra veggies before the lunch rush."</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-200 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-sm mb-1">Mid-Day Check</h4>
                  <p className="text-xs text-gray-500">"Check bathrooms after the lunch rush."</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-sm mb-1">Evening Stock</h4>
                  <p className="text-xs text-gray-500">"Stock napkins and paper products before dinner."</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
                  <Repeat size={16} />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-sm mb-1">Closing & Deep Cleans</h4>
                  <p className="text-xs text-gray-500">"Sweep & mop the lobby, and dust the top of the drink fridge."</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 bg-white border-l border-gray-200 p-8 flex flex-col justify-center relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
              <CalendarDays size={120} />
            </div>
            <div className="relative z-10">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Manager Control</div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Assign Checklists to:</h4>
              <ul className="space-y-3">
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-gray-700 text-sm">Openers (5:00 - 11:00 AM)</span>
                  <span className="w-2 h-2 rounded-full bg-success-500"></span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-gray-700 text-sm">Afternoon (11:00 - 3:00 PM)</span>
                  <span className="w-2 h-2 rounded-full bg-success-500"></span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-gray-700 text-sm">Evening (3:00 - 7:00 PM)</span>
                  <span className="w-2 h-2 rounded-full bg-success-500"></span>
                </li>
                <li className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-gray-700 text-sm">Closers (7:00 - 11:00 PM)</span>
                  <span className="w-2 h-2 rounded-full bg-success-500"></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionLoop;
