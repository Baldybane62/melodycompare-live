// MelodyCompare Type Definitions

export interface AnalysisResultPayload {
  analysisData: AnalysisData;
  reportText: string;
}

export interface AnalysisData {
  songTitle: string;
  artist?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  overallSimilarity: number;
  aiProbability: number;
}

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// New types for Remix feature
export interface Stem {
  id: string;
  name: string;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
}

export interface Alternative {
  id: string;
  content: string;
  confidence?: number;
}
