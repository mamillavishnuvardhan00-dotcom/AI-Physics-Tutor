import React from 'react';
import { VisualData } from '../types/physics';

interface PhysicsVisualizerProps {
  visual: VisualData;
}

export const PhysicsVisualizer: React.FC<PhysicsVisualizerProps> = ({ visual }) => {
  if (!visual || !visual.hasVisual) return null;

  const renderDiagramContent = () => {
    // If a custom SVG generated specifically for this problem is available, render it directly!
    if (visual.svgMarkup && visual.svgMarkup.trim().length > 15) {
      return renderCustomSvg(visual.svgMarkup);
    }

    switch (visual.type) {
      case 'custom_svg':
        return renderCustomSvg(visual.svgMarkup);
      case 'vertical_motion':
        return renderVerticalMotion(visual.params);
      case 'linear_motion':
        return renderLinearMotion(visual.params);
      case 'projectile':
        return renderProjectile(visual.params);
      case 'free_body':
        return renderFreeBody(visual.params);
      case 'graph_vt':
      case 'graph_xt':
      case 'graph_at':
        return renderKinematicsGraph(visual.type, visual.params);
      case 'circuit':
        return renderCircuit(visual.params, visual);
      case 'ray_optics':
        return renderRayOptics(visual.params);
      case 'wave':
        return renderWave(visual.params);
      case 'energy_bar':
        return renderEnergyBar(visual.params);
      case 'incline_plane':
        return renderInclinePlane(visual.params);
      default:
        if (visual.params?.angleDeg && visual.params?.v0) {
          return renderProjectile(visual.params);
        }
        if (visual.params?.initialVelocity || visual.params?.v0) {
          return renderVerticalMotion(visual.params);
        }
        return renderKinematicsGraph('graph_vt', visual.params);
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-slate-800 bg-[#0c1222] p-4 transition-all">
      {/* SVG Canvas Area */}
      <div className="relative flex justify-center py-2">
        <svg
          viewBox="0 0 500 280"
          className="w-full max-w-[620px] h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="arrow-blue"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#60a5fa" />
            </marker>
            <marker
              id="arrow-emerald"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
            </marker>
            <marker
              id="arrow-rose"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker
              id="arrow-amber"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
            </marker>
            <marker
              id="arrow-dark"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <pattern id="dark-grid" width="40" height="35" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 35" fill="none" stroke="#1e293b" strokeWidth="1" strokeOpacity="0.8" />
            </pattern>
          </defs>

          {renderDiagramContent()}
        </svg>
      </div>

      {/* Caption directly matching Screenshot 3 */}
      {(visual.caption || visual.explanation) && (
        <div className="mt-3 text-center text-xs text-slate-400 font-sans tracking-wide">
          {visual.caption || visual.explanation}
        </div>
      )}
    </div>
  );
};

// 1. Kinematics Graph (v-t) - dynamic axis ticks
function renderKinematicsGraph(type: string, params?: any) {
  const yAxisLabel = type === 'graph_vt' ? 'velocity (m/s)' : type === 'graph_xt' ? 'position (m)' : 'acceleration (m/s²)';
  const initialV = parseFloat(String(params?.initialVelocity ?? '20').replace(/[^\d.]/g, '')) || 20;
  const timeSpan = parseFloat(String(params?.timeSpan ?? (initialV / 9.8)).replace(/[^\d.]/g, '')) || 2.04;

  const vTicks = [
    initialV.toFixed(0),
    (initialV * 0.75).toFixed(0),
    (initialV * 0.5).toFixed(0),
    (initialV * 0.25).toFixed(0),
    '0',
  ];

  const tTicks = [
    '0',
    (timeSpan * 0.25).toFixed(1),
    (timeSpan * 0.5).toFixed(1),
    (timeSpan * 0.75).toFixed(1),
    timeSpan.toFixed(1),
  ];

  return (
    <g>
      {/* Background grid */}
      <rect x="70" y="25" width="400" height="190" fill="url(#dark-grid)" />

      {/* Grid lines horizontal */}
      <line x1="70" y1="25" x2="470" y2="25" stroke="#1e293b" strokeWidth="1" />
      <line x1="70" y1="72" x2="470" y2="72" stroke="#1e293b" strokeWidth="1" />
      <line x1="70" y1="120" x2="470" y2="120" stroke="#1e293b" strokeWidth="1" />
      <line x1="70" y1="168" x2="470" y2="168" stroke="#1e293b" strokeWidth="1" />
      <line x1="70" y1="215" x2="470" y2="215" stroke="#334155" strokeWidth="1.5" />

      {/* Grid lines vertical */}
      <line x1="70" y1="25" x2="70" y2="215" stroke="#334155" strokeWidth="1.5" />
      <line x1="150" y1="25" x2="150" y2="215" stroke="#1e293b" strokeWidth="1" />
      <line x1="230" y1="25" x2="230" y2="215" stroke="#1e293b" strokeWidth="1" />
      <line x1="310" y1="25" x2="310" y2="215" stroke="#1e293b" strokeWidth="1" />
      <line x1="390" y1="25" x2="390" y2="215" stroke="#1e293b" strokeWidth="1" />
      <line x1="470" y1="25" x2="470" y2="215" stroke="#1e293b" strokeWidth="1" />

      {/* Y-axis Ticks and Values */}
      <text x="60" y="30" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="sans-serif">{vTicks[0]}</text>
      <text x="60" y="77" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="sans-serif">{vTicks[1]}</text>
      <text x="60" y="125" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="sans-serif">{vTicks[2]}</text>
      <text x="60" y="173" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="sans-serif">{vTicks[3]}</text>
      <text x="60" y="220" fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="sans-serif">{vTicks[4]}</text>

      {/* X-axis Ticks and Values */}
      <text x="70" y="235" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">{tTicks[0]}</text>
      <text x="150" y="235" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">{tTicks[1]}</text>
      <text x="230" y="235" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">{tTicks[2]}</text>
      <text x="310" y="235" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">{tTicks[3]}</text>
      <text x="390" y="235" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">{tTicks[4]}</text>

      {/* Rotated Y-axis title */}
      <text
        x="-120"
        y="25"
        fill="#cbd5e1"
        fontSize="12"
        fontWeight="500"
        fontFamily="sans-serif"
        transform="rotate(-90)"
        textAnchor="middle"
      >
        {yAxisLabel}
      </text>

      {/* X-axis title */}
      <text
        x="270"
        y="262"
        fill="#cbd5e1"
        fontSize="12"
        fontWeight="500"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        time (s)
      </text>

      {/* Decreasing Velocity Line */}
      <line
        x1="70"
        y1="25"
        x2="470"
        y2="215"
        stroke="#93c5fd"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Starting point and ending dot */}
      <circle cx="70" cy="25" r="4" fill="#93c5fd" />
      <circle cx="470" cy="215" r="4" fill="#93c5fd" />
    </g>
  );
}

// 2. Projectile Trajectory Diagram (Dynamically and accurately computed)
function renderProjectile(params?: any) {
  const v0Num = parseFloat(String(params?.v0 ?? '30').replace(/[^\d.]/g, '')) || 30;
  const angleNum = parseFloat(String(params?.angleDeg ?? params?.angle ?? '45').replace(/[^\d.]/g, '')) || 45;
  const g = 9.8;
  const rad = (angleNum * Math.PI) / 180;

  // Real physical values calculated directly
  const hCalc = (Math.pow(v0Num, 2) * Math.pow(Math.sin(rad), 2)) / (2 * g);
  const rCalc = (Math.pow(v0Num, 2) * Math.sin(2 * rad)) / g;
  const tCalc = (2 * v0Num * Math.sin(rad)) / g;

  const maxH = params?.maxH && !String(params.maxH).includes('20.4')
    ? String(params.maxH)
    : `${hCalc.toFixed(1)} m`;
  const range = params?.range && !String(params.range).includes('40.8')
    ? String(params.range)
    : `${rCalc.toFixed(1)} m`;
  const timeOfFlight = params?.timeOfFlight
    ? String(params.timeOfFlight)
    : `${tCalc.toFixed(2)} s`;

  // Dynamic vector angle: length 55px pointing at angleNum degrees above ground
  const vecLen = 55;
  const vecX = 75 + vecLen * Math.cos(rad);
  const vecY = 225 - vecLen * Math.sin(rad);

  return (
    <g>
      <rect x="50" y="25" width="420" height="200" fill="url(#dark-grid)" />
      
      {/* Ground line */}
      <line x1="50" y1="225" x2="470" y2="225" stroke="#475569" strokeWidth="2.5" />

      {/* Parabolic Trajectory curve: apex at (255, 70), control point at (255, -85) */}
      <path
        d="M 75 225 Q 255 -85 435 225"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Apex point seated EXACTLY on curve peak */}
      <circle cx="255" cy="70" r="5" fill="#f43f5e" />
      <line x1="255" y1="70" x2="255" y2="225" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="265" y="145" fill="#f43f5e" fontSize="12" fontWeight="700" fontFamily="sans-serif">
        H_max = {maxH}
      </text>

      {/* Launch velocity vector */}
      <line x1="75" y1="225" x2={vecX} y2={vecY} stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
      <text x={vecX + 6} y={vecY - 4} fill="#60a5fa" fontSize="12" fontWeight="700" fontFamily="sans-serif">
        v₀ = {v0Num} m/s
      </text>

      {/* Angle arc */}
      <path d="M 105 225 A 30 30 0 0 0 98 203" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <text x="112" y="215" fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="sans-serif">
        θ = {angleNum}°
      </text>

      {/* Range and Time of flight indicator */}
      <line x1="75" y1="250" x2="435" y2="250" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="255" y="265" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
        Range R = {range}   |   Time of Flight = {timeOfFlight}
      </text>
    </g>
  );
}

