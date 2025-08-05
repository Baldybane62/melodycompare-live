import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon, ClipboardIcon, CheckIcon } from './icons';
import ReportDisplay from './ReportDisplay';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isResponding: boolean;
    error: string | null;
}

// Safely render message content, handling basic markdown-like formatting.
const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => {
        // Handle empty lines as paragraph breaks, but don't render a <p> for them
        if (line.trim() === '') return <div key={index} className="h-2" />;

        return (
            <p key={index} className="m-0">
                {line.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex} className="text-slate-100">{part.substring(2, part.length - 2)}</strong>;
                    }
                    if (part.startsWith('`') && part.endsWith('`')) {
                        return <code key={partIndex} className="bg-slate-900 text-fuchsia-400 rounded px-1.5 py-0.5 text-xs font-mono">{part.substring(1, part.length - 1)}</code>;
                    }
                    return part;
                })}
            </p>
        );
    });
};


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isResponding, error }) => {
    const [input, setInput] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isResponding) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleCopy = () => {
        if (reportRef.current) {
            navigator.clipboard.writeText(reportRef.current.innerText).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };

    const firstModelMessageIndex = messages.findIndex(m => m.role === 'model');

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                {messages.map((msg, index) => {
                    const isFirstModelMessage = index === firstModelMessageIndex;
                    // A message is a "report" if it's the first model message and contains markdown H1 syntax.
                    const isReport = isFirstModelMessage && msg.role === 'model' && msg.content.includes('# ');

                    if (isReport) {
                        // Render the initial report with special formatting and a copy button
                        return (
                            <div key={index} className="relative" ref={reportRef}>
                                {msg.content && !msg.isLoading && (
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-0 right-0 z-10 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1 px-2.5 rounded-lg text-xs transition-all"
                                        aria-label={isCopied ? "Report copied to clipboard" : "Copy report to clipboard"}
                                    >
                                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                        {isCopied ? 'Copied!' : 'Copy Report'}
                                    </button>
                                )}
                                <ReportDisplay content={msg.content || 'Generating...'} />
                            </div>
                        );
                    } else if (msg.role === 'user' || msg.role === 'model') {
                       // Render all other messages (user, greeting, follow-ups) as chat bubbles
                       return (
                            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-fuchsia-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-300 rounded-bl-lg'}`}>
                                    {msg.isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s'}}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s'}}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s'}}></span>
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                            {renderMessageContent(msg.content)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
                {error && (
                    <div className="flex justify-center">
                        <p className="text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-md">{error}</p>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-800/80 border-t border-slate-700 backdrop-blur-sm sticky bottom-0">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isResponding ? "Advisor is typing..." : "Ask a follow-up question..."}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                        disabled={isResponding}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={isResponding || !input.trim()}
                        className="bg-fuchsia-600 text-white p-2.5 rounded-full enabled:hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        aria-label="Send message"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};