import React from 'react';
import { ChatInterface } from './ChatInterface';
import type { ChatMessage } from '../types';
import { XMarkIcon } from './icons';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isResponding: boolean;
    error: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, messages, onSendMessage, isResponding, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-out transform-gpu animate-slide-in">
            <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0 bg-slate-800/80 backdrop-blur-sm rounded-t-xl">
                <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full" aria-label="Close chat">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </header>
            <ChatInterface
                messages={messages}
                onSendMessage={onSendMessage}
                isResponding={isResponding}
                error={error}
            />
             <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChatPanel;
