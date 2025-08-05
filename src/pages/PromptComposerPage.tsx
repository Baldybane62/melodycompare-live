
import React, { useState, useEffect, useCallback } from 'react';
import { enhanceMusicPrompt } from '../services/geminiService';
import { saveState, loadState } from '../services/localStorageService';
import { ClipboardIcon, CheckIcon, WandSparklesIcon } from '../components/icons';
import Loader from '../components/Loader';
import type { Notification } from '../types';

interface FieldsState {
    genre: string;
    mood: string;
    instrumentation: string;
    lyricalTheme: string;
}

interface InputFieldProps {
    name: keyof FieldsState;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isTextArea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, placeholder, value, onChange, isTextArea = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        {isTextArea ? (
             <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
            />
        ) : (
            <input
                id={name}
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
            />
        )}
    </div>
);


const PromptComposerPage: React.FC<{onAddNotification: (type: Notification['type'], message: string) => void}> = ({ onAddNotification }) => {
    const storageKey = 'promptComposerState';
    const [fields, setFields] = useState<FieldsState>(() => loadState<FieldsState>(`${storageKey}_fields`) || {
        genre: '',
        mood: '',
        instrumentation: '',
        lyricalTheme: ''
    });
    const [livePreview, setLivePreview] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState<string>(() => loadState<string>(`${storageKey}_enhanced`) || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update live preview when fields change
    useEffect(() => {
        const { genre, mood, instrumentation, lyricalTheme } = fields;
        const parts = [
            genre.trim() && `${genre.trim()}`,
            mood.trim() && `mood: ${mood.trim()}`,
            instrumentation.trim() && `instruments: ${instrumentation.trim()}`,
            lyricalTheme.trim() && `lyrics about: ${lyricalTheme.trim()}`
        ].filter(Boolean);
        setLivePreview(parts.join(', '));
    }, [fields]);

    // Save state to localStorage
    useEffect(() => {
        saveState(`${storageKey}_fields`, fields);
        saveState(`${storageKey}_enhanced`, enhancedPrompt);
    }, [fields, enhancedPrompt]);

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFields(prev => ({ ...prev, [name]: value }));
    };

    const handleEnhance = useCallback(async () => {
        if (!livePreview) return;
        setIsLoading(true);
        setError(null);
        setEnhancedPrompt('');
        try {
            const result = await enhanceMusicPrompt(livePreview);
            setEnhancedPrompt(result);
            onAddNotification('success', 'Prompt enhanced successfully!');
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMsg);
            onAddNotification('error', `Enhancement failed: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    }, [livePreview, onAddNotification]);
    
    const handleCopy = () => {
        if (!enhancedPrompt) return;
        navigator.clipboard.writeText(enhancedPrompt).then(() => {
            onAddNotification('info', 'Enhanced prompt copied to clipboard!');
        }).catch(err => {
             onAddNotification('error', 'Failed to copy prompt.');
            console.error('Failed to copy text: ', err)
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white">AI Music Prompt Composer</h2>
                <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">Build a prompt for AI music generators like Suno or Udio, then let our AI enhance it for you.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Builder */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5">
                    <h3 className="text-xl font-bold text-fuchsia-400">1. Build Your Prompt</h3>
                    <InputField name="genre" label="Genre & Style" placeholder="e.g., Lofi Hip Hop, cinematic epic" value={fields.genre} onChange={handleFieldChange} />
                    <InputField name="mood" label="Mood & Vibe" placeholder="e.g., nostalgic, dreamy, energetic" isTextArea value={fields.mood} onChange={handleFieldChange} />
                    <InputField name="instrumentation" label="Key Instruments" placeholder="e.g., Rhodes piano, upright bass, 808s" isTextArea value={fields.instrumentation} onChange={handleFieldChange} />
                    <InputField name="lyricalTheme" label="Lyrical Theme" placeholder="e.g., a rainy night in Tokyo, first love" isTextArea value={fields.lyricalTheme} onChange={handleFieldChange} />
                </div>

                {/* Right Side: Preview & Enhance */}
                <div className="space-y-8">
                     <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-fuchsia-400 mb-3">2. Live Preview</h3>
                        <div className="w-full bg-slate-900/80 rounded-lg p-4 min-h-[80px] text-slate-400 text-sm">
                            {livePreview || "Your prompt will appear here..."}
                        </div>
                    </div>
                     <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-fuchsia-400 mb-3">3. Enhance with AI</h3>
                        <p className="text-slate-400 text-sm mb-4">Let Gemini rewrite your prompt to be more descriptive and effective.</p>
                        <button
                            onClick={handleEnhance}
                            disabled={isLoading || !livePreview}
                            className="w-full bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <WandSparklesIcon className="w-5 h-5" />
                            {isLoading ? "Enhancing..." : "Enhance Prompt"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Result Section */}
            {(isLoading || enhancedPrompt || error) && (
                 <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Enhanced Prompt</h3>
                    {isLoading && <Loader text="Generating your enhanced prompt..." />}
                    {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
                    {enhancedPrompt && (
                        <div className="relative">
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1 px-2.5 rounded-lg text-xs transition-all"
                                aria-label="Copy prompt"
                            >
                                <ClipboardIcon className="w-4 h-4" />
                                Copy
                            </button>
                            <div className="bg-slate-900/80 text-slate-300 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                {enhancedPrompt}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PromptComposerPage;
