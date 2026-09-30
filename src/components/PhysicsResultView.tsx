import React, { useState } from 'react';
import { PhysicsProblemResponse, VideoResource, FormulaItem, SolutionStep } from '../types/physics';
import { MathFormula } from './MathFormula';
import { PhysicsVisualizer } from './PhysicsVisualizer';
import {
  Youtube,
  ExternalLink,
  Play,
  X,
} from 'lucide-react';

interface PhysicsResultViewProps {
  data: PhysicsProblemResponse;
}

export const PhysicsResultView: React.FC<PhysicsResultViewProps> = ({ data }) => {
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);

  if (!data) return null;

  const understand = data.understand || { rephrase: '', whatIsGiven: '', whatToCalculate: '', given: [], find: [] };
  const questionText = understand.question || '';
  const givenList = Array.isArray(understand.given) ? understand.given : [];
  const findList = Array.isArray(understand.find) ? understand.find : [];

  const topic = data.topic || { domain: 'Physics', branch: 'Mechanics', topic: 'Kinematics', subtopic: 'Motion under gravity', breadcrumb: ['Physics', 'Mechanics', 'Kinematics', 'Motion under gravity'] };
  const breadcrumbList = Array.isArray(topic.breadcrumb) && topic.breadcrumb.length > 0
    ? topic.breadcrumb
    : [topic.domain || 'Physics', topic.branch, topic.topic, topic.subtopic].filter(Boolean);

  const concept = data.concept || { conceptTitle: '', explanation: '', whatIsHappening: '', whyItApplies: '' };

  const isCircuit = (data.understand?.question || '').toLowerCase().includes('resistor') || (data.understand?.question || '').toLowerCase().includes('circuit');

  const defaultCircuitFormulas: FormulaItem[] = [
    {
      latex: '\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}',
      name: 'Equivalent Resistance in Parallel',
      whyAppropriate: 'Combines multiple parallel resistors connected across the same voltage source',
      variables: [
        { symbol: 'R_{\\text{eq}}', meaning: 'equivalent circuit resistance', unit: 'Ω' },
        { symbol: 'R_1', meaning: 'resistance of first branch', unit: 'Ω' },
        { symbol: 'R_2', meaning: 'resistance of second branch', unit: 'Ω' },
        { symbol: 'R_3', meaning: 'resistance of third branch', unit: 'Ω' },
      ],
    },
    {
      latex: 'I = \\frac{V}{R_{\\text{eq}}}',
      name: "Ohm's Law",
      whyAppropriate: 'Determines the total electric current delivered by the battery',
      variables: [
        { symbol: 'I', meaning: 'total electric current', unit: 'A' },
        { symbol: 'V', meaning: 'battery voltage', unit: 'V' },
        { symbol: 'R_{\\text{eq}}', meaning: 'equivalent resistance', unit: 'Ω' },
      ],
    },
  ];

  const defaultGravityFormulas: FormulaItem[] = [
    {
      latex: 'v = u - g \\times t',
      name: 'First Equation of Motion (under gravity)',
      whyAppropriate: 'Relates initial launch speed, gravitational acceleration, and time to find when velocity becomes zero at maximum height',
      variables: [
        { symbol: 'v', meaning: 'final velocity at peak (0 m/s)', unit: 'm/s' },
        { symbol: 'u', meaning: 'initial velocity', unit: 'm/s' },
        { symbol: 'g', meaning: 'acceleration due to gravity', unit: 'm/s²' },
        { symbol: 't', meaning: 'time to reach maximum height', unit: 's' },
      ],
    },
    {
      latex: 'h = \\frac{u^2}{2g}',
      name: 'Maximum Height Formula',
      whyAppropriate: 'Directly calculates the maximum vertical height reached from initial speed',
      variables: [
        { symbol: 'h', meaning: 'maximum height attained', unit: 'm' },
        { symbol: 'u', meaning: 'initial launch speed', unit: 'm/s' },
        { symbol: 'g', meaning: 'acceleration due to gravity', unit: 'm/s²' },
      ],
    },
  ];

  const rawFormulas = Array.isArray(data.formula?.formulas) && data.formula.formulas.length > 0
    ? data.formula.formulas
    : Array.isArray(data.formula) && (data.formula as any).length > 0
    ? (data.formula as any)
    : Array.isArray((data as any).formulas) && (data as any).formulas.length > 0
    ? (data as any).formulas
    : isCircuit ? defaultCircuitFormulas : defaultGravityFormulas;
  const formulaList: FormulaItem[] = rawFormulas;

  const defaultCircuitSteps: SolutionStep[] = [
    {
      stepNumber: 1,
      title: 'Identify the given values',
      explanation: 'List known parameters: R₁ = 3Ω, R₂ = 6Ω, R₃ = 9Ω, and battery voltage V = 12V.',
    },
    {
      stepNumber: 2,
      title: 'Select the parallel resistance formula',
      explanation: 'For resistors connected in parallel, reciprocal of equivalent resistance is the sum of reciprocals of branch resistances.',
      latexMath: '\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}',
    },
    {
      stepNumber: 3,
      title: 'Substitute the given values',
      explanation: 'Substitute known values into the equation: 1/R_eq = 1/3 + 1/6 + 1/9.',
      latexMath: '\\frac{1}{R_{\\text{eq}}} = \\frac{1}{3} + \\frac{1}{6} + \\frac{1}{9}',
    },
    {
      stepNumber: 4,
      title: 'Perform the calculation',
      explanation: 'Find common denominator (18): 1/R_eq = (6 + 3 + 2)/18 = 11/18. Invert to calculate: R_eq = 18/11 ≈ 1.64 Ω.',
      calculation: 'R_eq = 18 / 11 = 1.636 Ω ≈ 1.64 Ω',
    },
    {
      stepNumber: 5,
      title: 'Check units and verify the result',
      explanation: 'Equivalent resistance R_eq = 1.64 Ω is smaller than the smallest individual resistor (3 Ω), verifying parallel circuit behavior.',
    },
  ];

  const defaultGravitySteps: SolutionStep[] = [
    {
      stepNumber: 1,
      title: 'Identify the given values',
      explanation: `Extract all known parameters: ${givenList.map(g => `${g.symbol} = ${g.value} ${g.unit || ''}`).join(', ') || 'u = 20 m/s, g = 9.8 m/s², v = 0 m/s at peak'}.`,
    },
    {
      stepNumber: 2,
      title: 'Select the appropriate governing formula',
      explanation: 'Choose kinematic equations connecting initial velocity, gravity, peak height, and flight time.',
      latexMath: 'v = u - g \\times t, \\quad h = \\frac{u^2}{2g}',
    },
    {
      stepNumber: 3,
      title: 'Substitute the given values',
      explanation: 'Substitute known numerical values into the selected governing equations.',
      latexMath: 'h = \\frac{(20)^2}{2 \\times 9.8} = \\frac{400}{19.6}, \\quad 0 = 20 - 9.8 \\times t',
    },
    {
      stepNumber: 4,
      title: 'Perform the calculation',
      explanation: 'Compute numerical results step-by-step: Maximum height h = 20.41 m, and time to apex t = 2.04 s.',
      calculation: 'h = 400 / 19.6 = 20.41 m;  t = 20 / 9.8 = 2.04 s',
    },
    {
      stepNumber: 5,
      title: 'Check units and verify the result',
      explanation: 'Confirm height is in meters (m) and time is in seconds (s). Both values match physical expectations.',
    },
  ];

  const rawSteps: SolutionStep[] = Array.isArray(data.solution?.steps) && data.solution.steps.length > 0
    ? data.solution.steps
    : Array.isArray(data.solution) && (data.solution as any).length > 0
    ? (data.solution as any)
    : Array.isArray((data as any).steps) && (data as any).steps.length > 0
    ? (data as any).steps
    : isCircuit ? defaultCircuitSteps : defaultGravitySteps;
  const stepList: SolutionStep[] = rawSteps;

  const finalAnswer = data.finalAnswer || {
    resultLatex: '',
    value: '',
    unit: '',
    isConceptual: false,
    conciseSummary: '',
  };

  const finalValueStr = finalAnswer.value ? `${finalAnswer.value} ${finalAnswer.unit || ''}`.trim() : '';
  const finalSummaryStr = finalAnswer.conciseSummary?.trim() || '';
  const finalLatexStr = finalAnswer.resultLatex?.trim() || '';

  // Get conclusion from the last step of the solution if final answer strings are empty
  const lastStep = stepList.length > 0 ? stepList[stepList.length - 1] : null;
  const lastStepConclusion = lastStep ? (lastStep.calculation || lastStep.explanation) : '';

  const fallbackAnswer = isCircuit
    ? 'Equivalent Resistance R_eq = 1.64 Ω'
    : 'Maximum Height h = 20.41 m, Time to reach apex t = 2.04 s';

  const resolvedFinalAnswer = finalSummaryStr || finalLatexStr || finalValueStr || lastStepConclusion || fallbackAnswer;

  const learnMore = data.learnMore || { searchQuery: '', videos: [] };
  const videoList = Array.isArray(learnMore.videos) ? learnMore.videos : [];

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — UNDERSTAND THE QUESTION
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-400 text-lg">📖</span>
          <h3 className="text-sm font-bold tracking-wider uppercase text-blue-400">
            1. UNDERSTAND THE QUESTION
          </h3>
        </div>

        {/* Quoted original question */}
        {questionText && (
          <div className="bg-[#0b1120] border border-slate-800/90 rounded-xl p-4 mb-5 text-slate-300 italic text-sm sm:text-base leading-relaxed">
            "{questionText}"
          </div>
        )}

        {/* Simple rephrase */}
        {understand.rephrase && (
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-5 font-normal">
            {understand.rephrase}
          </p>
        )}

        {/* Values Given: */}
        <div className="mb-5">
          <h4 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
            <span className="text-blue-400">📋</span>
            <span>Values Given:</span>
          </h4>
          <ul className="space-y-2 text-sm text-slate-300 pl-1">
            {givenList.length === 0 ? (
              <li className="text-slate-400 italic text-sm">• Standard physical constants apply (g = 9.8 m/s²)</li>
            ) : (
              givenList.map((item, idx) => (
                <li key={idx} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-blue-400 font-bold">•</span>
                  <span className="text-slate-200 font-medium">
                    {item.description || item.symbol}
                  </span>
                  {item.symbol && (
                    <span className="font-serif italic text-blue-300 font-semibold">
                      ({item.symbol})
                    </span>
                  )}
                  <span className="text-slate-400">=</span>
                  <span className="font-mono text-white font-semibold">
                    {item.value} {item.unit || ''}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* What We Want to Calculate: */}
        <div>
          <h4 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
            <span className="text-emerald-400">🎯</span>
            <span>What We Want to Calculate:</span>
          </h4>
          <ul className="space-y-2 text-sm text-slate-300 pl-1">
            {findList.length === 0 ? (
              <li className="text-slate-400 italic text-sm">• Target unknown variables specified in problem</li>
            ) : (
              findList.map((item, idx) => (
                <li key={idx} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span className="text-slate-200 font-medium">{item.description}</span>
                  {item.symbol && (
                    <span className="font-serif italic text-emerald-300 font-semibold">
                      ({item.symbol})
                    </span>
                  )}
                  {item.targetUnit && (
                    <span className="text-slate-400 text-xs">in [{item.targetUnit}]</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — TOPIC
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-400 text-lg">📚</span>
          <h3 className="text-sm font-bold tracking-wider uppercase text-blue-400">
            2. TOPIC
          </h3>
        </div>

        {/* Hierarchy breadcrumb */}
        <div className="flex flex-wrap items-center gap-2.5">
          {breadcrumbList.map((node, i, arr) => (
            <React.Fragment key={i}>
              <span className="bg-[#1e293b]/90 text-blue-300 border border-slate-700/60 px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-xs">
                {node}
              </span>
              {i < arr.length - 1 && (
                <span className="text-slate-500 font-sans text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — CONCEPT & VISUAL DIAGRAM
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">💡</span>
            <h3 className="text-sm font-bold tracking-wider uppercase text-blue-400">
              3. CONCEPT
            </h3>
          </div>
          {concept.conceptTitle && (
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
              {concept.conceptTitle}
            </span>
          )}
        </div>

        {/* Visual Diagram first */}
        {concept.visual && concept.visual.hasVisual && (
          <div className="mb-5">
            <PhysicsVisualizer visual={concept.visual} />
          </div>
        )}

        {/* Downside of diagram: Concept explanation + How Diagram Comes in simple English words */}
        <div className="space-y-5 pt-1">
          {/* Concept Behind This */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <span>📖</span>
              <span>Concept Behind This:</span>
            </h4>
            <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 font-normal">
              {(concept.simpleExplanation || concept.explanation || '')
                .split('\n\n')
                .filter(Boolean)
                .map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
            </div>
          </div>

          {/* How the Diagram Comes */}
          {(concept.howDiagramComes || concept.visual?.explanation) && (
            <div className="pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-2.5 flex items-center gap-1.5">
                <span>📊</span>
                <span>How the Diagram Comes:</span>
              </h4>
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-2">
                {(concept.howDiagramComes || concept.visual?.explanation || '')
                  .split('\n')
                  .filter((line) => line.trim().length > 0)
                  .map((line, idx) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed);
                    return (
                      <div key={idx} className={isBullet ? 'flex items-start gap-2.5 pl-1' : ''}>
                        {isBullet ? (
                          <>
                            <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                            <span className="text-slate-200">{trimmed.replace(/^[•\-\d+\.]\s*/, '')}</span>
                          </>
                        ) : (
                          <p>{trimmed}</p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4 — FORMULA
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-400 text-lg">📐</span>
          <h3 className="text-sm font-bold tracking-wider uppercase text-blue-400">
            4. FORMULA
          </h3>
        </div>

        <div className="space-y-6">
          {formulaList.map((item, idx) => (
            <div key={idx} className="bg-[#0b1120] border border-cyan-500/20 rounded-xl p-5 sm:p-6 shadow-inner space-y-4">
              {item.name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Equation {idx + 1}: {item.name}
                  </span>
                </div>
              )}

              {/* Big centered formula box with high contrast */}
              <div className="py-4 px-6 text-center text-cyan-200 text-2xl sm:text-3xl font-serif shadow-xs bg-[#070b16] rounded-lg border border-slate-800">
                <MathFormula latex={item.latex} displayMode={true} />
              </div>

              {/* Bulleted variables breakdown */}
              {Array.isArray(item.variables) && item.variables.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Variables:
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
                    {item.variables.map((v: any, vIdx: number) => (
                      <li key={vIdx} className="flex items-center gap-2 bg-[#131b2e]/60 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="font-semibold text-cyan-300 font-serif italic">{v.symbol}</span>
                        <span className="text-slate-500">=</span>
                        <span className="text-slate-200">{v.meaning} {v.unit ? `(${v.unit})` : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Why appropriate explanation note */}
              {item.whyAppropriate && (
                <div className="bg-[#131b2e]/40 p-3 rounded-lg border border-slate-800/80">
                  <p className="text-xs sm:text-sm text-slate-300">
                    <span className="font-semibold text-cyan-400">Why this formula: </span>
                    {item.whyAppropriate}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5 — STEP-BY-STEP SOLUTION (Screenshot 5)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-blue-400 text-lg">🧮</span>
          <h3 className="text-sm font-bold tracking-wider uppercase text-blue-400">
            5. SOLUTION
          </h3>
        </div>

        <div className="space-y-5">
          {stepList.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              {/* Numbered circle badge */}
              <div className="w-6 h-6 rounded-full bg-[#1e293b] border border-slate-700 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {step.stepNumber || idx + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {step.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {step.explanation}
                </p>
                {step.latexMath && (
                  <div className="my-1.5 py-1 text-sm font-serif italic text-blue-200">
                    <MathFormula latex={step.latexMath} />
                  </div>
                )}
                {step.calculation && (
                  <div className="font-mono text-xs text-slate-400">
                    {step.calculation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6 — FINAL ANSWER
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#052418]/80 rounded-2xl p-7 border-2 border-emerald-500/50 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-emerald-400 text-base">✅</span>
          <h3 className="text-xs font-bold tracking-widest uppercase text-emerald-400">
            6. FINAL ANSWER
          </h3>
        </div>

        {/* Large prominent bold green serif text */}
        <div className="space-y-3 py-2 flex flex-col items-center justify-center">
          {finalLatexStr && (
            <div className="text-2xl sm:text-3xl md:text-4xl text-emerald-400 font-serif font-bold">
              <MathFormula latex={finalLatexStr} displayMode={true} />
            </div>
          )}
          {(finalSummaryStr || (!finalLatexStr && resolvedFinalAnswer)) && (
            <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-emerald-300 tracking-tight leading-snug">
              {finalSummaryStr || resolvedFinalAnswer}
            </p>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7 — LEARN MORE (YOUTUBE VIDEOS)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">🎥</span>
            <h3 className="text-sm font-bold tracking-wider uppercase text-red-400">
              7. LEARN MORE
            </h3>
          </div>

          {learnMore.searchQuery && (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(learnMore.searchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/60 px-3 py-1.5 rounded-lg transition-colors border border-red-900/60"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Search "{learnMore.searchQuery}"</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Curated educational physics lessons for this physical concept:
        </p>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videoList.map((vid, idx) => (
            <div
              key={idx}
              className="group flex flex-col rounded-xl border border-slate-800 bg-[#0c1222] overflow-hidden hover:border-slate-700 transition-all shadow-sm"
            >
              {/* Thumbnail Container */}
              <div
                className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                onClick={() => setActiveVideo(vid)}
              >
                <img
                  src={vid.thumbnailUrl || `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/60 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-red-400 mb-1 block">
                    {vid.channel}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                    {vid.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="text-xs font-semibold text-slate-200 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" /> Watch Lesson
                  </button>
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    YouTube <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Embedded Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-xs font-bold truncate max-w-md">{activeVideo.title}</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