// 3. Free-Body Diagram (FBD)
function renderFreeBody(params?: any) {
  const massLabel = params?.mass ? `m = ${params.mass}` : 'Mass (m)';
  const defaultForces = [
    { name: 'F_N', label: 'Normal Force (F_N)', direction: 'up', color: '#34d399' },
    { name: 'F_g', label: 'Gravity (mg)', direction: 'down', color: '#f43f5e' },
    { name: 'F_app', label: 'Applied Force (F)', direction: 'right', color: '#60a5fa' },
    { name: 'f_k', label: 'Friction (f)', direction: 'left', color: '#fbbf24' },
  ];

  let forces: any[] = defaultForces;
  if (Array.isArray(params?.forces) && params.forces.length > 0) {
    forces = params.forces;
  } else if (params?.forces && typeof params.forces === 'object') {
    forces = Object.entries(params.forces).map(([key, val]: [string, any]) => ({
      name: key,
      label: typeof val === 'string' ? val : val?.label || key,
      direction: val?.direction || 'up',
      color: val?.color || '#60a5fa',
    }));
  }

  return (
    <g>
      {/* Coordinate axes in top left */}
      <g transform="translate(60, 45)">
        <line x1="0" y1="20" x2="35" y2="20" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-dark)" />
        <line x1="0" y1="20" x2="0" y2="-15" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-dark)" />
        <text x="40" y="24" fill="#94a3b8" fontSize="10" fontWeight="600">+x</text>
        <text x="-4" y="-20" fill="#94a3b8" fontSize="10" fontWeight="600">+y</text>
      </g>

      {/* Center Body (Block) */}
      <rect
        x="215"
        y="110"
        width="70"
        height="60"
        rx="8"
        fill="#1e293b"
        stroke="#818cf8"
        strokeWidth="2"
      />
      <circle cx="250" cy="140" r="4" fill="#818cf8" />
      <text x="250" y="145" fill="#f8fafc" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        {massLabel}
      </text>

      {/* Render Forces */}
      {forces.map((f: any, i: number) => {
        const dir = f.direction || 'up';
        const color = f.color || '#60a5fa';
        const marker =
          color === '#34d399'
            ? 'url(#arrow-emerald)'
            : color === '#f43f5e'
            ? 'url(#arrow-rose)'
            : color === '#fbbf24'
            ? 'url(#arrow-amber)'
            : 'url(#arrow-blue)';

        if (dir === 'up') {
          return (
            <g key={i}>
              <line x1="250" y1="110" x2="250" y2="40" stroke={color} strokeWidth="2.5" markerEnd={marker} />
              <text x="258" y="55" fill={color} fontSize="11" fontWeight="700" fontFamily="sans-serif">
                {f.label || f.name}
              </text>
            </g>
          );
        }
        if (dir === 'down') {
          return (
            <g key={i}>
              <line x1="250" y1="170" x2="250" y2="240" stroke={color} strokeWidth="2.5" markerEnd={marker} />
              <text x="258" y="230" fill={color} fontSize="11" fontWeight="700" fontFamily="sans-serif">
                {f.label || f.name}
              </text>
            </g>
          );
        }
        if (dir === 'right') {
          return (
            <g key={i}>
              <line x1="285" y1="140" x2="365" y2="140" stroke={color} strokeWidth="2.5" markerEnd={marker} />
              <text x="310" y="130" fill={color} fontSize="11" fontWeight="700" fontFamily="sans-serif">
                {f.label || f.name}
              </text>
            </g>
          );
        }
        if (dir === 'left') {
          return (
            <g key={i}>
              <line x1="215" y1="140" x2="135" y2="140" stroke={color} strokeWidth="2.5" markerEnd={marker} />
              <text x="140" y="130" fill={color} fontSize="11" fontWeight="700" fontFamily="sans-serif">
                {f.label || f.name}
              </text>
            </g>
          );
        }
        return null;
      })}
    </g>
  );
}

