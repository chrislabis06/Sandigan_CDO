import React from 'react';
import { Users, Compass, TreePine, Zap, MapPin } from 'lucide-react';

interface HeroProps {
  totalDrives: number;
  totalJoined: number;
  totalCapacity: number;
}

export const Hero: React.FC<HeroProps> = ({ totalDrives, totalJoined }) => {
  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Catchphrase Header */}
      <div className="max-w-4xl space-y-3 sm:space-y-4">
        <p className="text-base sm:text-lg font-semibold text-emerald-600">
          Welcome to Sandigan
        </p>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
          See a need. Spark a cause.{' '}
          <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy decoration-2">
            Stand together.
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-normal">
          The AI-powered grassroots platform where local ideas in Cagayan de Oro and Bukidnon become active volunteer drives in seconds.
        </p>
      </div>

      {/* Grassroots Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 bg-white/70 backdrop-blur-sm border border-slate-200/90 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {totalDrives}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Drives</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {totalJoined}
            </div>
            <div className="text-xs text-slate-500 font-medium">Volunteers Joined</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              18+
            </div>
            <div className="text-xs text-slate-500 font-medium">Barangays & Towns</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 leading-tight flex items-center gap-1">
              &lt; 5s
            </div>
            <div className="text-xs text-slate-500 font-medium">AI Turnaround</div>
          </div>
        </div>
      </div>
    </section>
  );
};
