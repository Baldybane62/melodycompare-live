import React, { useState, useCallback, useEffect } from 'react';
import type { Notification, Stem, Alternative } from '../types';
import FileUpload from './FileUpload';
import Loader from './Loader';
import AudioPlayer from './AudioPlayer';
import { generateStemAlternatives } from '../services/geminiService';
import { WandSparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon, MusicNoteIcon, CheckIcon, ClipboardIcon } from './icons';

interface RemixPageProps {
    onAddNotification: (type: Notification['type'], message: string) => void;
}

type RemixState = 'upload' | 'processing' | 'workbench';

const initialStems: Stem[] = [
    { id: 'vocals', name: 'Vocals', volume: 80, isMuted: false, isSolo: false },
    { id: 'melody', name: 'Melody', volume: 90, isMuted: false, isSolo: false },
    { id: 'bass', name: 'Bass', volume: 100, isMuted: false, isSolo: false },
    { id: 'drums', name: 'Drums', volume: 85, isMuted: false, isSolo: false },
];

const StemTrack: React.FC<{
    stem: Stem;
    onUpdate: (updatedStem: Stem) => void;
    onGenerate: (stemId: string) => void;
    alternatives: Alternative[] | undefined;
    isLoading: boolean;
    selectedAlternativeId: string | null;
    onSelectAlternative: (alternativeId: string) => void;
    onAddNotification: RemixPageProps['onAddNotification'];
}> = ({ stem, onUpdate, onGenerate, alternatives, isLoading, selectedAlternativeId, onSelectAlternative, onAddNotification }) => {
    
    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            onAddNotification('info', 'Idea copied to clipboard!');
        }).catch(err => {
            onAddNotification('error', 'Failed to copy idea.');
            console.error('Failed to copy: ', err);
        });
    }

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
            <div className="flex items-center gap-4">
                <p className="font-bold text-white w-20">{stem.name}</p>
                <button onClick={() => onUpdate({ ...stem, isMuted: !stem.isMuted })} className="p-2 text-slate-400 hover:text-white" aria-label={stem.isMuted ? 'Unmute' : 'Mute'}>
                    {stem.isMuted ? <SpeakerXMarkIcon className="w-5 h-5 text-red-400"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                </button>
                <button onClick={() => onUpdate({ ...stem, isSolo: !stem.isSolo })} className={`px-2 py-0.5 text-xs font-bold rounded-full border transition-colors ${stem.isSolo ? 'bg-sky-500 text-white border-sky-400' : 'text-slate-400 border-slate-600 hover:bg-slate-700'}`}>
                    SOLO
                </button>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={stem.volume}
                    onChange={(e) => onUpdate({ ...stem, volume: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb"
                />
                <button
                    onClick={() => onGenerate(stem.id)}
                    disabled={isLoading}
                    className="p-2 text-fuchsia-400 hover:text-white hover:bg-fuchsia-500/20 rounded-full transition-colors disabled:opacity-50"
                    aria-label="Generate alternatives"
                >
                    <WandSparklesIcon className="w-5 h-5"/>
                </button>
            </div>
            {(isLoading || (alternatives && alternatives.length > 0)) && (
                <div className="pl-24 pt-2 border-t border-slate-700/50">
                    {isLoading ? <Loader text={`Generating ${stem.name.toLowerCase()} ideas...`} /> : (
                        <div className="space-y-2">
                             {alternatives?.map(alt => (
                                <div key={alt.id} className="bg-slate-800 p-2.5 rounded-md flex items-center gap-3 text-sm">
                                    <MusicNoteIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                                    <p className="text-slate-300 flex-grow">{alt.content}</p>
                                    <button onClick={() => handleCopy(alt.content)} className="p-1.5 text-slate-400 hover:text-white" aria-label="Copy suggestion">
                                        <ClipboardIcon className="w-4 h-4"/>
                                    </button>
                                    <button
                                        onClick={() => onSelectAlternative(alt.id)}
                                        className={`p-1.5 rounded-md transition-colors ${selectedAlternativeId === alt.id ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                        aria-label="Select this alternative"
                                    >
                                        <CheckIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const RemixPage: React.FC<RemixPageProps> = ({ onAddNotification }) => {
    const [remixState, setRemixState] = useState<RemixState>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [stems, setStems] = useState<Stem[]>(initialStems);
    const [alternatives, setAlternatives] = useState<Record<string, Alternative[]>>({});
    const [loadingStemId, setLoadingStemId] = useState<string | null>(null);
    const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, string>>({});

    const handleFileSelect = (file: File | null) => {
        if (file) {
            setUploadedFile(file);
            setRemixState('processing');
            // Simulate processing time for stem separation
            setTimeout(() => {
                setRemixState('workbench');
                onAddNotification('success', 'Song processed and stems separated!');
            }, 2500);
        }
    };
    
    const handleUpdateStem = (updatedStem: Stem) => {
        setStems(prevStems => prevStems.map(s => s.id === updatedStem.id ? updatedStem : s));
    };

    const handleGenerateAlternatives = async (stemId: string) => {
        setLoadingStemId(stemId);
        try {
            const stemName = stems.find(s => s.id === stemId)?.name || 'track';
            const result = await generateStemAlternatives(stemName);
            setAlternatives(prev => ({ ...prev, [stemId]: result }));
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
            onAddNotification('error', `Failed to generate ideas: ${errorMsg}`);
        } finally {
            setLoadingStemId(null);
        }
    };

    const handleSelectAlternative = (stemId: string, alternativeId: string) => {
        setSelectedAlternatives(prev => ({ ...prev, [stemId]: alternativeId }));
        onAddNotification('info', 'Alternative selected for stem.');
    };

    if (remixState === 'upload') {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Remix Workbench</h2>
                    <p className="mt-2 text-lg text-slate-400">Upload a track to separate it into stems and generate AI-powered creative alternatives.</p>
                </div>
                <FileUpload
                    onFileSelect={handleFileSelect}
                    acceptedFormats="audio/mpeg, audio/wav, audio/mp4"
                    label="Drag & drop your song to begin"
                />
            </div>
        );
    }

    if (remixState === 'processing') {
        return <Loader text="Separating stems from your track..." />;
    }

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in-slow">
            <h2 className="text-3xl font-bold text-white mb-2">Remix Workbench</h2>
            <p className="text-slate-400 mb-6">Your track is ready. Adjust stems or generate AI alternatives.</p>
            
            <div className="space-y-4 mb-8">
                {stems.map(stem => (
                    <StemTrack
                        key={stem.id}
                        stem={stem}
                        onUpdate={handleUpdateStem}
                        onGenerate={() => handleGenerateAlternatives(stem.id)}
                        alternatives={alternatives[stem.id]}
                        isLoading={loadingStemId === stem.id}
                        selectedAlternativeId={selectedAlternatives[stem.id]}
                        onSelectAlternative={(altId) => handleSelectAlternative(stem.id, altId)}
                        onAddNotification={onAddNotification}
                    />
                ))}
            </div>

            <div className="sticky bottom-6 z-10">
                {uploadedFile && (
                    <AudioPlayer
                        src={URL.createObjectURL(uploadedFile)}
                        title={`Main Mix: ${uploadedFile.name}`}
                    />
                )}
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors">
                    Reset
                </button>
                <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg transition-colors">
                    Export Mix
                </button>
            </div>
            <style>{`
                .range-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -5px;
                }
                .range-thumb::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                }
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.7s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RemixPage;