// 4. Circuit Diagram (Supports single, series, and parallel multi-branch circuits)
function renderCircuit(params?: any, visualContext?: any) {
  const voltage = params?.voltage ?? '12V';
  const rawResistors = params?.resistors || params?.components;
  const contextStr = `${params?.type || ''} ${params?.caption || ''} ${visualContext?.title || ''} ${visualContext?.caption || ''} ${visualContext?.explanation || ''}`.toLowerCase();

  // Any indicator of parallel makes it a parallel circuit
  const isParallel =
    params?.type === 'parallel' ||
    params?.isParallel === true ||
    contextStr.includes('parallel') ||
    (!contextStr.includes('series') && (Array.isArray(rawResistors) ? rawResistors.length > 1 : true));

  const isSeries =
    params?.type === 'series' ||
    contextStr.includes('series');

  const defaultResistors = [
    { label: 'R₁ = 3Ω', value: '3Ω' },
    { label: 'R₂ = 6Ω', value: '6Ω' },
    { label: 'R₃ = 9Ω', value: '9Ω' },
  ];

  const resistors: Array<{ label: string; value?: string }> = Array.isArray(rawResistors) && rawResistors.length > 0
    ? rawResistors.map((r: any, idx: number) => ({
        label: typeof r === 'string' ? r : r.label || (r.symbol ? `${r.symbol} = ${r.value || ''}${r.unit || 'Ω'}` : `R${idx + 1} = ${r.value || 'Ω'}`),
        value: r.value || '',
      }))
    : defaultResistors;

  if (isParallel && resistors.length >= 2) {
    // Multi-branch parallel circuit
    const numBranches = Math.min(resistors.length, 3);
    const branchY = numBranches === 3 ? [50, 105, 160] : [65, 145];

    return (
      <g transform="translate(40, 25)">
        {/* Main battery on left */}
        <line x1="40" y1={branchY[0]} x2="40" y2="90" stroke="#475569" strokeWidth="2.5" />
        <line x1="40" y1="120" x2="40" y2={branchY[branchY.length - 1]} stroke="#475569" strokeWidth="2.5" />

        {/* Battery plates */}
        <line x1="28" y1="92" x2="52" y2="92" stroke="#f43f5e" strokeWidth="3" />
        <line x1="33" y1="104" x2="47" y2="104" stroke="#94a3b8" strokeWidth="3" />
        <text x="14" y="95" fill="#f43f5e" fontSize="11" fontWeight="700">+</text>
        <text x="16" y="108" fill="#94a3b8" fontSize="11" fontWeight="700">-</text>
        <text x="6" y="128" fill="#38bdf8" fontSize="12" fontWeight="700">{voltage}</text>

        {/* Left distribution rail */}
        <line x1="40" y1={branchY[0]} x2="140" y2={branchY[0]} stroke="#475569" strokeWidth="2.5" />
        <line x1="40" y1={branchY[branchY.length - 1]} x2="140" y2={branchY[branchY.length - 1]} stroke="#475569" strokeWidth="2.5" />
        <line x1="140" y1={branchY[0]} x2="140" y2={branchY[branchY.length - 1]} stroke="#60a5fa" strokeWidth="2.5" />

        {/* Right collection rail */}
        <line x1="320" y1={branchY[0]} x2="320" y2={branchY[branchY.length - 1]} stroke="#60a5fa" strokeWidth="2.5" />
        <line x1="320" y1={branchY[0]} x2="360" y2={branchY[0]} stroke="#475569" strokeWidth="2.5" />
        <line x1="320" y1={branchY[branchY.length - 1]} x2="360" y2={branchY[branchY.length - 1]} stroke="#475569" strokeWidth="2.5" />
        <line x1="360" y1={branchY[0]} x2="360" y2={branchY[branchY.length - 1]} stroke="#475569" strokeWidth="2.5" />

        {/* Return wire from right to battery */}
        <line x1="360" y1={branchY[branchY.length - 1]} x2="40" y2={branchY[branchY.length - 1]} stroke="#475569" strokeWidth="2.5" />

        {/* Main total current arrow */}
        <line x1="60" y1={branchY[0]} x2="95" y2={branchY[0]} stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#arrow-amber)" />
        <text x="75" y={branchY[0] - 8} fill="#fbbf24" fontSize="11" fontWeight="700">I_total →</text>

        {/* Parallel Branches with Resistors */}
        {branchY.map((y, idx) => {
          const r = resistors[idx] || { label: `R${idx + 1}` };
          return (
            <g key={idx}>
              {/* Branch connecting lines */}
              <line x1="140" y1={y} x2="190" y2={y} stroke="#475569" strokeWidth="2.5" />
              <line x1="270" y1={y} x2="320" y2={y} stroke="#475569" strokeWidth="2.5" />

              {/* Branch current indicator */}
              <line x1="150" y1={y} x2="175" y2={y} stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
              <text x="155" y={y - 6} fill="#38bdf8" fontSize="9" fontWeight="600">I_{idx + 1}</text>

              {/* Resistor body */}
              <rect
                x="190"
                y={y - 9}
                width="80"
                height="18"
                fill="#0f172a"
                stroke="#60a5fa"
                strokeWidth="2"
                rx="4"
              />
              <text
                x="230"
                y={y + 4}
                fill="#e2e8f0"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {r.label}
              </text>
            </g>
          );
        })}

        {/* Parallel note */}
        <text x="230" y={branchY[branchY.length - 1] + 32} fill="#94a3b8" fontSize="10" textAnchor="middle">
          All 3 branches share the identical common voltage: V = {voltage}
        </text>
      </g>
    );
  }

  if (isSeries && resistors.length >= 2) {
    // Multi-resistor series circuit
    return (
      <g transform="translate(50, 30)">
        <rect
          x="30"
          y="30"
          width="340"
          height="160"
          rx="10"
          fill="none"
          stroke="#475569"
          strokeWidth="2.5"
        />
        {/* Battery on left */}
        <rect x="25" y="90" width="10" height="40" fill="#0c1222" />
        <line x1="20" y1="100" x2="40" y2="100" stroke="#f43f5e" strokeWidth="3" />
        <line x1="26" y1="115" x2="34" y2="115" stroke="#94a3b8" strokeWidth="3" />
        <text x="4" y="103" fill="#f43f5e" fontSize="11" fontWeight="700">+</text>
        <text x="6" y="120" fill="#94a3b8" fontSize="11" fontWeight="700">-</text>
        <text x="2" y="143" fill="#38bdf8" fontSize="11" fontWeight="700">{voltage}</text>

        {/* Resistors in series along top wire */}
        {resistors.slice(0, 3).map((r, i) => {
          const x = 70 + i * 95;
          return (
            <g key={i}>
              <rect x={x} y="21" width="75" height="18" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" rx="4" />
              <text x={x + 37.5} y="34" fill="#e2e8f0" fontSize="10" fontWeight="700" textAnchor="middle">
                {r.label}
              </text>
            </g>
          );
        })}

        {/* Current arrow */}
        <line x1="40" y1="50" x2="60" y2="30" stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#arrow-amber)" />
        <text x="65" y="18" fill="#fbbf24" fontSize="11" fontWeight="700">I_series →</text>
        <text x="200" y="210" fill="#94a3b8" fontSize="10" textAnchor="middle">
          Same common current flows sequentially through all series resistors
        </text>
      </g>
    );
  }

  // Single resistor default circuit
  return (
    <g transform="translate(60, 30)">
      <rect
        x="30"
        y="30"
        width="320"
        height="150"
        rx="10"
        fill="none"
        stroke="#475569"
        strokeWidth="2.5"
      />
      {/* Battery */}
      <rect x="25" y="85" width="10" height="40" fill="#0c1222" />
      <line x1="20" y1="95" x2="40" y2="95" stroke="#f43f5e" strokeWidth="3" />
      <line x1="26" y1="110" x2="34" y2="110" stroke="#94a3b8" strokeWidth="3" />
      <text x="4" y="98" fill="#f43f5e" fontSize="11" fontWeight="700">+</text>
      <text x="6" y="115" fill="#94a3b8" fontSize="11" fontWeight="700">-</text>
      <text x="2" y="138" fill="#38bdf8" fontSize="11" fontWeight="700">{voltage}</text>

      {/* Resistor */}
      <rect x="150" y="22" width="80" height="16" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" rx="3" />
      <text x="190" y="34" fill="#e2e8f0" fontSize="11" fontWeight="700" textAnchor="middle">
        {resistors[0]?.label || 'R₁'}
      </text>

      {/* Current Arrow */}
      <line x1="90" y1="30" x2="120" y2="30" stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#arrow-amber)" />
      <text x="105" y="22" fill="#fbbf24" fontSize="11" fontWeight="700">I →</text>
    </g>
  );
}

