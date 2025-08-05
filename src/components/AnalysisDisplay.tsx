
import React, { useState, useEffect } from 'react';
import type { AnalysisData, FingerprintMatch } from '../types';
import { ShieldCheckIcon, SparklesIcon, FingerPrintIcon, MicrophoneIcon, DrumIcon, ChartBarIcon, BeakerIcon, ScaleIcon, InformationCircleIcon, ArrowTopRightOnSquareIcon } from './icons';

// Custom hook for number count-up animation
const useCountUp = (end: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const startTime = Date.now();
        const easeOutCubic = (t: number) => (--t) * t * t + 1;
        const decimals = String(end).split('.')[1]?.length || 0;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easedProgress = easeOutCubic(progress);
            
            const currentValue = easedProgress * (end - start) + start;
            setCount(parseFloat(currentValue.toFixed(decimals)));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    valueColor?: string;
    description?: string;
    tooltipText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, valueColor = 'text-white', description, tooltipText }) => (
    <div className="bg-slate-800 p-4 rounded-lg flex items-start gap-4 h-full">
        <div className="text-sky-400 mt-1">{icon}</div>
        <div className="flex-1">
            <div className="flex items-center gap-1.5 group relative">
                 <p className="text-slate-400 text-sm">{label}</p>
                 {tooltipText && (
                    <>
                        <InformationCircleIcon className="w-4 h-4 text-slate-500" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {tooltipText}
                        </div>
                    </>
                 )}
            </div>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
    </div>
);

const AnimatedStatCard: React.FC<StatCardProps & { delay?: number }> = ({ value, delay = 0, ...props }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    // Animate main value if it's a number
    const numericValue = parseFloat(String(value));
    const isNumeric = !isNaN(numericValue) && isFinite(numericValue);
    const count = useCountUp(isNumeric ? numericValue : 0);
    const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';
    const displayValue = isNumeric ? `${count}${suffix}` : value;
    
    // Animate number within description string, if present
    const descriptionStr = props.description || '';
    const descriptionNumberMatch = descriptionStr.match(/(\d+(\.\d+)?)/);
    const descriptionNumber = descriptionNumberMatch ? parseFloat(descriptionNumberMatch[0]) : NaN;
    const isDescNumeric = !isNaN(descriptionNumber);
    
    const descCount = useCountUp(isDescNumeric ? descriptionNumber : 0);
    
    let animatedDescription = descriptionStr;
    if(isDescNumeric && descriptionNumberMatch) {
        // Reconstruct the description with the animated number
        const originalNumberWithSuffix = descriptionStr.substring(descriptionNumberMatch.index!);
        const suffixOnly = originalNumberWithSuffix.substring(descriptionNumberMatch[0].length);
        animatedDescription = `${descriptionStr.substring(0, descriptionNumberMatch.index!)}${descCount}${suffixOnly}`;
    }

    return (
        <div className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <StatCard {...props} value={displayValue} description={animatedDescription} />
        </div>
    );
};

const MatchItem: React.FC<{ match: FingerprintMatch; delay: number }> = ({ match, delay }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const getSimilarityColor = (similarity: number) => {
        if (similarity > 75) return 'text-red-400';
        if (similarity > 50) return 'text-amber-400';
        return 'text-sky-400';
    };

    return (
        <div className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-4 hover:bg-slate-800 transition-colors">
                <div className="flex-grow">
                    <p className="font-bold text-white truncate">{match.title}</p>
                    <p className="text-sm text-slate-400 truncate">{match.artist}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-lg ${getSimilarityColor(match.similarity)}`}>{match.similarity}%</p>
                    <p className="text-xs text-slate-500">Similarity</p>
                </div>
                 <a href={match.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2 rounded-full bg-slate-700 hover:bg-sky-500 text-slate-400 hover:text-white transition-colors" aria-label={`Listen to ${match.title} on another platform`}>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};


interface AnalysisDisplayProps {
    data: AnalysisData;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data }) => {
    
    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-amber-400';
            case 'low': return 'text-green-400';
            default: return 'text-white';
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                <h3 className="font-bold text-lg text-fuchsia-400 mb-4">Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <AnimatedStatCard delay={0} icon={<ScaleIcon />} label="Risk Level" value={data.overview.riskLevel} valueColor={getRiskColor(data.overview.riskLevel)} tooltipText="Categorizes the potential for copyright issues (Low, Medium, High)." />
                    <AnimatedStatCard delay={100} icon={<ShieldCheckIcon />} label="Risk Score" value={`${data.overview.riskScore}%`} valueColor={getRiskColor(data.overview.riskLevel)} tooltipText="A calculated score representing the overall likelihood of a copyright claim." />
                    <AnimatedStatCard delay={200} icon={<ChartBarIcon />} label="Overall Similarity" value={`${data.overview.overallScore}%`} tooltipText="The average similarity percentage across your entire track compared to the copyrighted song." />
                    <AnimatedStatCard delay={300} icon={<SparklesIcon />} label="AI Probability" value={`${data.overview.aiProbability}%`} tooltipText="The likelihood that your music was generated by a known AI music platform." />
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                <h3 className="font-bold text-lg text-fuchsia-400 mb-4">Stem Analysis</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatedStatCard delay={400} icon={<MicrophoneIcon />} label="Vocals Similarity" value={`${data.stemAnalysis.vocals.similarity}%`} description={`AI Probability: ${data.stemAnalysis.vocals.aiProbability}%`} tooltipText="How similar the vocal track is to the copyrighted song's vocals." />
                    <AnimatedStatCard delay={500} icon={<DrumIcon />} label="Drums Similarity" value={`${data.stemAnalysis.drums.similarity}%`} description={`AI Probability: ${data.stemAnalysis.drums.aiProbability}%`} tooltipText="How similar the drum and percussion track is to the copyrighted song's rhythm section." />
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <h3 className="font-bold text-lg text-fuchsia-400 mb-4">AI Generation Analysis</h3>
                    <div className="space-y-4">
                        <AnimatedStatCard delay={600} icon={<BeakerIcon />} label="Likely Platform" value={data.aiAnalysis.platform} tooltipText="The AI music generation platform that was likely used." />
                        <AnimatedStatCard delay={700} icon={<SparklesIcon />} label="Generation Likelihood" value={data.aiAnalysis.likelihood} description={`Confidence: ${data.aiAnalysis.confidence}%`} tooltipText="The confidence level that this track is AI-generated." />
                    </div>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                    <h3 className="font-bold text-lg text-fuchsia-400 mb-4">Fingerprinting Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <AnimatedStatCard delay={800} icon={<FingerPrintIcon />} label="Matches Found" value={data.fingerprinting.matches.length} tooltipText="The number of distinct, significant matches found via acoustic fingerprinting." />
                       <AnimatedStatCard delay={900} icon={<ChartBarIcon />} label="Highest Similarity" value={`${data.fingerprinting.highestSimilarity}%`} tooltipText="The highest similarity percentage found among the matches." />
                    </div>
                    {data.fingerprinting.matches.length > 0 && (
                        <div className="space-y-3 mt-4">
                            {data.fingerprinting.matches.map((match, index) => (
                                <MatchItem key={index} match={match} delay={1000 + index * 100} />
                            ))}
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default AnalysisDisplay;
