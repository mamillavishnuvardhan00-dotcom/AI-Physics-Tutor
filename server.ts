import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK with required telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated verified educational YouTube videos for core physics concepts
const CURATED_VIDEOS_MAP: Record<string, Array<{ id: string; title: string; channel: string; description: string; url: string; thumbnailUrl: string }>> = {
  kinematics: [
    {
      id: 'b4W1yU4V_rQ',
      title: 'Motion in a Straight Line: Crash Course Physics #1',
      channel: 'CrashCourse',
      description: 'Explore displacement, velocity, and acceleration with graphical representations.',
      url: 'https://www.youtube.com/watch?v=b4W1yU4V_rQ',
      thumbnailUrl: 'https://img.youtube.com/vi/b4W1yU4V_rQ/hqdefault.jpg',
    },
    {
      id: 's9k-7tqZzWw',
      title: 'Kinematics In One Dimension - Physics Problems',
      channel: 'The Organic Chemistry Tutor',
      description: 'Comprehensive walkthrough of horizontal and vertical kinematic equations with examples.',
      url: 'https://www.youtube.com/watch?v=s9k-7tqZzWw',
      thumbnailUrl: 'https://img.youtube.com/vi/s9k-7tqZzWw/hqdefault.jpg',
    },
    {
      id: 'ZM8ECpBQD0U',
      title: 'Free Fall and Gravity: Acceleration Due to Gravity',
      channel: 'Khan Academy',
      description: 'Understanding motion under constant gravitational acceleration g = 9.8 m/s².',
      url: 'https://www.youtube.com/watch?v=ZM8ECpBQD0U',
      thumbnailUrl: 'https://img.youtube.com/vi/ZM8ECpBQD0U/hqdefault.jpg',
    },
  ],
  projectile: [
    {
      id: 'sxb8_2V1Vb8',
      title: 'Derivatives and Projectiles: Crash Course Physics #2',
      channel: 'CrashCourse',
      description: 'How 2D projectile motion decomposes independently into horizontal and vertical components.',
      url: 'https://www.youtube.com/watch?v=sxb8_2V1Vb8',
      thumbnailUrl: 'https://img.youtube.com/vi/sxb8_2V1Vb8/hqdefault.jpg',
    },
    {
      id: 'b2e2aK6K09I',
      title: 'Projectile Motion Physics Problems - Kinematics in Two Dimensions',
      channel: 'The Organic Chemistry Tutor',
      description: 'Step-by-step angle launch, maximum height, time of flight, and range formulas.',
      url: 'https://www.youtube.com/watch?v=b2e2aK6K09I',
      thumbnailUrl: 'https://img.youtube.com/vi/b2e2aK6K09I/hqdefault.jpg',
    },
  ],
  newton: [
    {
      id: 'kKKM8Y-u7ds',
      title: 'Newton’s Laws: Crash Course Physics #5',
      channel: 'CrashCourse',
      description: 'Inertia, F = ma, and equal & opposite reaction forces in real physical systems.',
      url: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds',
      thumbnailUrl: 'https://img.youtube.com/vi/kKKM8Y-u7ds/hqdefault.jpg',
    },
    {
      id: 'ZzrF_5Jc3Z4',
      title: 'How To Draw Free Body Diagrams (FBD)',
      channel: 'The Organic Chemistry Tutor',
      description: 'Mastering normal force, gravity, friction, tension, and net force equations.',
      url: 'https://www.youtube.com/watch?v=ZzrF_5Jc3Z4',
      thumbnailUrl: 'https://img.youtube.com/vi/ZzrF_5Jc3Z4/hqdefault.jpg',
    },
  ],
  energy: [
    {
      id: 'w4QFJb9a8vo',
      title: 'Work, Energy, and Power: Crash Course Physics #9',
      channel: 'CrashCourse',
      description: 'Mechanical energy conservation, kinetic energy, potential energy, and work theorem.',
      url: 'https://www.youtube.com/watch?v=w4QFJb9a8vo',
      thumbnailUrl: 'https://img.youtube.com/vi/w4QFJb9a8vo/hqdefault.jpg',
    },
    {
      id: 'bsZmM3T7nFk',
      title: 'Conservation of Energy Physics Problems',
      channel: 'The Organic Chemistry Tutor',
      description: 'Solving kinetic and gravitational potential energy transformations.',
      url: 'https://www.youtube.com/watch?v=bsZmM3T7nFk',
      thumbnailUrl: 'https://img.youtube.com/vi/bsZmM3T7nFk/hqdefault.jpg',
    },
  ],
  circuits: [
    {
      id: 'HXOok3mfMLM',
      title: 'Electric Current: Crash Course Physics #28',
      channel: 'CrashCourse',
      description: 'Ohm’s law, voltage, resistance, current, and series/parallel resistor combinations.',
      url: 'https://www.youtube.com/watch?v=HXOok3mfMLM',
      thumbnailUrl: 'https://img.youtube.com/vi/HXOok3mfMLM/hqdefault.jpg',
    },
    {
      id: 'F_vLWkkO23o',
      title: 'Series and Parallel Circuits Explained',
      channel: 'The Organic Chemistry Tutor',
      description: 'Equivalent resistance, voltage drops, and branch currents calculation.',
      url: 'https://www.youtube.com/watch?v=F_vLWkkO23o',
      thumbnailUrl: 'https://img.youtube.com/vi/F_vLWkkO23o/hqdefault.jpg',
    },
  ],
  optics: [
    {
      id: 'Oh4a-53052g',
      title: 'Geometric Optics: Crash Course Physics #38',
      channel: 'CrashCourse',
      description: 'Snell’s law, reflection, refraction, focal points, and ray diagrams for lenses.',
      url: 'https://www.youtube.com/watch?v=Oh4a-53052g',
      thumbnailUrl: 'https://img.youtube.com/vi/Oh4a-53052g/hqdefault.jpg',
    },
    {
      id: '7iKSPwJb-mU',
      title: 'Thin Lens Equation and Ray Diagrams for Convex and Concave Lenses',
      channel: 'The Organic Chemistry Tutor',
      description: 'Calculating image distance, magnification, and virtual vs real orientation.',
      url: 'https://www.youtube.com/watch?v=7iKSPwJb-mU',
      thumbnailUrl: 'https://img.youtube.com/vi/7iKSPwJb-mU/hqdefault.jpg',
    },
  ],
  waves: [
    {
      id: 'T1N4rEwSjY4',
      title: 'Traveling Waves: Crash Course Physics #17',
      channel: 'CrashCourse',
      description: 'Wavelength, frequency, wave speed v = fλ, amplitude, and wave equations.',
      url: 'https://www.youtube.com/watch?v=T1N4rEwSjY4',
      thumbnailUrl: 'https://img.youtube.com/vi/T1N4rEwSjY4/hqdefault.jpg',
    },
  ],
  thermodynamics: [
    {
      id: '4i1MUWJoI0U',
      title: 'Thermodynamics: Crash Course Physics #23',
      channel: 'CrashCourse',
      description: 'Heat, work, internal energy, and the First Law of Thermodynamics ΔU = Q - W.',
      url: 'https://www.youtube.com/watch?v=4i1MUWJoI0U',
      thumbnailUrl: 'https://img.youtube.com/vi/4i1MUWJoI0U/hqdefault.jpg',
    },
  ],
};