// 5. Ray Optics
function renderRayOptics(params?: any) {
  return (
    <g transform="translate(50, 30)">
      <line x1="20" y1="105" x2="380" y2="105" stroke="#475569" strokeWidth="1.5" />
      <text x="340" y="95" fill="#94a3b8" fontSize="10">Optical Axis</text>

      <line x1="200" y1="20" x2="200" y2="190" stroke="#60a5fa" strokeWidth="3" />
      <circle cx="120" cy="105" r="3" fill="#f43f5e" />
      <text x="115" y="122" fill="#f43f5e" fontSize="10" fontWeight="700">F₁</text>
      <circle cx="280" cy="105" r="3" fill="#f43f5e" />
      <text x="275" y="122" fill="#f43f5e" fontSize="10" fontWeight="700">F₂</text>

      {/* Object */}
      <line x1="70" y1="105" x2="70" y2="45" stroke="#34d399" strokeWidth="3" markerEnd="url(#arrow-emerald)" />
      <text x="50" y="75" fill="#34d399" fontSize="11" fontWeight="700">Object</text>

      {/* Rays */}
      <line x1="70" y1="45" x2="200" y2="45" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="200" y1="45" x2="320" y2="135" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="70" y1="45" x2="320" y2="135" stroke="#f43f5e" strokeWidth="1.5" />

      {/* Image */}
      <line x1="320" y1="105" x2="320" y2="135" stroke="#818cf8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
      <text x="325" y="148" fill="#818cf8" fontSize="11" fontWeight="700">Image</text>
    </g>
  );
}

