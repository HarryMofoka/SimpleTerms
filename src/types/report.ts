export type RiskLevel = "low" | "medium" | "high" | "critical";

export type Clause = {
  id: string;
  title: string;
  category: string;
  riskLevel: RiskLevel;
  plainEnglish: string;
  whyItMatters: string;
};

export type Obligation = {
  label: string;
  detail: string;
};

export type KeyDate = {
  label: string;
  value: string;
};

export type AnalysisReport = {
  contractType: string;
  confidence: string;
  summary: string;
  riskOverview: {
    level: RiskLevel;
    explanation: string;
  };
  obligations: Obligation[];
  keyDates: KeyDate[];
  clauses: Clause[];
  checklist: string[];
};
