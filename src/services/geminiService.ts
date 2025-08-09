import type { AnalysisResultPayload, BrainstormMode, ChatMessage, AnalysisData, ChatContext, CatalogItem, SystemStatus, Alternative} from '../types';

// This line now correctly uses the environment variable set in Render.
// It will be 'https://melodycompare-backend.onrender.com' in production.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * A helper function to handle API responses and errors.
 * @param response The fetch Response object.
 * @returns The JSON response.
 * @throws An error if the response is not ok.
 */
async function handleResponse(response: Response ) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    // Handle streaming responses
    if (response.headers.get('Content-Type')?.includes('text/plain')) {
        return response.body;
    }
    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204) {
        return { success: true };
    }
    return response.json();
}

// A new helper function to handle the response for the chat stream specifically.
async function handleApiResponse(response: Response, functionName: string) {
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error in ${functionName}: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.body;
}


export async function analyzeFile(file: File): Promise<AnalysisResultPayload> {
    const formData = new FormData();
    formData.append('audioFile', file);
    const response = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body: formData });
    return handleResponse(response);
}

export async function compareFiles(aiSong: File, copyrightedSong: File): Promise<AnalysisResultPayload> {
    const formData = new FormData();
    formData.append('aiSong', aiSong);
    formData.append('copyrightedSong', copyrightedSong);
    const response = await fetch(`${API_BASE_URL}/api/compare`, { method: 'POST', body: formData });
    return handleResponse(response);
}

export async function uploadAnalysisAudio(file: File, analysisId: string): Promise<void> {
    const formData = new FormData();
    formData.append('audioFile', file);
    const response = await fetch(`${API_BASE_URL}/api/analysis-audio/${analysisId}`, {
        method: 'POST',
        body: formData,
    });
    await handleResponse(response);
}

export async function getChatAssistantStream(history: ChatMessage[], message: string, context: ChatContext): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${API_BASE_URL}/api/assistant-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message, context }),
    });
    const body = await handleResponse(response);
    if (!body) {
        throw new Error("Failed to get chat stream.");
    }
    return body;
}

export async function generateBrainstormingIdeas(analysisData: AnalysisData, mode: BrainstormMode, theme?: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/brainstorm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData, mode, theme }),
    });
    return handleResponse(response);
}

export async function enhanceMusicPrompt(basePrompt: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/enhance-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrompt }),
    });
    const data = await handleResponse(response);
    return data.enhancedPrompt;
}

export async function generateReport(analysisData: AnalysisData): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData }),
    });
    const data = await handleResponse(response);
    return data.reportText;
}

export async function publishAnalysis(analysisData: AnalysisData, reportText: string): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData, reportText }),
    });
    return handleResponse(response);
}

export async function getSharedAnalysis(id: string): Promise<AnalysisResultPayload> {
    const response = await fetch(`${API_BASE_URL}/api/analysis/${id}`);
    return handleResponse(response);
}

export async function sendFeedback(type: string, message: string, email?: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email }),
    });
    return handleResponse(response);
}

export async function submitToCatalog(formData: FormData): Promise<CatalogItem> {
    const response = await fetch(`${API_BASE_URL}/api/catalog/submit`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
}

export async function getCatalogEntries(): Promise<CatalogItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/catalog/entries`);
    return handleResponse(response);
}

/**
 * Sends a follow-up message to the chat endpoint and returns a readable stream of the response.
 * @param history The entire chat history.
 * @param message The new message from the user.
 * @returns A Promise that resolves to a ReadableStream of the AI's response text.
 */
export async function getReportChatStream(
    history: ChatMessage[],
    message: string
): Promise<ReadableStream<Uint8Array>> {
     try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history, message }),
        });

        const body = await handleApiResponse(response, 'getReportChatStream');
        if (!body) {
            throw new Error("The response body from the stream is null.");
        }
        return body;
    } catch (error) {
        console.error(`Error in getReportChatStream:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to get chat stream: ${error.message}`);
        }
        throw new Error(`An unknown error occurred during getReportChatStream.`);
    }
}

export async function getSystemStatus(): Promise<SystemStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch system status:', error);
    return null;
  }
}

export async function generateStemAlternatives(stemName: string): Promise<Alternative[]> {
    const response = await fetch(`${API_BASE_URL}/api/stem-alternatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stemName }),
    });
    return handleResponse(response);
}
