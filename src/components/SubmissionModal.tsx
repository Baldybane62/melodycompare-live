
import React, { useState } from 'react';
import type { User, CatalogItem } from '../types';
import { XMarkIcon, CloudArrowUpIcon, CheckIcon } from './icons';
import { submitToCatalog } from '../services/geminiService';
import Loader from './Loader';

interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisId: string;
    riskScore: number;
    user: User;
    onSubmitSuccess: (newItem: CatalogItem) => void;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, analysisId, riskScore, user, onSubmitSuccess }) => {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [tags, setTags] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && ['audio/mpeg', 'audio/wav', 'audio/mp3'].includes(file.type)) {
            setAudioFile(file);
            setError('');
        } else {
            setAudioFile(null);
            setError('Invalid file type. Please upload MP3 or WAV.');
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !genre || !tags || !audioFile) {
            setError('All fields and an audio file are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre);
        formData.append('tags', tags);
        formData.append('audioFile', audioFile);
        formData.append('analysisId', analysisId);
        formData.append('riskScore', String(riskScore));
        formData.append('userId', user.email); // Using email as a unique ID for demo
        formData.append('userName', user.name);

        try {
            const newItem = await submitToCatalog(formData);
            onSubmitSuccess(newItem);
            onClose();
        } catch(e) {
            setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-lg w-full shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Submit to Cleared Catalog</h3>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full" aria-label="Close submission form">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isSubmitting ? (
                    <div className="py-12">
                        <Loader text="Submitting your track..." />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Song Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="input-style" placeholder="e.g., Midnight Drive" required />
                        </div>
                         <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                            <input type="text" id="genre" value={genre} onChange={e => setGenre(e.target.value)} className="input-style" placeholder="e.g., Lofi Hip Hop" required />
                        </div>
                         <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-2">Tags (comma-separated)</label>
                            <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="input-style" placeholder="e.g., chill, study, instrumental" required />
                        </div>
                         <div>
                            <label htmlFor="audioFile" className="block text-sm font-medium text-slate-300 mb-2">High-Quality Audio File (MP3, WAV)</label>
                            <label className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${
                                audioFile ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-fuchsia-500 cursor-pointer'
                            }`}>
                                {audioFile ? <CheckIcon className="w-6 h-6 text-green-400" /> : <CloudArrowUpIcon className="w-6 h-6 text-slate-400" />}
                                <span className={audioFile ? 'text-green-300' : 'text-slate-300'}>
                                    {audioFile ? `Selected: ${audioFile.name}` : 'Click to select file'}
                                </span>
                                <input id="audioFile" type="file" className="sr-only" onChange={handleFileChange} accept="audio/mpeg,audio/wav,audio/mp3" />
                            </label>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary">Submit Track</button>
                        </div>
                    </form>
                )}
            </div>
             <style>{`
                .input-style {
                    width: 100%;
                    background-color: rgb(15 23 42 / 1); /* slate-900 */
                    border: 1px solid rgb(51 65 85 / 1); /* slate-600 */
                    border-radius: 0.5rem;
                    padding: 0.6rem 0.75rem;
                    color: rgb(203 213 225 / 1); /* slate-300 */
                }
                .input-style:focus {
                    outline: none;
                    --tw-ring-color: rgb(217 70 239 / 1); /* fuchsia-500 */
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                }
                .btn-primary { background-color: rgb(162 28 175); color: white; font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-primary:hover:not(:disabled) { background-color: rgb(192 38 211); }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-secondary { background-color: rgb(71 85 105); color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-secondary:hover { background-color: rgb(100 116 139); }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SubmissionModal;