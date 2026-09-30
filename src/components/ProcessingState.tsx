import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const STAGES = [
  { label: 'Analyzing question...', detail: 'Extracting given values, unknown targets, and diagram parameters' },
  { label: 'Understanding concept...', detail: 'Classifying physics branch and generating physical model' },
  { label: 'Preparing solution...', detail: 'Deriving governing formulas and computing step-by-step arithmetic' },
];

export const ProcessingState: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStageIndex(1), 1800);
    const timer2 = setTimeout(() => setCurrentStageIndex(2), 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl p-8 text-center my-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 mb-4 shadow-xs">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight transition-all duration-300">
        {STAGES[currentStageIndex].label}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
        {STAGES[currentStageIndex].detail}
      </p>

      {/* Progress Stage Pills */}
      <div className="flex items-center justify-center gap-2 mt-6 max-w-xs mx-auto">
        {STAGES.map((stage, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              idx <= currentStageIndex ? 'bg-indigo-500' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
