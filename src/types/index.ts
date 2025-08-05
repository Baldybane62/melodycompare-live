
export interface TimelinePoint {
  timestamp: number; // in seconds
  similarity: number; // percentage
}

export interface FingerprintMatch {
  title: string;
  artist: string;
  url: string;
  similarity: number;
}

export interface AnalysisData {
  overview: {
    similarity: number;
    aiProbability: number;
    riskLevel: string;
    riskScore: number;
    overallScore: number;
  };
  aiAnalysis: {
    confidence: number;
    platform: string;
    likelihood: string;
  };
  fingerprinting: {
    matches: FingerprintMatch[];
    highestSimilarity: number;
  };
  stemAnalysis: {
    vocals: {
      similarity: number;
      aiProbability: number;
    };
    drums: {
      similarity: number;
      aiProbability: number;
    };
  };
  similarityTimeline: TimelinePoint[];
}

export interface AnalysisResultPayload {
  analysisData: AnalysisData;
  reportText: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isLoading?: boolean;
}

export type BrainstormMode = 'titles' | 'lyrics' | 'chords';

export interface BrainstormResult {
  id: string;
  content: string;
}

export type InfoSection = 'mission' | 'faq' | 'help' | 'legal' | 'privacy' | 'terms' | 'status';

export interface LibraryItem {
  id: string;
  songTitle: string;
  date: string;
  data: AnalysisData;
}

export interface User {
  name: string;
  email: string;
}

export type AppState = 'home' | 'login' | 'analyzing' | 'analysis' | 'library' | 'prompt-composer' | 'info' | 'pricing' | 'dashboard' | 'account' | 'catalog';

export interface ChatContext {
  appState: AppState;
  analysisData?: AnalysisData | null;
}

export interface CatalogItem {
    id: string;
    analysisId: string;
    userId: string;
    userName: string;
    title: string;
    genre: string;
    tags: string[];
    dateSubmitted: string;
    riskScore: number;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export interface SystemStatus {
  geminiConfigured: boolean;
  acrCloudConfigured: boolean;
  acrHost: string | null;
  acrAccessKeySet: boolean;
  acrAccessSecretSet: boolean;
}
