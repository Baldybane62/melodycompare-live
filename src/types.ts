// MelodyCompare Complete Type Definitions

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
  overview?: {
    riskLevel: string;
    riskScore: number;
    overallSimilarity: number;
    aiProbability: number;
  };
  stemAnalysis?: {
    vocals: number;
    drums: number;
  };
  aiAnalysis?: {
    platform: string;
    confidence: number;
  };
  fingerprinting?: {
    matches: number;
    highestSimilarity: number;
    results?: FingerprintMatch[];
  };
  similarityTimeline?: TimelinePoint[];
}

export interface FingerprintMatch {
  title: string;
  artist: string;
  similarity: number;
}

export interface TimelinePoint {
  time: number;
  similarity: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscription?: string;
}

export interface AppState {
  currentPage: string;
  user: User | null;
  isLoading: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  artist: string;
  dateAnalyzed: string;
  riskLevel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  analysisData?: AnalysisData;
  reportText?: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  artist: string;
  description: string;
  audioUrl?: string;
}

export interface BrainstormMode {
  type: string;
  description: string;
}

export interface BrainstormResult {
  ideas: string[];
  mode: string;
}

export interface SystemStatus {
  status: string;
  services: {
    acrcloud: string;
    ai: string;
  };
}

export interface InfoSection {
  title: string;
  content: string;
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