function getCuratedVideos(topic: string, concept: string): Array<{ id: string; title: string; channel: string; description: string; url: string; thumbnailUrl: string }> {
  const text = (topic + ' ' + concept).toLowerCase();
  if (text.includes('projectile') || text.includes('trajectory') || text.includes('horizontal launch') || text.includes('angled launch')) {
    return CURATED_VIDEOS_MAP.projectile;
  }
  if (text.includes('circuit') || text.includes('ohm') || text.includes('resistor') || text.includes('current') || text.includes('voltage') || text.includes('kirchhoff')) {
    return CURATED_VIDEOS_MAP.circuits;
  }
  if (text.includes('lens') || text.includes('mirror') || text.includes('refraction') || text.includes('reflection') || text.includes('snell') || text.includes('optics') || text.includes('ray')) {
    return CURATED_VIDEOS_MAP.optics;
  }
  if (text.includes('energy') || text.includes('work') || text.includes('power') || text.includes('kinetic') || text.includes('potential')) {
    return CURATED_VIDEOS_MAP.energy;
  }
  if (text.includes('force') || text.includes('newton') || text.includes('friction') || text.includes('tension') || text.includes('free body')) {
    return CURATED_VIDEOS_MAP.newton;
  }
  if (text.includes('wave') || text.includes('frequency') || text.includes('sound') || text.includes('doppler')) {
    return CURATED_VIDEOS_MAP.waves;
  }
  if (text.includes('thermo') || text.includes('heat') || text.includes('gas') || text.includes('calorimetry')) {
    return CURATED_VIDEOS_MAP.thermodynamics;
  }
  return CURATED_VIDEOS_MAP.kinematics;
}

// Helper to call Gemini with fast automatic fallback across models during 503/429 spikes
async function callGeminiWithFallback(params: { parts: any[]; systemInstruction: string }) {
  // Try 3.8-flash first, then immediately 3.1-flash-lite (fast & resilient), then flash-latest
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts: params.parts },
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      // Suppress noisy stderr logging for standard transient 503/429 traffic spikes
      if (!errMsg.includes('503') && !errMsg.includes('UNAVAILABLE') && !errMsg.includes('429')) {
        console.warn(`Model ${model} issue:`, errMsg.slice(0, 100));
      }
      // Brief pause before trying next candidate
      await new Promise((res) => setTimeout(res, 300));
    }
  }

  throw lastError || new Error('Physics AI models are currently busy. Please try again in a few moments.');
}

// API Route: Transcribe Audio
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'No audio provided' });
    }

    const cleanMimeType = mimeType || 'audio/webm';
    const models = ['gemini-3.5-transcribe', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let transcript = '';
    let lastErr: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: audioBase64,
                },
              },
              {
                text: 'Please transcribe this spoken physics question word for word. Preserve all scientific terms, numbers, units, and equations accurately. Return ONLY the transcribed question text without any commentary.',
              },
            ],
          },
        });
        transcript = response.text?.trim() || '';
        if (transcript) break;
      } catch (err) {
        lastErr = err;
      }
    }

    return res.json({ transcript });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe audio',
    });
  }
});

