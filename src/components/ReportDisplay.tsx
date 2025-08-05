
import React from 'react';

interface ReportDisplayProps {
    content: string;
}

const parseInlineFormatting = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-slate-100">{part.substring(2, part.length - 2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-slate-700 text-fuchsia-300 rounded px-1 py-0.5 text-sm">{part.substring(1, part.length - 1)}</code>;
        }
        return part;
    });
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ content }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    const renderLine = (line: string, index: number) => {
        if (line.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-sky-300 mb-6 text-center">{parseInlineFormatting(line.substring(2))}</h1>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-2xl font-bold text-fuchsia-400 mt-6 mb-3 border-b-2 border-slate-700 pb-2">{parseInlineFormatting(line.substring(3))}</h2>;
        }
        if (line.match(/^\d+\.\s/)) {
            const listContent = line.replace(/^\d+\.\s/, '');
            const number = line.match(/^\d+/)?.[0];
            return (
                <div key={index} className="flex items-start gap-3 mb-2">
                    <span className="flex-shrink-0 bg-sky-500 text-slate-900 rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center mt-1">{number}</span>
                    <span className="text-slate-300">{parseInlineFormatting(listContent)}</span>
                </div>
            );
        }
        if (line.startsWith('- ')) {
            return (
                 <div key={index} className="flex items-start gap-3 mb-2">
                    <span className="text-sky-400 mt-2 text-xl leading-none">&bull;</span>
                    <span className="text-slate-300">{parseInlineFormatting(line.substring(2))}</span>
                </div>
            );
        }
        return <p key={index} className="mb-4 text-slate-300 leading-relaxed">{parseInlineFormatting(line)}</p>;
    };

    return (
        <div className="prose prose-invert max-w-none">
            {lines.map(renderLine)}
        </div>
    );
};

export default ReportDisplay;
