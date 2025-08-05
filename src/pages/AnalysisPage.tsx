



import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisData, User, CatalogItem, Notification } from '../types';
import { generateReport, publishAnalysis } from '../services/geminiService';
import { loadState, saveState } from '../services/localStorageService';
import AnalysisDisplay from '../components/AnalysisDisplay';
import { SparklesIcon, LightBulbIcon, ShareIcon, CheckIcon, ArrowUpOnSquareIcon } from '../components/icons';
import SimilarityTimelineChart from '../components/SimilarityTimelineChart';
import { BrainstormingInterface } from '../components/BrainstormingInterface';
import Loader from '../components/Loader';
import ReportDisplay from '../components/ReportDisplay';
import SubmissionModal from '../components/SubmissionModal';
import AudioPlayer from '../components/AudioPlayer';

interface AnalysisPageProps {
    analysisData: AnalysisData;
    analysisId?: string;
    initialReportText: string | null;
    isSharedView?: boolean;
    user: User | null;
    onCatalogSubmitSuccess: (newItem: CatalogItem) => void;
    onAddNotification: (type: Notification['type'], message: string) => void;
    analysisAudioUrl: string | null;
    analysisAudioTitle: string | null;
}

type ActiveTab = 'report' | 'brainstorm';

const AnalysisPage: React.FC<AnalysisPageProps> = ({ analysisData, analysisId, initialReportText, isSharedView = false, user, onCatalogSubmitSuccess, onAddNotification, analysisAudioUrl, analysisAudioTitle }) => {
    const reportStorageKey = analysisId ? `report_${analysisId}` : `report_temp_${analysisData.overview.overallScore}`;
    
    const [report, setReport] = useState<string | null>(() => initialReportText || loadState<string>(reportStorageKey));
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('report');
    const [isSharing, setIsSharing] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (report && !isSharedView) {
            saveState(reportStorageKey, report);
        }
    }, [report, reportStorageKey, isSharedView]);
    
    const handleGenerateReport = useCallback(async () => {
        if (!analysisData) return;
        setIsGenerating(true);
        setError(null);
        try {
            const generatedReport = await generateReport(analysisData);
            setReport(generatedReport);
            onAddNotification('success', 'Expert report generated successfully!');
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An error occurred generating the report.";
            setError(errorMsg);
            onAddNotification('error', errorMsg);
        } finally {
            setIsGenerating(false);
        }
    }, [analysisData, onAddNotification]);

    const handleShare = async () => {
        if (!report) {
            onAddNotification('error', 'Please generate the report before sharing.');
            return;
        }
        setIsSharing(true);
        setError(null);
        try {
            const { id } = await publishAnalysis(analysisData, report);
            const url = `${window.location.origin}/view/${id}`;
            
            navigator.clipboard.writeText(url).then(() => {
                onAddNotification('success', 'Shareable link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy share link: ', err);
                onAddNotification('error', 'Failed to copy link to clipboard.');
            });

        } catch(e) {
            const errorMsg = e instanceof Error ? e.message : "Could not publish analysis.";
            setError(errorMsg);
            onAddNotification('error', errorMsg);
        } finally {
            setIsSharing(false);
        }
    };
    
    const TabButton = ({ isActive, onClick, children, disabled = false }: { isActive: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                isActive
                    ? 'text-fuchsia-400 border-fuchsia-400'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
    
    const canSubmitToCatalog = user && !isSharedView && analysisData.overview.riskLevel === 'Low';

    return (
        <>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-opacity duration-700 ease-in ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">{isSharedView ? "Shared Analysis" : "Your Song's Analysis Data"}</h2>
                {analysisAudioUrl && analysisAudioTitle && !isSharedView && (
                    <div className="mb-6">
                        <AudioPlayer src={analysisAudioUrl} title={analysisAudioTitle} />
                    </div>
                )}
                <AnalysisDisplay data={analysisData} />
                <SimilarityTimelineChart timeline={analysisData.similarityTimeline} />
            </div>
            <div className="flex flex-col lg:max-h-[calc(100vh-12rem)] bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center border-b border-slate-700 px-4">
                     <div className="flex items-end">
                        <TabButton isActive={activeTab === 'report'} onClick={() => setActiveTab('report')}>
                            <SparklesIcon className="w-5 h-5"/> Expert Report
                        </TabButton>
                        <TabButton 
                            isActive={activeTab === 'brainstorm'} 
                            onClick={() => setActiveTab('brainstorm')}
                            disabled={isSharedView}
                        >
                            <LightBulbIcon className="w-5 h-5"/> Creative Brainstorming
                        </TabButton>
                     </div>
                     <div className="flex items-center gap-2">
                        {canSubmitToCatalog && (
                             <button 
                                onClick={() => setIsSubmissionModalOpen(true)}
                                className="flex items-center gap-2 text-sm text-green-400 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-green-500/20"
                            >
                                <ArrowUpOnSquareIcon className="w-4 h-4" />
                                Submit to Catalog
                            </button>
                        )}
                        {!isSharedView && (
                            <div className="relative">
                                <button 
                                    onClick={handleShare}
                                    disabled={isSharing || !report}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors py-2 px-3 rounded-md hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                <ShareIcon className="w-4 h-4" />
                                {isSharing ? 'Sharing...' : 'Share'}
                                </button>
                            </div>
                         )}
                     </div>
                </div>

                {activeTab === 'report' && (
                    <div className="flex-grow flex flex-col overflow-y-auto">
                        {!report && !isGenerating && (
                             <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                                <div className="bg-fuchsia-500/10 text-fuchsia-400 rounded-full p-4 mb-4">
                                    <SparklesIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Your analysis is ready.</h3>
                                <p className="text-slate-400 mt-2 mb-6 max-w-sm">Generate your personalized AI expert report to get actionable advice. Use the AI Assistant for any follow-up questions.</p>
                                <button 
                                    onClick={handleGenerateReport} 
                                    disabled={isGenerating || isSharedView}
                                    className="bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSharedView ? "Report Not Generated" : "Generate Expert Report"}
                                </button>
                                {error && <p className="text-red-400 mt-4">{error}</p>}
                            </div>
                        )}

                        {!report && isGenerating && (
                            <div className="flex-grow flex items-center justify-center p-8">
                                <Loader text="Generating your expert analysis..."/>
                            </div>
                        )}
                        
                        {report && (
                           <div className="p-4 sm:p-6">
                               <ReportDisplay content={report} />
                           </div>
                        )}
                    </div>
                )}

                {activeTab === 'brainstorm' && !isSharedView && (
                    <BrainstormingInterface analysisData={analysisData} onAddNotification={onAddNotification} />
                )}
            </div>
        </div>
        {isSubmissionModalOpen && user && analysisId && (
            <SubmissionModal
                isOpen={isSubmissionModalOpen}
                onClose={() => setIsSubmissionModalOpen(false)}
                analysisId={analysisId}
                riskScore={analysisData.overview.riskScore}
                user={user}
                onSubmitSuccess={onCatalogSubmitSuccess}
            />
        )}
        </>
    );
};

export default AnalysisPage;