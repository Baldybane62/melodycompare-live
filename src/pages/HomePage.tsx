
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { 
  ServerStackIcon, 
  DocumentDuplicateIcon, 
  WandSparklesIcon, 
  RectangleStackIcon, 
  CheckIcon, 
  InformationCircleIcon, 
  ScaleIcon, 
  UserCircleIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon 
} from '../components/icons';
import type { AppState, User } from '../types';

interface HomePageProps {
    onStartAnalysis: (file: File, fileName: string) => void;
    onStartComparison: (aiSong: File, copyrightedSong: File, fileName: string) => void;
    onNavigate: (page: AppState) => void;
    user: User | null;
    error: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ onStartAnalysis, onStartComparison, onNavigate, user, error }) => {
    const [databaseFile, setDatabaseFile] = useState<File | null>(null);
    const [directFile1, setDirectFile1] = useState<File | null>(null);
    const [directFile2, setDirectFile2] = useState<File | null>(null);

    const features = [
        "Comprehensive Advice",
        "Song Overview",
        "Stem Analysis",
        "Match Similarity",
        "Risk Level Assessment"
    ];

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-6xl">
                 <div className="text-center mb-12">
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-sky-400">
                        MelodyCompare
                    </h1>
                    <p className="mt-4 text-xl text-slate-300">
                        Your AI-powered music licensing advisor.
                    </p>
                    <p className="mt-2 text-base text-slate-400 max-w-3xl mx-auto">
                        Upload your AI-generated track to get a detailed copyright risk assessment and actionable advice.
                    </p>
                </div>
                
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-slate-300 mb-12">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm sm:text-base">
                            <CheckIcon className="w-5 h-5 text-sky-400" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-8 flex items-center gap-3 max-w-3xl mx-auto">
                        <InformationCircleIcon className="w-6 h-6 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">Analysis Failed</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}


                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Option 1: Database Scan */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-900/20">
                        <div className="bg-fuchsia-500/10 text-fuchsia-400 rounded-full p-3 mb-4">
                            <ServerStackIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Scan Against Public Database</h3>
                        <p className="text-slate-400 mb-6 flex-grow">See how our system scans your song against a vast database of copyrighted music using advanced audio fingerprinting. This demo uses a simulated database.</p>
                        <FileUpload
                            onFileSelect={setDatabaseFile}
                            acceptedFormats="audio/mpeg, audio/wav, audio/mp4"
                            label="Drag & drop your AI-generated song here"
                        />
                        <button
                            onClick={() => databaseFile && onStartAnalysis(databaseFile, databaseFile.name)}
                            disabled={!databaseFile}
                            className="mt-6 w-full bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Analyze Song
                        </button>
                    </div>

                    {/* Option 2: Direct Comparison */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-900/20">
                         <div className="bg-sky-500/10 text-sky-400 rounded-full p-3 mb-4">
                            <DocumentDuplicateIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Compare Against Specific Song</h3>
                        <p className="text-slate-400 mb-6 flex-grow">Upload your track and a specific copyrighted song to perform a direct, localized similarity analysis.</p>
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FileUpload
                                onFileSelect={setDirectFile1}
                                 acceptedFormats="audio/mpeg, audio/wav, audio/mp4"
                                label="Your AI Song"
                                compact={true}
                            />
                            <FileUpload
                                onFileSelect={setDirectFile2}
                                 acceptedFormats="audio/mpeg, audio/wav, audio/mp4"
                                label="Copyrighted Song"
                                compact={true}
                            />
                        </div>
                         <button
                            onClick={() => directFile1 && directFile2 && onStartComparison(directFile1, directFile2, directFile1.name)}
                            disabled={!directFile1 || !directFile2}
                            className="mt-6 w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Compare Songs
                        </button>
                    </div>
                </div>
             </div>
             
             {/* Why Choose Us Section */}
             <div className="w-full max-w-6xl mt-20">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-white">Your Trusted, Independent Partner</h3>
                    <p className="mt-2 text-lg text-slate-400 max-w-3xl mx-auto">In a world of platforms with their own agendas, we have only one mission: to empower you.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-slate-800/30 p-6 rounded-lg">
                        <div className="inline-block bg-sky-500/10 text-sky-400 rounded-full p-3 mb-4">
                            <ScaleIcon className="w-8 h-8"/>
                        </div>
                        <h4 className="text-xl font-bold text-white">Unbiased Analysis</h4>
                        <p className="mt-2 text-slate-400 text-sm">We're not a record label or a streaming platform. Our only goal is to provide you with clear, objective data to protect your work.</p>
                    </div>
                    <div className="bg-slate-800/30 p-6 rounded-lg">
                         <div className="inline-block bg-sky-500/10 text-sky-400 rounded-full p-3 mb-4">
                            <UserCircleIcon className="w-8 h-8"/>
                        </div>
                        <h4 className="text-xl font-bold text-white">Creator-Focused Mission</h4>
                        <p className="mt-2 text-slate-400 text-sm">Built by musicians, for musicians. We understand the creative struggle and provide tools to empower you, not to police you.</p>
                    </div>
                    <div className="bg-slate-800/30 p-6 rounded-lg">
                         <div className="inline-block bg-sky-500/10 text-sky-400 rounded-full p-3 mb-4">
                            <ShieldCheckIcon className="w-8 h-8"/>
                        </div>
                        <h4 className="text-xl font-bold text-white">Privacy First</h4>
                        <p className="mt-2 text-slate-400 text-sm">Your music is yours. We analyze your files securely and never store them. Your creativity is safe with us.</p>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="w-full max-w-6xl mt-20">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-white">Trusted by Creators</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                         <ChatBubbleLeftRightIcon className="w-8 h-8 text-fuchsia-400 mb-4" />
                        <p className="text-slate-300 italic mb-4">"Finally, a tool that feels like it's on my side. The report gave me the confidence to actually release a track I was worried about."</p>
                        <p className="font-bold text-white">- Alex R., Producer</p>
                    </div>
                     <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                         <ChatBubbleLeftRightIcon className="w-8 h-8 text-fuchsia-400 mb-4" />
                        <p className="text-slate-300 italic mb-4">"The 'Creative Brainstorming' feature is a game-changer. It took my initial idea and suggested changes I'd never have thought of."</p>
                        <p className="font-bold text-white">- Jenna C., Singer-Songwriter</p>
                    </div>
                     <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                         <ChatBubbleLeftRightIcon className="w-8 h-8 text-fuchsia-400 mb-4" />
                        <p className="text-slate-300 italic mb-4">"I would never trust a risk score from a major platform. MelodyCompare is independent, and that's why I use it for all my AI-assisted projects."</p>
                        <p className="font-bold text-white">- Marcus L., Sound Designer</p>
                    </div>
                </div>
            </div>

             <div className="w-full max-w-6xl mt-20">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-white">Explore Our Creative Suite</h3>
                    <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">More than just analysis. Tools to enhance your workflow.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Card for Prompt Composer */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-900/20">
                        <div className="bg-fuchsia-500/10 text-fuchsia-400 rounded-full p-3 mb-4">
                            <WandSparklesIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">AI Prompt Composer</h3>
                        <p className="text-slate-400 mb-6 flex-grow">Craft the perfect prompt for AI music generators like Suno or Udio. Let our AI enhance your ideas for better results.</p>
                        <button
                            onClick={() => onNavigate('prompt-composer')}
                            className="mt-auto w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:bg-fuchsia-600"
                        >
                            Open Composer
                        </button>
                    </div>
                    
                    {/* Card for Library */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-900/20">
                        <div className="bg-sky-500/10 text-sky-400 rounded-full p-3 mb-4">
                            <RectangleStackIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Your Analysis Library</h3>
                        <p className="text-slate-400 mb-6 flex-grow">Review your past song analyses at any time. Track your progress and access your expert reports whenever you need them.</p>
                        <button
                            onClick={() => onNavigate('library')}
                            className="mt-auto w-full bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:bg-sky-600"
                        >
                            View Library
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;