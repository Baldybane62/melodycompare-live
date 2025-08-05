import React from 'react';
import type { User, LibraryItem, AppState, AnalysisData } from '../types';
import { RectangleStackIcon, ShieldCheckIcon, ChartBarIcon, WandSparklesIcon, DocumentDuplicateIcon } from '../components/icons';

interface DashboardPageProps {
    user: User;
    library: LibraryItem[];
    onNavigate: (page: AppState) => void;
    onViewAnalysis: (item: LibraryItem) => void;
}

const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-amber-400';
        case 'low': return 'text-green-400';
        default: return 'text-white';
    }
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl flex items-center gap-4">
        <div className="bg-sky-500/10 text-sky-400 rounded-full p-3">{icon}</div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ user, library, onNavigate, onViewAnalysis }) => {
    
    // --- Calculate Stats ---
    const totalAnalyses = library.length;
    
    const avgRiskScore = totalAnalyses > 0
        ? Math.round(library.reduce((sum, item) => sum + item.data.overview.riskScore, 0) / totalAnalyses)
        : 0;

    const riskLevelCounts = library.reduce((acc, item) => {
        const level = item.data.overview.riskLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostCommonRiskLevel = Object.keys(riskLevelCounts).length > 0
        ? Object.entries(riskLevelCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';
        
    const recentAnalyses = library.slice(0, 4);

    // Onboarding view for new users
    if (totalAnalyses === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center animate-fade-in-slow py-10">
                <h1 className="text-4xl font-bold text-white">Welcome, {user.name.split(' ')[0]}!</h1>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    Ready to protect and enhance your music? Your journey starts here.
                </p>
                <div className="mt-10">
                    <button
                        onClick={() => onNavigate('home')}
                        className="group bg-fuchsia-600 hover:bg-fuchsia-500 border border-fuchsia-500/50 p-6 rounded-xl text-left flex items-center gap-6 transition-all duration-300 transform hover:-translate-y-1 inline-flex"
                    >
                        <DocumentDuplicateIcon className="w-12 h-12 text-white flex-shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Start Your First Analysis</h3>
                            <p className="text-fuchsia-200 mt-1 text-sm">Let's check your first track.</p>
                        </div>
                    </button>
                </div>
                 <style>{`
                    @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                    .animate-fade-in-slow { animation: fade-in-slow 0.7s ease-out forwards; }
                `}</style>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in-slow">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="mt-2 text-lg text-slate-400">Here's a snapshot of your creative workspace.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard icon={<RectangleStackIcon className="w-7 h-7" />} label="Total Analyses" value={totalAnalyses} />
                <StatCard icon={<ShieldCheckIcon className="w-7 h-7" />} label="Average Risk Score" value={`${avgRiskScore}%`} />
                <StatCard icon={<ChartBarIcon className="w-7 h-7" />} label="Most Common Risk" value={mostCommonRiskLevel} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <button
                    onClick={() => onNavigate('home')}
                    className="group bg-fuchsia-600/80 hover:bg-fuchsia-600 border border-fuchsia-500/50 p-6 rounded-xl text-left flex items-center gap-6 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <DocumentDuplicateIcon className="w-12 h-12 text-white flex-shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-white">Start New Analysis</h3>
                        <p className="text-fuchsia-200 mt-1 text-sm">Scan a track or compare two songs directly.</p>
                    </div>
                </button>
                <button
                    onClick={() => onNavigate('prompt-composer')}
                    className="group bg-sky-600/80 hover:bg-sky-600 border border-sky-500/50 p-6 rounded-xl text-left flex items-center gap-6 transition-all duration-300 transform hover:-translate-y-1"
                >
                    <WandSparklesIcon className="w-12 h-12 text-white flex-shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-white">AI Prompt Composer</h3>
                        <p className="text-sky-200 mt-1 text-sm">Craft better prompts for music generators.</p>
                    </div>
                </button>
            </div>
            
            {/* Recent Activity */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Recent Analyses</h2>
                    {library.length > 4 && (
                         <button onClick={() => onNavigate('library')} className="text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                            View Full Library &rarr;
                        </button>
                    )}
                </div>
                {recentAnalyses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentAnalyses.map(item => (
                            <div
                                key={item.id}
                                onClick={() => onViewAnalysis(item)}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer group transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-900/10 hover:-translate-y-1"
                            >
                                <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                                <h4 className="font-bold text-white mt-1 truncate group-hover:text-fuchsia-400 transition-colors" title={item.songTitle}>{item.songTitle}</h4>
                                <p className={`mt-2 text-sm font-bold ${getRiskColor(item.data.overview.riskLevel)}`}>
                                    {item.data.overview.riskLevel} Risk
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
                        <h3 className="text-xl font-bold text-white">No analyses yet!</h3>
                        <p className="mt-2 text-slate-400">Start your first analysis to see your history here.</p>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.7s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default DashboardPage;