// 6. Waves
function renderWave(params?: any) {
  return (
    <g transform="translate(50, 30)">
      <line x1="20" y1="105" x2="380" y2="105" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
      <path
        d="M 30 105 Q 75 35 120 105 T 210 105 T 300 105 T 380 105"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="3.5"
      />
      <line x1="75" y1="105" x2="75" y2="38" stroke="#f43f5e" strokeWidth="1.5" markerEnd="url(#arrow-rose)" />
      <text x="82" y="70" fill="#f43f5e" fontSize="11" fontWeight="700">Amplitude (A)</text>
      <text x="165" y="18" fill="#34d399" fontSize="11" fontWeight="700" textAnchor="middle">Wavelength (λ)</text>
    </g>
  );
}

// 7. Energy Bar
function renderEnergyBar(params?: any) {
  return (
    <g transform="translate(80, 30)">
      <text x="150" y="20" fill="#cbd5e1" fontSize="12" fontWeight="700" textAnchor="middle">
        Mechanical Energy Conservation (E_mech = KE + PE)
      </text>
      <g transform="translate(50, 40)">
        <rect x="0" y="0" width="60" height="130" fill="#1e293b" stroke="#334155" rx="4" />
        <rect x="5" y="20" width="50" height="80" fill="#3b82f6" rx="2" />
        <rect x="5" y="100" width="50" height="25" fill="#f59e0b" rx="2" />
        <text x="30" y="65" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">KE₁</text>
        <text x="30" y="117" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">PE₁</text>
        <text x="30" y="148" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">Initial</text>
      </g>
      <text x="170" y="110" fill="#94a3b8" fontSize="18" fontWeight="700">=</text>
      <g transform="translate(210, 40)">
        <rect x="0" y="0" width="60" height="130" fill="#1e293b" stroke="#334155" rx="4" />
        <rect x="5" y="20" width="50" height="30" fill="#3b82f6" rx="2" />
        <rect x="5" y="50" width="50" height="75" fill="#f59e0b" rx="2" />
        <text x="30" y="40" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">KE₂</text>
        <text x="30" y="90" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">PE₂</text>
        <text x="30" y="148" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">Final</text>
      </g>
    </g>
  );
}

