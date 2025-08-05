
import React, { useState, useMemo, useRef } from 'react';
import type { AppState, CatalogItem } from '../types';
import { MagnifyingGlassIcon, FunnelIcon, UserCircleIcon, PlayIcon, PauseIcon } from '../components/icons';

interface CatalogPageProps {
    entries: CatalogItem[];
    onNavigate: (page: AppState) => void;
}

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };
    
    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    }

    return (
        <div className="flex items-center gap-3">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
            />
            <button
                onClick={togglePlay}
                className="w-10 h-10 flex-shrink-0 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-fuchsia-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

const CatalogCard: React.FC<{ item: CatalogItem, style: React.CSSProperties }> = ({ item, style }) => (
    <div
        style={style}
        className="bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col group transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-900/20 hover:-translate-y-1"
    >
        <div className="p-5 flex-grow flex flex-col">
            <h3 className="font-bold text-lg text-white truncate" title={item.title}>{item.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                <UserCircleIcon className="w-4 h-4" />
                <span>{item.userName}</span>
            </div>
             <div className="flex flex-wrap gap-2 my-4">
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-300 text-xs font-semibold rounded-full">{item.genre}</span>
                {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-full">{tag}</span>
                ))}
            </div>
        </div>
        <div className="px-5 pb-5 mt-auto">
            <AudioPlayer src={`/api/audio/${item.id}`} />
        </div>
        <div className="border-t border-slate-700 px-5 py-3 text-center">
             <a href={`mailto:${item.userName}@example.com?subject=Inquiry about your track: ${item.title}`} className="text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                Contact Creator
            </a>
        </div>
    </div>
);


const CatalogPage: React.FC<CatalogPageProps> = ({ entries, onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterByGenre, setFilterByGenre] = useState('All');

    const genres = useMemo(() => ['All', ...new Set(entries.map(e => e.genre))], [entries]);

    const filteredEntries = useMemo(() => {
        let items = [...entries];
        if (searchQuery) {
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        if (filterByGenre !== 'All') {
            items = items.filter(item => item.genre === filterByGenre);
        }
        return items;
    }, [entries, searchQuery, filterByGenre]);
    
    return (
        <div className="w-full">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white">Cleared Catalog</h2>
                <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">Discover original, AI-assisted music cleared for use. Connect with creators to license their work.</p>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-grow">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by title, artist, or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-300 text-sm">Genre:</span>
                    <select
                        value={filterByGenre}
                        onChange={(e) => setFilterByGenre(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition text-sm"
                    >
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid */}
            {filteredEntries.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.map((item, index) => (
                        <CatalogCard
                            key={item.id}
                            item={item}
                            style={{ animationDelay: `${index * 40}ms`, animation: `fadeInUp 0.5s ease-out both` }}
                        />
                    ))}
                    <style>{`
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            ) : (
                 <div className="text-center py-20 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
                    <h3 className="text-xl font-bold text-white">No Tracks Found</h3>
                    <p className="mt-2 text-slate-400">Try adjusting your search or filter. The catalog is always growing!</p>
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
