
import React, { useState, useCallback } from 'react';
import { generateBrainstormingIdeas } from '../services/geminiService';
import type { AnalysisData, BrainstormMode, BrainstormResult, Notification } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';
import Loader from './Loader';

interface BrainstormingInterfaceProps {
    analysisData: AnalysisData;
    onAddNotification: (type: Notification['type'], message: string) => void;
}

const BrainstormButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
            isActive
                ? 'bg-fuchsia-500 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);

const ResultCard: React.FC<{ result: BrainstormResult; onCopy: () => void }> = ({ result, onCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(result.content).then(() => {
            setIsCopied(true);
            onCopy();
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <div className="bg-slate-900/70 p-4 rounded-lg flex justify-between items-center gap-4 transition-transform duration-300 hover:scale-[1.02]">
            <p className="text-slate-300 flex-grow">{result.content}</p>
            <button 
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors text-slate-400 hover:text-white"
                aria-label={isCopied ? "Copied" : "Copy idea"}
            >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
        </div>
    )
}

export const BrainstormingInterface: React.FC<BrainstormingInterfaceProps> = ({ analysisData, onAddNotification }) => {
    const [mode, setMode] = useState<BrainstormMode>('titles');
    const [theme, setTheme] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<BrainstormResult[]>([]);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const ideas = await generateBrainstormingIdeas(analysisData, mode, theme);
            setResults(ideas.map(content => ({ id: crypto.randomUUID(), content })));
            onAddNotification('success', `Generated new ${mode}!`);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
            onAddNotification('error', `Failed to generate ideas: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    }, [analysisData, mode, theme, onAddNotification]);
    
    return (
        <div className="flex-grow flex flex-col p-4 sm:p-6">
            <div className="flex-shrink-0">
                <h3 className="text-lg font-bold text-white">Creative Partner</h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">Stuck? Generate new ideas to make your track more unique.</p>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">1. Select a Category</label>
                    <div className="flex flex-wrap gap-2">
                        <BrainstormButton onClick={() => setMode('titles')} isActive={mode === 'titles'}>Song Titles</BrainstormButton>
                        <BrainstormButton onClick={() => setMode('lyrics')} isActive={mode === 'lyrics'}>Lyrical Concepts</BrainstormButton>
                        <BrainstormButton onClick={() => setMode('chords')} isActive={mode === 'chords'}>Chord Progressions</BrainstormButton>
                    </div>
                </div>

                <div className="mb-4">
                     <label htmlFor="theme-input" className="block text-sm font-medium text-slate-300 mb-2">2. Add an Optional Theme (e.g., "summer romance")</label>
                     <input
                        id="theme-input"
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="Enter theme..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                    />
                </div>
                
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-fuchsia-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Generate Ideas
                </button>
            </div>
            
            <div className="flex-grow mt-6 overflow-y-auto">
                {isLoading && <Loader text={`Generating ${mode}...`}/>}
                
                {error && (
                    <div className="flex justify-center">
                        <p className="text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-md">{error}</p>
                    </div>
                )}

                {results.length > 0 && (
                     <div className="space-y-3">
                        <h4 className="font-bold text-slate-200">Here are some ideas:</h4>
                        {results.map(result => <ResultCard key={result.id} result={result} onCopy={() => onAddNotification('info', 'Idea copied to clipboard!')} />)}
                     </div>
                )}

                {!isLoading && !error && results.length === 0 && (
                    <div className="text-center text-slate-500 pt-8">
                        <p>Your creative ideas will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};