// 8. Inclined Plane
function renderInclinePlane(params?: any) {
  const angle = params?.angleDeg ?? 30;
  return (
    <g transform="translate(60, 30)">
      <polygon points="40,180 320,180 320,50" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
      <text x="96" y="174" fill="#fbbf24" fontSize="11" fontWeight="700">θ = {angle}°</text>
    </g>
  );
}

function renderCustomSvg(svgMarkup?: string) {
  if (!svgMarkup) {
    return <text x="250" y="140" textAnchor="middle" fill="#94a3b8">Physics Diagram</text>;
  }
  let clean = svgMarkup.trim();
  // Strip code block backticks if AI wrapped it in ```xml or ```svg
  clean = clean.replace(/^```(?:svg|xml|html)?\s*/i, '').replace(/\s*```$/i, '').trim();
  clean = clean.replace(/<\?xml.*?\?>/gi, '');
  clean = clean.replace(/<!DOCTYPE.*?>/gi, '');

  // If full <svg> tag is passed, extract inner elements so it nests seamlessly in the viewBox
  const svgMatch = clean.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const innerContent = svgMatch ? svgMatch[1] : clean;

  return <g dangerouslySetInnerHTML={{ __html: innerContent }} />;
}

// 9. Physical Vertical Motion Under Gravity (Ball thrown upward)
function renderVerticalMotion(params?: any) {
  const v0 = params?.v0 ?? params?.initialVelocity ?? 20;
  const maxH = params?.maxH ?? `${((v0 * v0) / (2 * 9.8)).toFixed(1)} m`;
  const tApex = params?.timeToApex ?? `${(v0 / 9.8).toFixed(2)} s`;

  return (
    <g transform="translate(40, 15)">
      {/* Background grid */}
      <rect x="20" y="10" width="380" height="220" fill="url(#dark-grid)" rx="6" />

      {/* Ground surface line */}
      <line x1="20" y1="220" x2="400" y2="220" stroke="#64748b" strokeWidth="3" />
      <text x="350" y="238" fill="#94a3b8" fontSize="11" fontWeight="600">Ground</text>

      {/* Ground hatch lines */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
        <line key={x} x1={x} y1="220" x2={x - 10} y2="232" stroke="#475569" strokeWidth="1.5" />
      ))}

      {/* Vertical dotted flight path */}
      <line
        x1="180"
        y1="210"
        x2="180"
        y2="55"
        stroke="#60a5fa"
        strokeWidth="2.5"
        strokeDasharray="4 4"
      />

      {/* Ball at Ground (Launch Point) */}
      <circle cx="180" cy="210" r="10" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" />
      <text x="180" y="214" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">t = 0</text>

      {/* Initial upward velocity vector arrow */}
      <line x1="180" y1="200" x2="180" y2="140" stroke="#34d399" strokeWidth="3" markerEnd="url(#arrow-emerald)" />
      <text x="195" y="165" fill="#34d399" fontSize="12" fontWeight="700" fontFamily="sans-serif">
        u = {v0} m/s ↑
      </text>

      {/* Downward Gravity Acceleration vector */}
      <line x1="110" y1="90" x2="110" y2="150" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrow-rose)" />
      <text x="105" y="125" fill="#f43f5e" fontSize="12" fontWeight="700" textAnchor="end" fontFamily="sans-serif">
        g = 9.8 m/s² ↓
      </text>
      <text x="105" y="140" fill="#fda4af" fontSize="10" textAnchor="end">
        (Slows down the ball)
      </text>

      {/* Ball at Apex (Maximum Height) */}
      <circle cx="180" cy="55" r="10" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
      <text x="180" y="38" fill="#f87171" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        APEX (v = 0 m/s)
      </text>
      <text x="180" y="22" fill="#94a3b8" fontSize="10" textAnchor="middle">
        Instantaneous rest at top
      </text>

      {/* Maximum Height Dimension Indicator on Right */}
      <line x1="280" y1="220" x2="280" y2="55" stroke="#fbbf24" strokeWidth="2" />
      <line x1="272" y1="220" x2="288" y2="220" stroke="#fbbf24" strokeWidth="2" />
      <line x1="272" y1="55" x2="288" y2="55" stroke="#fbbf24" strokeWidth="2" />
      <text x="295" y="130" fill="#fbbf24" fontSize="13" fontWeight="700" fontFamily="sans-serif">
        H_max = {maxH}
      </text>
      <text x="295" y="150" fill="#e2e8f0" fontSize="11" fontWeight="600">
        Time to apex: t = {tApex}
      </text>
    </g>
  );
}

