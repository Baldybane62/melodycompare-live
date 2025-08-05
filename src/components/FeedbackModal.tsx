
import React, { useState } from 'react';
import type { User } from '../types';
import { XMarkIcon } from './icons';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: string, message: string, email?: string) => Promise<void>;
    user: User | null;
}

type FeedbackType = 'Bug Report' | 'Feature Suggestion' | 'General Feedback';

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
    const [type, setType] = useState<FeedbackType>('Bug Report');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Please enter a message.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await onSubmit(type, message, user?.email || email);
            setIsSubmitted(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to send feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        // Reset state on close for next time it's opened
        setTimeout(() => {
            setIsSubmitted(false);
            setMessage('');
            setEmail('');
            setType('Bug Report');
            setError('');
        }, 300); // delay to allow for closing animation
        onClose();
    }
    
    const TypeButton: React.FC<{ value: FeedbackType }> = ({ value }) => (
        <button
            type="button"
            onClick={() => setType(value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2 flex-grow ${
                type === value
                    ? 'bg-fuchsia-500 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
            }`}
        >
            {value}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={handleClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-lg w-full shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">{isSubmitted ? "Thank You!" : "Submit Feedback"}</h3>
                     <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full" aria-label="Close feedback form">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isSubmitted ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-slate-300">Your feedback has been sent successfully.</p>
                        <p className="text-slate-400 mt-2">We appreciate you helping us improve MelodyCompare!</p>
                        <button
                            onClick={handleClose}
                            className="mt-8 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Feedback Type</label>
                            <div className="flex gap-2">
                                <TypeButton value="Bug Report" />
                                <TypeButton value="Feature Suggestion" />
                                <TypeButton value="General Feedback" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={5}
                                required
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                                placeholder={
                                    type === 'Bug Report' ? 'Please describe the bug and how to reproduce it...' :
                                    type === 'Feature Suggestion' ? 'What new feature would you like to see?' :
                                    'What\'s on your mind?'
                                }
                            />
                        </div>
                         {!user && (
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Your Email (Optional)</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                                    placeholder="So we can get back to you"
                                />
                            </div>
                        )}
                        
                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default FeedbackModal;