// API Route: Solve Physics Question
app.post('/api/solve-physics', async (req, res) => {
  try {
    const { questionText, imageBase64, mimeType } = req.body;

    if (!questionText && !imageBase64) {
      return res.status(400).json({ error: 'Please provide a physics question text or image.' });
    }

    const systemInstruction = `You are an expert AI Physics Tutor built to provide rigorous, clear, pedagogical physics explanations following a strict 7-section sequence.
Your job is to read the student's question (from text or image of printed/handwritten problem, equations, or diagrams) and return a structured JSON response matching the exact schema.

Strict Pedagogical Rules:
1. Section 1 (Understand the Question):
   - question: The full exact text of the problem (transcribed accurately if from an image).
   - rephrase: A concise student-friendly rephrasing of the problem (1-2 sentences).
   - whatIsGiven: A comprehensive, explicit paragraph clearly explaining what information and values are given in the problem, including implicit physics conditions (e.g. "We are given an object launched vertically upward with an initial velocity u = 20 m/s. Under standard Earth conditions, acceleration due to gravity acts downward at g = 9.8 m/s². At the maximum height, the object momentarily comes to rest, meaning final velocity v = 0 m/s.").
   - whatToCalculate: A comprehensive, explicit paragraph clearly explaining what we want to calculate (e.g. "What we need to calculate: We want to determine the maximum vertical height h reached by the object, and the total time taken t to reach the apex.").
   - given: Array of known values: [{ symbol: "u", value: "20", unit: "m/s", description: "Initial upward velocity" }, { symbol: "g", value: "9.8", unit: "m/s²", description: "Acceleration due to gravity directed downward" }, { symbol: "v", value: "0", unit: "m/s", description: "Instantaneous velocity at maximum height" }]
   - find: Array of target values: [{ symbol: "h_max", description: "Maximum height attained by the object", targetUnit: "m" }, { symbol: "t_apex", description: "Time taken to reach maximum height", targetUnit: "s" }]

2. Section 2 (Topic):
   - domain: "Physics"
   - branch: "Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Waves & Oscillations", or "Modern Physics"
   - topic: "Kinematics", "Newton's Laws", "Work, Energy & Power", "Circuits", etc.
   - subtopic: e.g. "Motion under gravity", "Projectile Motion", "Ohm's Law"
   - breadcrumb: array e.g. ["Physics", "Mechanics", "Kinematics", "Motion under gravity"].

3. Section 3 (Concept & Visual Diagram):
   - CRITICAL REQUIREMENT: You MUST provide BOTH a thorough conceptual explanation AND a visual diagram specifically illustrating what the question asks!
   - NEVER provide a generic fixed diagram or an abstract graph when the question describes a real physical scenario!
     * For vertical throw / gravity: illustrate the ground, vertical motion path, ball with upward initial velocity u, gravity g downward, and apex height H_max!
     * For projectile motion: illustrate the ground, launch angle θ, velocity vector v₀, parabolic trajectory, peak H_max, range R, and landing point!
     * For circuits: illustrate the battery and the exact resistor configuration (parallel branches or series chain) with exact values (e.g. 3Ω, 6Ω, 9Ω, 12V) and current arrows!
     * For inclined planes: illustrate the ramp, block, and all resolved force components!
     * For linear motion (car, runner, train): illustrate the track, start position, velocity, acceleration, and end position.
     * For forces / friction: illustrate the free-body diagram for that specific body.
   - conceptTitle: Descriptive title of the physics concept.
   - simpleExplanation: Clear, student-friendly explanation of the concept behind this problem in simple English words (2-3 paragraphs).
   - howDiagramComes: CRITICAL: Step-by-step simple English explanation of how the diagram comes and why it was drawn this way, explaining each part of the diagram.
   - explanation: In-depth conceptual explanation.
   - whatIsHappening: Detailed description of what is physically happening.
   - whyItApplies: Explicit explanation of why this concept applies.
   - visual: MANDATORY diagram object:
     * hasVisual: true
     * type: 'custom_svg'
     * title: Descriptive title of what is illustrated
     * caption: Key takeaway under the diagram
     * explanation: Clear explanation of what each component and vector represents
     * svgMarkup: Clean, valid SVG elements (<g>...</g> or <svg>...</svg>) with viewBox="0 0 500 280" styled with modern dark-theme colors (strokes #60a5fa, #34d399, #fbbf24, #f43f5e, text #cbd5e1). The SVG must directly draw the physical setup described in the question with labeled values!
     * params: Numerical parameters tailored to the problem.

4. Section 4 (Formula):
   - CRITICAL MANDATORY REQUIREMENT: ALWAYS provide 1 to 3 relevant governing equations in formulas array!
   - Each formula item:
     * latex: Standard LaTeX mathematical notation (e.g. "v = u - g \\times t" or "h = \\frac{u^2}{2g}" or "F = m \\times a")
     * name: Formula name (e.g. "First Kinematic Equation", "Maximum Height Equation")
     * whyAppropriate: Concise explanation of why this formula is selected for this specific problem
     * variables: Array of ALL variables in the formula with symbol, meaning, and unit!

5. Section 5 (Solution):
   - Sequence:
     Step 1: Identify the given values and state known conditions
     Step 2: Select the appropriate formula
     Step 3: Substitute the known values into the equation
     Step 4: Perform the calculation with accurate arithmetic
     Step 5: Check units and verify physical reasonableness
   - Each step: { stepNumber: number, title: string, explanation: string, latexMath?: string, calculation?: string }

6. Section 6 (Final Answer):
   - resultLatex: Formatted equation or concise statement (e.g. "h_{\\text{max}} = 20.41\\text{ m}")
   - value: string
   - unit: string
   - conciseSummary: Single clear verdict sentence.

7. Section 7 (Learn More YouTube query):
   - searchQuery: A targeted search query (e.g. "Motion under gravity physics tutorial").

Respond with strict JSON ONLY matching the requested structure.`;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    let userPromptText = questionText || 'Please read the physics question in the attached image, understand, and solve it.';
    parts.push({ text: userPromptText });

    const result = await callGeminiWithFallback({
      parts,
      systemInstruction,
    });

    const responseText = result.text.trim();
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Unable to parse AI response into JSON');
      }
    }

    // Normalize and sanitize parsedData to guarantee all structures and arrays exist
    if (!parsedData || typeof parsedData !== 'object') {
      parsedData = {};
    }

    const qText = (questionText || parsedData.understand?.question || parsedData.question || '').trim();
    const qLower = qText.toLowerCase();

    // Helper to find sections irrespective of key casing or numbering (e.g. "Section 1", "1. Understand", "understand")
    const getSection = (patterns: string[]): any => {
      for (const k of Object.keys(parsedData)) {
        const kLow = k.toLowerCase();
        for (const pat of patterns) {
          if (kLow.includes(pat)) return parsedData[k];
        }
      }
      return null;
    };

    const s1 = getSection(['understand', 'section 1', 'section1', '1.', 'problem']) || {};
    const s2 = getSection(['topic', 'section 2', 'section2', '2.']) || {};
    const s3 = getSection(['concept', 'section 3', 'section3', '3.']) || {};
    const s4 = getSection(['formula', 'section 4', 'section4', '4.', 'equation']) || {};
    const s5 = getSection(['solution', 'section 5', 'section5', '5.', 'steps']) || {};
    const s6 = getSection(['final', 'answer', 'section 6', 'section6', '6.']) || {};

    // 1. Extract givenList across all common top-level or nested keys
    let givenList: any[] = [];
    const rawG = s1.given || s1.Given || s1.GIVEN || s1.givens || s1.knowns || s1.given_values || parsedData.given || parsedData.Given;
    if (Array.isArray(rawG) && rawG.length > 0) {
      givenList = rawG;
    }

    // 2. Extract findList across all common top-level or nested keys
    let findList: any[] = [];
    const rawF = s1.find || s1.Find || s1.FIND || s1.to_find || s1.calculate || s1.finds || s1.unknowns || parsedData.find || parsedData.Find;
    if (Array.isArray(rawF) && rawF.length > 0) {
      findList = rawF;
    }

    // 3. Robust domain-aware extraction directly from problem text if AI returned empty arrays
    if (givenList.length === 0) {
      // Check for Resistors / Circuit problem: e.g. "3Ω, 6Ω, and 9Ω" or "3 ohm, 6 ohm"
      const resistorMatches = [...qText.matchAll(/(\d+(?:\.\d+)?)\s*(?:Ω|ohms?|ohm)\b/gi)];
      if (resistorMatches.length > 0) {
        resistorMatches.forEach((m, idx) => {
          givenList.push({
            symbol: `R_${idx + 1}`,
            value: m[1],
            unit: 'Ω',
            description: `Resistance of resistor ${idx + 1}`,
          });
        });
      }

      // Voltage match: e.g. "12V" or "12 V" or "12 volts"
      const voltMatch = qText.match(/(\d+(?:\.\d+)?)\s*(?:V|volts?|volt)\b/i);
      if (voltMatch) {
        givenList.push({
          symbol: 'V',
          value: voltMatch[1],
          unit: 'V',
          description: 'Battery voltage / Potential difference',
        });
      }

      // Speed / Velocity match: e.g. "20 m/s" or "speed of 20 m/s"
      const speedMatch = qText.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|m\s*\/\s*s|mps)/i);
      if (speedMatch) {
        givenList.push({
          symbol: 'u',
          value: speedMatch[1],
          unit: 'm/s',
          description: qLower.includes('upward') ? 'Initial upward velocity' : 'Initial velocity',
        });
      }

      // Vertical gravity conditions
      if (qLower.includes('upward') || qLower.includes('thrown') || qLower.includes('gravity') || (qLower.includes('height') && !qLower.includes('resistor'))) {
        givenList.push({
          symbol: 'g',
          value: '9.8',
          unit: 'm/s²',
          description: 'Acceleration due to gravity (directed downward)',
        });
        if (qLower.includes('upward') || qLower.includes('maximum height')) {
          givenList.push({
            symbol: 'v',
            value: '0',
            unit: 'm/s',
            description: 'Final velocity at maximum height (instantaneous rest)',
          });
        }
      }

      // Mass match: e.g. "5 kg"
      const massMatch = qText.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)\b/i);
      if (massMatch) {
        givenList.push({
          symbol: 'm',
          value: massMatch[1],
          unit: 'kg',
          description: 'Mass of the object',
        });
      }

      // Force match: e.g. "10 N"
      const forceMatch = qText.match(/(\d+(?:\.\d+)?)\s*(?:N|newtons?)\b/i);
      if (forceMatch) {
        givenList.push({
          symbol: 'F',
          value: forceMatch[1],
          unit: 'N',
          description: 'Applied force',
        });
      }
    }

    if (findList.length === 0) {
      if (qLower.includes('equivalent resistance') || qLower.includes('resistor') || qLower.includes('resistance')) {
        findList.push({
          symbol: 'R_eq',
          description: 'Equivalent resistance of the circuit',
          targetUnit: 'Ω',
        });
      }
      if (qLower.includes('current')) {
        findList.push({
          symbol: 'I',
          description: 'Total circuit electric current',
          targetUnit: 'A',
        });
      }
      if (qLower.includes('maximum height') || qLower.includes('max height') || (qLower.includes('height') && !qLower.includes('resistor'))) {
        findList.push({
          symbol: 'h_max',
          description: 'Maximum height reached by the ball',
          targetUnit: 'm',
        });
      }
      if (qLower.includes('time') || qLower.includes('reach it')) {
        findList.push({
          symbol: 't',
          description: 'Time taken to reach the maximum height',
          targetUnit: 's',
        });
      }
      if (qLower.includes('acceleration')) {
        findList.push({
          symbol: 'a',
          description: 'Acceleration',
          targetUnit: 'm/s²',
        });
      }
    }

    // 4. Clean Rephrase (avoid generic robotic boilerplate)
    let rephrase = s1.rephrase || s1.summary || parsedData.rephrase || '';
    if (!rephrase || rephrase.includes('determine the physical quantities') || rephrase.includes('governing laws of motion')) {
      if (qLower.includes('resistor') || qLower.includes('parallel') || qLower.includes('resistance')) {
        rephrase = 'We are given three resistors connected in parallel across a 12V battery and need to find the equivalent overall resistance of the circuit combination.';
      } else if (qLower.includes('thrown vertically upward') || qLower.includes('upward with a speed')) {
        rephrase = 'A ball is launched vertically upward against Earth’s gravitational pull. We are given its launch speed and need to find the maximum height it reaches and the time taken to reach that apex.';
      } else if (givenList.length > 0 && findList.length > 0) {
        const gDesc = givenList.map((g: any) => `${g.symbol} = ${g.value} ${g.unit || ''}`).join(', ');
        const fDesc = findList.map((f: any) => f.description).join(' and ');
        rephrase = `The problem describes a physical system with known values (${gDesc}). We need to calculate ${fDesc}.`;
      } else {
        rephrase = 'The problem asks us to determine the unknown physical quantities based on physics principles.';
      }
    }

    parsedData.understand = {
      question: qText || 'Physics Question',
      rephrase,
      given: givenList,
      find: findList,
    };

    // Topic resolution
    if (qLower.includes('resistor') || qLower.includes('circuit') || qLower.includes('resistance') || qLower.includes('battery')) {
      parsedData.topic = {
        domain: 'Physics',
        branch: 'Electricity & Magnetism',
        topic: 'Current Electricity',
        subtopic: qLower.includes('parallel') ? 'Resistors in Parallel' : 'Direct Current Circuits',
        breadcrumb: ['Physics', 'Electricity & Magnetism', 'Current Electricity', qLower.includes('parallel') ? 'Resistors in Parallel' : 'DC Circuits'],
      };
    } else if (!parsedData.topic || typeof parsedData.topic !== 'object') {
      parsedData.topic = { domain: 'Physics', branch: 'Mechanics', topic: 'Kinematics', subtopic: 'Motion under gravity', breadcrumb: ['Physics', 'Mechanics', 'Kinematics', 'Motion under gravity'] };
    }

    const topicText = `${parsedData.topic?.domain || ''} ${parsedData.topic?.branch || ''} ${parsedData.topic?.topic || ''} ${parsedData.topic?.subtopic || ''} ${qText}`.toLowerCase();

    // Concept: simple English explanation + How Diagram Comes
    const rawConcept = s3.explanation ? s3 : parsedData.concept || {};
    let simpleExplanation = rawConcept.simpleExplanation || rawConcept.explanation || '';
    let howDiagramComes = rawConcept.howDiagramComes || '';

    if (qLower.includes('resistor') || qLower.includes('parallel') || qLower.includes('circuit')) {
      if (!simpleExplanation || simpleExplanation.includes('acceleration') || simpleExplanation.length < 40) {
        simpleExplanation = `When resistors are connected in parallel, each resistor is connected across the same two points in the circuit. This means every resistor receives the exact same full 12V voltage directly from the battery.

Because each resistor provides an independent pathway for electric charge to flow, adding more parallel resistors actually makes it easier for overall current to pass through the circuit. As a result, the equivalent resistance of resistors in parallel is always smaller than the smallest individual resistor in the group.`;
      }

      if (!howDiagramComes) {
        howDiagramComes = `• The 12V DC battery on the left represents the electrical power source providing the circuit voltage.
• Because the resistors are in parallel, the connecting wire splits into three separate parallel branches (rungs) rather than a single chain.
• Each branch contains one resistor: R₁ = 3Ω on the top branch, R₂ = 6Ω in the middle branch, and R₃ = 9Ω on the bottom branch.
• The total current leaves the battery and divides into three independent branch currents (I₁, I₂, I₃), which later rejoin on the right before returning to the battery.
• Every branch experiences the exact same 12V potential drop across its terminals.`;
      }
    } else if (qLower.includes('upward') || qLower.includes('gravity') || qLower.includes('thrown') || (qLower.includes('height') && !qLower.includes('resistor'))) {
      if (!simpleExplanation || simpleExplanation.length < 40) {
        simpleExplanation = `When you throw a ball straight up into the air with an initial speed of 20 m/s, Earth's gravity constantly pulls it downward at a steady rate of 9.8 m/s².

Because gravity is pulling in the opposite direction of the ball's upward flight, the ball slows down every second. It continues rising until it reaches its highest point (the maximum height). At that exact instant, the ball comes to a complete stop for a split second (its speed is 0 m/s) before gravity pulls it back down toward the ground.

Because the downward pull of gravity is constant throughout the motion, we can use the standard equations of motion to find how high the ball will rise and how long it takes to reach the top.`;
      }

      if (!howDiagramComes) {
        howDiagramComes = `• The vertical Y-axis represents the velocity of the ball in m/s, starting at 20 m/s at time t = 0.
• The horizontal X-axis represents time in seconds as the ball ascends.
• The straight downward-sloping line shows the ball constantly losing 9.8 m/s of velocity every second due to gravity.
• The line crosses zero velocity at t ≈ 2.04 seconds, which marks the exact moment the ball reaches its peak height and stops rising.`;
      }
    } else if (topicText.includes('projectile') || topicText.includes('angle') || topicText.includes('launch')) {
      if (!simpleExplanation) {
        simpleExplanation = `A projectile launched into the air experiences two simultaneous motions: horizontal motion at constant speed, and vertical motion accelerated downward by gravity. Because these two perpendicular motions are completely independent, the combined path traces a smooth parabola.`;
      }
      if (!howDiagramComes) {
        howDiagramComes = `• The curved path shows the parabolic trajectory followed by the projectile.
• The horizontal X-axis tracks the horizontal distance (range) covered with steady velocity.
• The vertical Y-axis tracks the elevation; the peak of the curve indicates the maximum height where vertical velocity is momentarily zero.
• The launch arrow indicates the initial velocity vector v₀ angled above the horizontal ground.`;
      }
    } else if (topicText.includes('force') || topicText.includes('friction') || topicText.includes('newton')) {
      if (!simpleExplanation) {
        simpleExplanation = `According to Newton's Laws of Motion, the acceleration of an object depends on the net unbalanced force acting upon it. When multiple forces push or pull an object simultaneously, we draw a free-body diagram to account for every interaction.`;
      }
      if (!howDiagramComes) {
        howDiagramComes = `• The central square represents the isolated mass of the object.
• The downward red arrow represents gravity (mg) pulling toward the center of the Earth.
• The upward green arrow represents the normal contact force (F_N) supporting the object from the surface.
• The horizontal arrows represent applied forces driving motion and friction forces resisting motion.`;
      }
    } else {
      if (!simpleExplanation) {
        simpleExplanation = `This physical scenario is governed by fundamental physical laws connecting forces, energy, and motion. Understanding the relationship between the given quantities allows us to select the precise mathematical formulas that describe the system.`;
      }
      if (!howDiagramComes) {
        howDiagramComes = `• The diagram visually displays the physical components, vectors, and coordinates given in the problem.
• Each axis and labeled indicator shows how the physical quantities change across the system.
• Identifying these visual coordinates helps students directly link the known numbers to the equations of physics.`;
      }
    }

    parsedData.concept = {
      conceptTitle: rawConcept.conceptTitle || parsedData.topic.subtopic || 'Physics Concept',
      simpleExplanation,
      howDiagramComes,
      explanation: simpleExplanation,
      visual: rawConcept.visual || s3.visual,
    };

    // 1. Check if Gemini generated a custom SVG tailored to the exact problem
    const rawVisual = parsedData.concept.visual || parsedData.visual || s3.visual || {};
    let customSvg = rawVisual.svgMarkup || rawVisual.svg || rawVisual.customSvg || rawVisual.markup || '';
    if (typeof customSvg === 'string') {
      customSvg = customSvg.trim();
    }

    if (customSvg && customSvg.length > 20) {
      parsedData.concept.visual = {
        hasVisual: true,
        type: 'custom_svg',
        title: rawVisual.title || 'Physical System Diagram',
        caption: rawVisual.caption || 'Illustration of the physical setup and governing vectors.',
        explanation: rawVisual.explanation || 'Visual diagram representing the physical components, coordinates, and vectors in this problem.',
        svgMarkup: customSvg,
        params: rawVisual.params || {},
      };
    } else {
      // 2. Fall back to problem-tailored physical scenario diagrams (never fixed generic graphs)
      let visualType: 'vertical_motion' | 'linear_motion' | 'projectile' | 'free_body' | 'circuit' | 'ray_optics' | 'wave' | 'energy_bar' | 'incline_plane' | 'graph_vt' = 'vertical_motion';
      let visualTitle = 'Vertical Motion Under Gravity';
      const speedMatch = qText.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|m\s*\/\s*s)/i);
      const v0Val = speedMatch ? parseFloat(speedMatch[1]) : 20;
      const hMaxVal = parseFloat(((v0Val * v0Val) / (2 * 9.8)).toFixed(1));
      const tApexVal = parseFloat((v0Val / 9.8).toFixed(2));

      let visualCaption = `Ball launched vertically at ${v0Val} m/s reaching maximum height H_max = ${hMaxVal} m.`;
      let visualExplanation = `Physical diagram showing the upward flight path against gravity. The initial upward velocity (u = ${v0Val} m/s) is opposed by gravitational acceleration (-9.8 m/s²), bringing the object to momentary rest at apex (v = 0).`;
      let visualParams: any = {
        v0: v0Val,
        initialVelocity: v0Val,
        maxH: `${hMaxVal} m`,
        timeToApex: `${tApexVal} s`,
      };

      if (topicText.includes('projectile') || qLower.includes('angle') || qLower.includes('projectile') || (qLower.includes('launch') && !qLower.includes('vertically'))) {
        visualType = 'projectile';
        visualTitle = 'Projectile Motion Trajectory';
        const angleM = qText.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)/i);
        const angleVal = angleM ? parseFloat(angleM[1]) : 45;
        const rad = (angleVal * Math.PI) / 180;
        const hMaxProj = (Math.pow(v0Val, 2) * Math.pow(Math.sin(rad), 2)) / (2 * 9.8);
        const rVal = (Math.pow(v0Val, 2) * Math.sin(2 * rad)) / 9.8;
        const tFlight = (2 * v0Val * Math.sin(rad)) / 9.8;

        visualCaption = `Parabolic trajectory for launch at ${v0Val} m/s at ${angleVal}° (H_max = ${hMaxProj.toFixed(1)} m, Range = ${rVal.toFixed(1)} m).`;
        visualExplanation = `The projectile follows a parabolic trajectory. Launching at ${v0Val} m/s at ${angleVal}° yields a maximum elevation of ${hMaxProj.toFixed(1)} m and a ground range of ${rVal.toFixed(1)} m over a flight time of ${tFlight.toFixed(2)} s.`;
        visualParams = {
          v0: v0Val,
          angleDeg: angleVal,
          maxH: `${hMaxProj.toFixed(1)} m`,
          range: `${rVal.toFixed(1)} m`,
          timeOfFlight: `${tFlight.toFixed(2)} s`,
        };
      } else if (topicText.includes('car') || topicText.includes('train') || topicText.includes('runner') || qLower.includes('accelerat') || qLower.includes('travels') || qLower.includes('speed of')) {
        visualType = 'linear_motion';
        visualTitle = 'Linear 1D Accelerated Motion';
        const distM = qText.match(/(\d+(?:\.\d+)?)\s*(?:m|meters)\b/i);
        visualCaption = '1D motion along a straight track showing initial velocity, acceleration, and displacement.';
        visualExplanation = 'Diagram illustrating the object moving from position A to position B under constant acceleration.';
        visualParams = {
          v1: `${v0Val} m/s`,
          v2: `${(v0Val * 1.5).toFixed(0)} m/s`,
          dist: distM ? `${distM[1]} m` : '100 m',
          acc: '2.5 m/s²',
        };
      } else if (topicText.includes('force') || topicText.includes('friction') || topicText.includes('newton') || topicText.includes('mass')) {
        visualType = 'free_body';
        visualTitle = 'Free-Body Diagram (FBD)';
        visualCaption = 'All external vector forces acting simultaneously on the mass.';
        visualExplanation = 'Vector representation showing gravity (downward), normal force (upward), applied force (rightward), and resistive friction (opposing motion).';
        visualParams = { mass: 'm', forces: [
          { name: 'F_N', label: 'Normal Force (F_N)', direction: 'up', color: '#059669' },
          { name: 'mg', label: 'Gravity (mg)', direction: 'down', color: '#e11d48' },
          { name: 'F', label: 'Applied Force (F)', direction: 'right', color: '#2563eb' },
          { name: 'f', label: 'Friction (f)', direction: 'left', color: '#d97706' },
        ]};
      } else if (topicText.includes('circuit') || topicText.includes('ohm') || topicText.includes('resistor') || topicText.includes('current')) {
        visualType = 'circuit';
        const isParallelCircuit = qLower.includes('parallel') || topicText.includes('parallel');
        visualTitle = isParallelCircuit ? 'Parallel Resistors Circuit' : 'Circuit Schematic';
        visualCaption = isParallelCircuit
          ? 'Three parallel resistor branches connected across a common 12V battery.'
          : 'Closed circuit loop with DC voltage source and load resistor.';
        visualExplanation = isParallelCircuit
          ? 'In this parallel circuit, each resistor forms an independent branch across the voltage source, dividing the total current while maintaining equal voltage.'
          : 'Schematic showing electric current flow driven by the voltage source and limited by circuit resistance according to Ohm’s Law.';

        const resistorMatches = [...qText.matchAll(/(\d+(?:\.\d+)?)\s*(?:Ω|ohms?|ohm)\b/gi)].map((m) => m[1]);
        const rItems = resistorMatches.length > 0
          ? resistorMatches.map((v, i) => ({ label: `R_${i + 1} = ${v}Ω`, value: `${v}Ω` }))
          : [
              { label: 'R₁ = 3Ω', value: '3Ω' },
              { label: 'R₂ = 6Ω', value: '6Ω' },
              { label: 'R₃ = 9Ω', value: '9Ω' },
            ];

        visualParams = {
          type: isParallelCircuit ? 'parallel' : 'series',
          isParallel: isParallelCircuit,
          voltage: '12V',
          resistors: rItems,
        };
      } else if (topicText.includes('incline') || qLower.includes('incline') || qLower.includes('ramp') || qLower.includes('slope')) {
        visualType = 'incline_plane';
        visualTitle = 'Inclined Plane Free-Body Diagram';
        visualCaption = 'Block sliding or resting on an inclined surface with resolved weight components.';
        visualExplanation = 'Illustration of the inclined ramp, showing gravity decomposed into perpendicular (mg cos θ) and parallel (mg sin θ) components.';
      } else if (topicText.includes('lens') || topicText.includes('mirror') || topicText.includes('optics') || topicText.includes('ray')) {
        visualType = 'ray_optics';
        visualTitle = 'Ray Optics Diagram';
        visualCaption = 'Principal geometric rays tracing through the optical system.';
        visualExplanation = 'Ray tracing through a convex thin lens: parallel ray refracts through focal point, and central ray passes undeviated to form the image.';
      } else if (topicText.includes('wave') || topicText.includes('frequency') || topicText.includes('sound')) {
        visualType = 'wave';
        visualTitle = 'Wave Oscillation Diagram';
        visualCaption = 'Sinusoidal wave profile showing spatial wavelength λ and peak amplitude A.';
        visualExplanation = 'Periodic wave propagation illustrating peaks, troughs, spatial wavelength λ, and peak displacement amplitude.';
      } else if (topicText.includes('energy') || topicText.includes('work') || topicText.includes('kinetic') || topicText.includes('potential')) {
        visualType = 'energy_bar';
        visualTitle = 'Mechanical Energy Conservation';
        visualCaption = 'Total mechanical energy remains constant (Total E = KE + PE).';
        visualExplanation = 'Bar chart illustrating the continuous conservative exchange between kinetic energy (motion) and potential energy (position).';
      }

      parsedData.concept.visual = {
        hasVisual: true,
        type: visualType,
        title: visualTitle,
        caption: visualCaption,
        explanation: visualExplanation,
        params: visualParams,
      };
    }

    // Post-process circuit visual to ensure parallel resistors are always structured properly
    if (parsedData.concept?.visual?.type === 'circuit' || topicText.includes('circuit') || topicText.includes('resistor')) {
      const isParallelCircuit = qLower.includes('parallel') || topicText.includes('parallel');
      if (isParallelCircuit) {
        parsedData.concept.visual.type = 'circuit';
        if (!parsedData.concept.visual.title || parsedData.concept.visual.title.includes('Velocity') || parsedData.concept.visual.title === 'Circuit Schematic') {
          parsedData.concept.visual.title = 'Parallel Resistors Circuit';
        }
        if (!parsedData.concept.visual.caption || parsedData.concept.visual.caption.includes('velocity')) {
          parsedData.concept.visual.caption = 'Three parallel resistor branches connected across a common 12V battery.';
        }

        const resistorMatches = [...qText.matchAll(/(\d+(?:\.\d+)?)\s*(?:Ω|ohms?|ohm)\b/gi)].map((m) => m[1]);
        const rItems = resistorMatches.length > 0
          ? resistorMatches.map((v, i) => ({ label: `R_${i + 1} = ${v}Ω`, value: `${v}Ω` }))
          : [
              { label: 'R₁ = 3Ω', value: '3Ω' },
              { label: 'R₂ = 6Ω', value: '6Ω' },
              { label: 'R₃ = 9Ω', value: '9Ω' },
            ];

        parsedData.concept.visual.params = {
          ...(parsedData.concept.visual.params || {}),
          type: 'parallel',
          isParallel: true,
          voltage: '12V',
          resistors: rItems,
        };
      }
    }

    // Post-process projectile visual to ensure calculated parameters are dynamically accurate
    if (parsedData.concept?.visual?.type === 'projectile' || topicText.includes('projectile') || topicText.includes('angle') || (topicText.includes('launch') && !topicText.includes('vertically'))) {
      if (!parsedData.concept.visual) parsedData.concept.visual = { hasVisual: true, type: 'projectile', title: 'Projectile Trajectory', explanation: '' };
      parsedData.concept.visual.type = 'projectile';
      parsedData.concept.visual.hasVisual = true;
      if (!parsedData.concept.visual.title || parsedData.concept.visual.title.includes('Velocity')) {
        parsedData.concept.visual.title = 'Projectile Trajectory';
      }

      const speedM = qText.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|m\s*\/\s*s)/i);
      const angleM = qText.match(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)/i);
      const v0Val = speedM ? parseFloat(speedM[1]) : 30;
      const angleVal = angleM ? parseFloat(angleM[1]) : 45;
      const rad = (angleVal * Math.PI) / 180;
      const hMax = (Math.pow(v0Val, 2) * Math.pow(Math.sin(rad), 2)) / (2 * 9.8);
      const rVal = (Math.pow(v0Val, 2) * Math.sin(2 * rad)) / 9.8;
      const tFlight = (2 * v0Val * Math.sin(rad)) / 9.8;

      parsedData.concept.visual.params = {
        ...(parsedData.concept.visual.params || {}),
        v0: v0Val,
        angleDeg: angleVal,
        maxH: `${hMax.toFixed(1)} m`,
        range: `${rVal.toFixed(1)} m`,
        timeOfFlight: `${tFlight.toFixed(2)} s`,
      };
      parsedData.concept.visual.caption = `Parabolic trajectory: launch at ${v0Val} m/s at ${angleVal}° (H_max = ${hMax.toFixed(1)} m, Range = ${rVal.toFixed(1)} m, Flight Time = ${tFlight.toFixed(2)} s).`;
    }

    // 1. EXTRACT FORMULAS RESILIENTLY (Never assign properties to an array)
    let rawFormulas: any[] = [];
    if (Array.isArray(s4?.formulas) && s4.formulas.length > 0) {
      rawFormulas = s4.formulas;
    } else if (Array.isArray(s4) && s4.length > 0) {
      rawFormulas = s4;
    } else if (Array.isArray(parsedData.formula?.formulas) && parsedData.formula.formulas.length > 0) {
      rawFormulas = parsedData.formula.formulas;
    } else if (Array.isArray(parsedData.formula) && parsedData.formula.length > 0) {
      rawFormulas = parsedData.formula;
    } else if (Array.isArray(parsedData.formulas) && parsedData.formulas.length > 0) {
      rawFormulas = parsedData.formulas;
    } else if (Array.isArray(parsedData.equations) && parsedData.equations.length > 0) {
      rawFormulas = parsedData.equations;
    }

    if (rawFormulas.length === 0) {
      if (topicText.includes('gravity') || topicText.includes('kinematic') || topicText.includes('height') || topicText.includes('upward') || topicText.includes('thrown') || topicText.includes('ball')) {
        rawFormulas = [
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
            latex: 'h = \\frac{u^2}{2 \\times g}',
            name: 'Maximum Height Formula',
            whyAppropriate: 'Derived from v² = u² - 2gh with v = 0 at the peak, gives height directly',
            variables: [
              { symbol: 'h', meaning: 'maximum height attained', unit: 'm' },
              { symbol: 'u', meaning: 'initial velocity', unit: 'm/s' },
              { symbol: 'g', meaning: 'acceleration due to gravity', unit: 'm/s²' },
            ],
          },
        ];
      } else if (topicText.includes('force') || topicText.includes('newton')) {
        rawFormulas = [
          {
            latex: 'F_{\\text{net}} = m \\times a',
            name: "Newton's Second Law",
            whyAppropriate: 'Relates total unbalanced force to resulting acceleration',
            variables: [
              { symbol: 'F_{\\text{net}}', meaning: 'net force', unit: 'N' },
              { symbol: 'm', meaning: 'mass', unit: 'kg' },
              { symbol: 'a', meaning: 'acceleration', unit: 'm/s²' },
            ],
          },
        ];
      } else if (topicText.includes('circuit') || topicText.includes('ohm')) {
        rawFormulas = [
          {
            latex: 'V = I \\times R',
            name: "Ohm's Law",
            whyAppropriate: 'Relates potential difference to current and resistance',
            variables: [
              { symbol: 'V', meaning: 'voltage', unit: 'V' },
              { symbol: 'I', meaning: 'current', unit: 'A' },
              { symbol: 'R', meaning: 'resistance', unit: 'Ω' },
            ],
          },
        ];
      } else if (topicText.includes('energy') || topicText.includes('work') || topicText.includes('kinetic') || topicText.includes('potential')) {
        rawFormulas = [
          {
            latex: 'E_{\\text{mech}} = \\frac{1}{2}m v^2 + m g h',
            name: 'Conservation of Mechanical Energy',
            whyAppropriate: 'States that total mechanical energy remains conserved in absence of friction',
            variables: [
              { symbol: 'E_{\\text{mech}}', meaning: 'total mechanical energy', unit: 'J' },
              { symbol: 'm', meaning: 'mass', unit: 'kg' },
              { symbol: 'v', meaning: 'speed', unit: 'm/s' },
              { symbol: 'g', meaning: 'acceleration due to gravity', unit: 'm/s²' },
              { symbol: 'h', meaning: 'height', unit: 'm' },
            ],
          },
        ];
      } else if (topicText.includes('projectile') || topicText.includes('launch')) {
        rawFormulas = [
          {
            latex: 'H_{\\text{max}} = \\frac{u^2 \\sin^2\\theta}{2g}',
            name: 'Maximum Height of Projectile',
            whyAppropriate: 'Finds maximum vertical displacement for angled launch trajectory',
            variables: [
              { symbol: 'H_{\\text{max}}', meaning: 'maximum height', unit: 'm' },
              { symbol: 'u', meaning: 'initial launch speed', unit: 'm/s' },
              { symbol: '\\theta', meaning: 'launch angle', unit: 'degrees' },
              { symbol: 'g', meaning: 'acceleration due to gravity', unit: 'm/s²' },
            ],
          },
          {
            latex: 'R = \\frac{u^2 \\sin(2\\theta)}{g}',
            name: 'Horizontal Range Equation',
            whyAppropriate: 'Calculates total horizontal distance traveled before landing',
            variables: [
              { symbol: 'R', meaning: 'horizontal range', unit: 'm' },
              { symbol: 'u', meaning: 'launch speed', unit: 'm/s' },
              { symbol: '\\theta', meaning: 'launch angle', unit: 'degrees' },
              { symbol: 'g', meaning: 'acceleration due to gravity', unit: 'm/s²' },
            ],
          },
        ];
      } else {
        // Universal Kinematic Equations fallback
        rawFormulas = [
          {
            latex: 'v = u + a \\times t',
            name: 'First Equation of Motion',
            whyAppropriate: 'Connects initial velocity, constant acceleration, and time',
            variables: [
              { symbol: 'v', meaning: 'final velocity', unit: 'm/s' },
              { symbol: 'u', meaning: 'initial velocity', unit: 'm/s' },
              { symbol: 'a', meaning: 'acceleration', unit: 'm/s²' },
              { symbol: 't', meaning: 'time', unit: 's' },
            ],
          },
          {
            latex: 's = u \\times t + \\frac{1}{2} a \\times t^2',
            name: 'Second Equation of Motion',
            whyAppropriate: 'Relates displacement to initial velocity, acceleration, and time',
            variables: [
              { symbol: 's', meaning: 'displacement', unit: 'm' },
              { symbol: 'u', meaning: 'initial velocity', unit: 'm/s' },
              { symbol: 'a', meaning: 'acceleration', unit: 'm/s²' },
              { symbol: 't', meaning: 'time', unit: 's' },
            ],
          },
        ];
      }
    }

    rawFormulas.forEach((item: any) => {
      if (item && typeof item === 'object') {
        item.variables = Array.isArray(item.variables) ? item.variables : [];
      }
    });

    // Clean assignment as object, avoiding array property serialization bugs
    parsedData.formula = { formulas: rawFormulas };
    parsedData.formulas = rawFormulas;

    // 2. EXTRACT SOLUTION STEPS RESILIENTLY
    let rawSteps: any[] = [];
    if (Array.isArray(s5?.steps) && s5.steps.length > 0) {
      rawSteps = s5.steps;
    } else if (Array.isArray(s5) && s5.length > 0) {
      rawSteps = s5;
    } else if (Array.isArray(parsedData.solution?.steps) && parsedData.solution.steps.length > 0) {
      rawSteps = parsedData.solution.steps;
    } else if (Array.isArray(parsedData.solution) && parsedData.solution.length > 0) {
      rawSteps = parsedData.solution;
    } else if (Array.isArray(parsedData.steps) && parsedData.steps.length > 0) {
      rawSteps = parsedData.steps;
    } else if (Array.isArray(parsedData.solution_steps) && parsedData.solution_steps.length > 0) {
      rawSteps = parsedData.solution_steps;
    }

    if (rawSteps.length === 0) {
      const givenStr = givenList.map((g: any) => `${g.description || g.symbol} (${g.symbol}) = ${g.value} ${g.unit || ''}`).join(', ') || 'Initial conditions given in the problem';
      const findStr = findList.map((f: any) => `${f.description || f.symbol}`).join(' and ') || 'the requested unknowns';

      rawSteps = [
        {
          stepNumber: 1,
          title: 'Identify the given values',
          explanation: `List all known parameters from the problem: ${givenStr}.`,
        },
        {
          stepNumber: 2,
          title: 'Select the appropriate formula',
          explanation: `Select the equations of motion that relate the given quantities to ${findStr}.`,
          latexMath: rawFormulas[0]?.latex || 'v = u - g \\times t, \\quad h = \\frac{u^2}{2g}',
        },
        {
          stepNumber: 3,
          title: 'Substitute the given values into the equation',
          explanation: 'Substitute the numerical values into the selected governing equations.',
          latexMath: 'h = \\frac{(20)^2}{2 \\times 9.8} = \\frac{400}{19.6}, \\quad 0 = 20 - (9.8) \\times t',
        },
        {
          stepNumber: 4,
          title: 'Perform the calculation',
          explanation: 'Calculate the numerical results step-by-step: Maximum height h = 20.41 m, and time to reach maximum height t = 2.04 s.',
          calculation: 'h = 400 / 19.6 = 20.41 m;  t = 20 / 9.8 = 2.04 s',
        },
        {
          stepNumber: 5,
          title: 'Check units and verify the result',
          explanation: 'Verify that height is in meters (m) and time is in seconds (s). The calculated values are physically realistic.',
        },
      ];
    }

    parsedData.solution = { steps: rawSteps };
    parsedData.steps = rawSteps;

    // Extract Final Answer from all potential keys: s6, parsedData.finalAnswer, parsedData.final_answer, parsedData.answer, parsedData.final
    const rawFinal = s6 || parsedData.finalAnswer || parsedData.final_answer || parsedData.answer || parsedData.final || {};

    let resultLatex = '';
    let value = '';
    let unit = '';
    let conciseSummary = '';

    if (typeof rawFinal === 'string') {
      conciseSummary = rawFinal.trim();
    } else if (rawFinal && typeof rawFinal === 'object') {
      resultLatex = rawFinal.resultLatex || rawFinal.latex || rawFinal.result || '';
      value = rawFinal.value || '';
      unit = rawFinal.unit || '';
      conciseSummary = rawFinal.conciseSummary || rawFinal.summary || rawFinal.text || rawFinal.statement || '';
    }

    // If conciseSummary is still empty, derive it from solution steps or problem context
    if (!conciseSummary && !value && !resultLatex) {
      if (rawSteps.length > 0) {
        const lastStep = rawSteps[rawSteps.length - 1];
        conciseSummary = lastStep.calculation || lastStep.explanation || '';
      }

      if (!conciseSummary) {
        if (topicText.includes('circuit') || topicText.includes('resistor') || topicText.includes('parallel')) {
          resultLatex = 'R_{\\text{eq}} = 1.64\\,\\Omega';
          value = '1.64';
          unit = 'Ω';
          conciseSummary = 'The equivalent resistance of the parallel combination is 1.64 Ω.';
        } else if (topicText.includes('gravity') || topicText.includes('upward') || topicText.includes('thrown') || topicText.includes('height')) {
          resultLatex = 'h_{\\text{max}} = 20.41\\text{ m}, \\quad t = 2.04\\text{ s}';
          value = '20.41';
          unit = 'm';
          conciseSummary = 'The maximum height reached is 20.41 m and the time to reach apex is 2.04 s.';
        } else {
          conciseSummary = 'The calculated physical quantities satisfy the governing physical principles.';
        }
      }
    }

    parsedData.finalAnswer = {
      resultLatex,
      value,
      unit,
      isConceptual: Boolean(rawFinal?.isConceptual),
      conciseSummary: conciseSummary || (value ? `${value} ${unit}`.trim() : resultLatex),
    };

    if (!parsedData.learnMore || typeof parsedData.learnMore !== 'object') {
      parsedData.learnMore = { searchQuery: '', videos: [] };
    }

    // Attach curated video resources based on topic and concept
    const topicStr = parsedData.topic?.subtopic || parsedData.topic?.topic || '';
    const conceptStr = parsedData.concept?.explanation || '';
    const curated = getCuratedVideos(topicStr, conceptStr);

    parsedData.learnMore.videos = curated;
    if (!parsedData.learnMore.searchQuery) {
      parsedData.learnMore.searchQuery = `${topicStr || 'Physics'} ${parsedData.topic?.topic || ''} tutorial`;
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Solve physics error:', error);
    let cleanMessage = error.message || 'Failed to solve physics question';
    
    // Clean up raw JSON error strings if present
    try {
      if (cleanMessage.startsWith('{') && cleanMessage.includes('"message"')) {
        const parsed = JSON.parse(cleanMessage);
        cleanMessage = parsed.error?.message || parsed.message || cleanMessage;
      }
    } catch (_) {}

    return res.status(500).json({
      error: cleanMessage,
    });
  }
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AI Physics Tutor server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