// 10. Linear 1D Motion (Car, train, runner accelerating/stopping)
function renderLinearMotion(params?: any) {
  const v1 = params?.v1 ?? params?.u ?? '10 m/s';
  const v2 = params?.v2 ?? params?.v ?? '30 m/s';
  const dist = params?.dist ?? params?.distance ?? params?.d ?? '100 m';
  const acc = params?.acc ?? params?.acceleration ?? params?.a ?? '2.5 m/s²';

  return (
    <g transform="translate(30, 25)">
      {/* Road / Track surface */}
      <rect x="20" y="140" width="400" height="40" fill="#1e293b" rx="4" />
      {/* Dashed center dividing lane */}
      <line x1="25" y1="160" x2="415" y2="160" stroke="#fbbf24" strokeWidth="2" strokeDasharray="10 8" />

      {/* Position 1 (Start) */}
      <g transform="translate(60, 115)">
        <rect x="0" y="0" width="50" height="24" rx="4" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
        <circle cx="12" cy="24" r="5" fill="#0f172a" stroke="#94a3b8" />
        <circle cx="38" cy="24" r="5" fill="#0f172a" stroke="#94a3b8" />
        <text x="25" y="16" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">Pos A</text>
      </g>
      {/* Velocity 1 arrow */}
      <line x1="120" y1="125" x2="165" y2="125" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrow-emerald)" />
      <text x="140" y="115" fill="#34d399" fontSize="11" fontWeight="700">v₁ = {v1}</text>

      {/* Acceleration arrow */}
      <line x1="180" y1="80" x2="260" y2="80" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#arrow-rose)" />
      <text x="220" y="70" fill="#f43f5e" fontSize="11" fontWeight="700" textAnchor="middle">
        Acceleration a = {acc} →
      </text>

      {/* Position 2 (End) */}
      <g transform="translate(320, 115)">
        <rect x="0" y="0" width="50" height="24" rx="4" fill="#6366f1" stroke="#a5b4fc" strokeWidth="1.5" />
        <circle cx="12" cy="24" r="5" fill="#0f172a" stroke="#94a3b8" />
        <circle cx="38" cy="24" r="5" fill="#0f172a" stroke="#94a3b8" />
        <text x="25" y="16" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">Pos B</text>
      </g>
      {/* Velocity 2 arrow */}
      <line x1="380" y1="125" x2="425" y2="125" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrow-emerald)" />
      <text x="385" y="115" fill="#34d399" fontSize="11" fontWeight="700">v₂ = {v2}</text>

      {/* Distance dimension line */}
      <line x1="60" y1="205" x2="370" y2="205" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="60" y1="198" x2="60" y2="212" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="370" y1="198" x2="370" y2="212" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="215" y="222" fill="#cbd5e1" fontSize="12" fontWeight="700" textAnchor="middle">
        Displacement / Distance d = {dist}
      </text>
    </g>
  );
}
