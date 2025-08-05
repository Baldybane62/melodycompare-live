import React from 'react';
import { ChatBubbleLeftRightIcon } from './icons';

interface ChatBubbleProps {
    onClick: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-fuchsia-600 text-white p-4 rounded-full shadow-lg hover:bg-fuchsia-500 transition-all transform hover:scale-110 z-40"
        aria-label="Open AI assistant"
    >
        <ChatBubbleLeftRightIcon className="w-8 h-8" />
    </button>
);

export default ChatBubble;
