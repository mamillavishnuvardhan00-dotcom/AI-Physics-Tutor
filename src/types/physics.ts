export interface GivenValue {
  symbol: string;
  value: string;
  unit?: string;
  description: string;
}

export interface FindTarget {
  symbol: string;
  description: string;
  targetUnit?: string;
}

export interface VisualData {
  hasVisual: boolean;
  type:
    | 'free_body'
    | 'projectile'
    | 'graph_vt'
    | 'graph_xt'
    | 'graph_at'
    | 'circuit'
    | 'ray_optics'
    | 'wave'
    | 'energy_bar'
    | 'incline_plane'
    | 'vertical_motion'
    | 'linear_motion'
    | 'custom_svg';
  title: string;
  caption?: string;
  explanation: string;
  params?: Record<string, any>;
  svgMarkup?: string;
}

export interface TopicData {
  domain: string;
  branch: string;
  topic: string;
  subtopic: string;
  breadcrumb: string[];
}

export interface FormulaItem {
  latex: string;
  name: string;
  whyAppropriate: string;
  variables: Array<{
    symbol: string;
    meaning: string;
    unit?: string;
  }>;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  latexMath?: string;
  calculation?: string;
}

export interface FinalAnswerData {
  resultLatex: string;
  value: string;
  unit: string;
  isConceptual: boolean;
  conciseSummary: string;
}

export interface VideoResource {
  id: string;
  title: string;
  channel: string;
  description: string;
  url: string;
  thumbnailUrl: string;
}

export interface PhysicsProblemResponse {
  understand: {
    question?: string;
    rephrase: string;
    whatIsGiven?: string;
    whatToCalculate?: string;
    given: GivenValue[];
    find: FindTarget[];
  };
  topic: TopicData;
  concept: {
    conceptTitle?: string;
    simpleExplanation?: string;
    howDiagramComes?: string;
    explanation: string;
    whatIsHappening?: string;
    whyItApplies?: string;
    visual?: VisualData;
  };
  formula: {
    formulas: FormulaItem[];
  };
  solution: {
    steps: SolutionStep[];
  };
  finalAnswer: FinalAnswerData;
  learnMore: {
    searchQuery: string;
    videos: VideoResource[];
  };
}

export interface ConversationItem {
  id: string;
  title: string;
  timestamp: number;
  questionText: string;
  imageBase64: string | null;
  mimeType: string | null;
  result: PhysicsProblemResponse | null;
}
