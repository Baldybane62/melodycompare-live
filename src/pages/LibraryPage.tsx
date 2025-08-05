import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { AnalysisData, LibraryItem } from '../types';
import { PencilIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon, FunnelIcon, ArrowsUpDownIcon, XMarkIcon } from '../components/icons';

type SortKey = 'date' | 'songTitle' | 'riskScore';
type RiskLevel = 'All' | 'Low' | 'Medium' | 'High';

interface LibraryPageProps {
    library: LibraryItem[];
    onViewAnalysis: (item: LibraryItem) => void;
    onDeleteAnalysis: (id: string) => void;
    onRenameAnalysis: (id: string, newTitle: string) => void;
}

const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
        case 'high': return 'text-red-400 border-red-500/50';
        case 'medium': return 'text-amber-400 border-amber-500/50';
        case 'low': return 'text-green-400 border-green-500/50';
        default: return 'text-white border-slate-500/50';
    }
};

const LibraryItemCard: React.FC<{
    item: LibraryItem;
    onView: () => void;
    onDelete: () => void;
    onRename: (newTitle: string) => void;
    style: React.CSSProperties;
}> = ({ item, onView, onDelete, onRename, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.songTitle);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleRename = () => {
        if (title.trim() && title.trim() !== item.songTitle) {
            onRename(title.trim());
        } else {
            setTitle(item.songTitle); // Revert if empty or unchanged
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setTitle(item.songTitle);
            setIsEditing(false);
        }
    };

    return (
        <div 
            style={style}
            className="bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col group transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-900/20 hover:-translate-y-1"
        >
            <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md" aria-label="Rename analysis">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                         <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md" aria-label="Delete analysis">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {isEditing ? (
                    <div className="relative mt-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={handleKeyDown}
                            className="font-bold text-lg bg-slate-700 text-white w-full rounded-md p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        />
                         <button onClick={handleRename} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-white bg-green-600 hover:bg-green-500 rounded-md" aria-label="Confirm rename">
                            <CheckIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <h3 
                        onClick={onView} 
                        className="font-bold text-lg text-white mt-1 truncate cursor-pointer" 
                        title={item.songTitle}
                    >
                        {item.songTitle}
                    </h3>
                )}
                
                <div 
                    onClick={onView} 
                    className={`mt-2 text-sm font-bold cursor-pointer ${getRiskColor(item.data.overview.riskLevel)}`}
                >
                    {item.data.overview.riskLevel} Risk
                </div>
            </div>
            
            <div 
                onClick={onView}
                className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm px-5 pb-5 cursor-pointer"
            >
                <span className="text-slate-400">Risk Score</span>
                <span className="font-semibold text-white">{item.data.overview.riskScore}%</span>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}> = ({ onConfirm, onCancel, title, message }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-slate-400 mt-2 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Confirm Delete
                </button>
            </div>
        </div>
         <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </div>
);


const LibraryPage: React.FC<LibraryPageProps> = ({ library, onViewAnalysis, onDeleteAnalysis, onRenameAnalysis }) => {
    const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterByRisk, setFilterByRisk] = useState<RiskLevel>('All');
    const [sortBy, setSortBy] = useState<SortKey>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredAndSortedLibrary = useMemo(() => {
        let items = [...library];

        // Filter by search query
        if (searchQuery) {
            items = items.filter(item =>
                item.songTitle.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by risk level
        if (filterByRisk !== 'All') {
            items = items.filter(item =>
                item.data.overview.riskLevel.toLowerCase() === filterByRisk.toLowerCase()
            );
        }

        // Sort items
        items.sort((a, b) => {
            let compare = 0;
            if (sortBy === 'date') {
                compare = new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortBy === 'songTitle') {
                compare = a.songTitle.localeCompare(b.songTitle);
            } else if (sortBy === 'riskScore') {
                compare = b.data.overview.riskScore - a.data.overview.riskScore;
            }
            return sortOrder === 'asc' ? -compare : compare;
        });

        return items;
    }, [library, searchQuery, filterByRisk, sortBy, sortOrder]);

    const handleDeleteClick = (item: LibraryItem) => {
        setItemToDelete(item);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteAnalysis(itemToDelete.id);
            setItemToDelete(null);
        }
    };
    
    const RiskFilterButton = ({ level }: { level: RiskLevel }) => {
        const isActive = filterByRisk === level;
        return (
            <button
                onClick={() => setFilterByRisk(level)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    isActive ? 'bg-fuchsia-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
            >
                {level}
            </button>
        )
    };

    return (
        <div className="w-full">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white">Your Analysis Library</h2>
                <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">Review, rename, or delete your past song analyses. Click a card to see the full report.</p>
            </div>
            
            {/* Controls */}
            {library.length > 0 && (
                 <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full md:w-1/3">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                        />
                    </div>
                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-slate-400" />
                        <span className="font-semibold text-slate-300 text-sm">Filter:</span>
                        <RiskFilterButton level="All" />
                        <RiskFilterButton level="Low" />
                        <RiskFilterButton level="Medium" />
                        <RiskFilterButton level="High" />
                    </div>
                    {/* Sort */}
                    <div className="flex items-center gap-2 ml-auto">
                        <ArrowsUpDownIcon className="w-5 h-5 text-slate-400" />
                        <span className="font-semibold text-slate-300 text-sm">Sort:</span>
                         <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [key, order] = e.target.value.split('-');
                                setSortBy(key as SortKey);
                                setSortOrder(order as 'asc' | 'desc');
                            }}
                            className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition text-sm"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="songTitle-asc">Title (A-Z)</option>
                            <option value="songTitle-desc">Title (Z-A)</option>
                            <option value="riskScore-desc">Risk (High-Low)</option>
                            <option value="riskScore-asc">Risk (Low-High)</option>
                        </select>
                    </div>
                </div>
            )}
            
            {library.length > 0 ? (
                filteredAndSortedLibrary.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAndSortedLibrary.map((item, index) => (
                            <LibraryItemCard
                                key={item.id}
                                item={item}
                                onView={() => onViewAnalysis(item)}
                                onDelete={() => handleDeleteClick(item)}
                                onRename={(newTitle) => onRenameAnalysis(item.id, newTitle)}
                                style={{ animationDelay: `${index * 30}ms`, animation: `fadeInUp 0.4s ease-out both` }}
                            />
                        ))}
                        <style>{`
                            @keyframes fadeInUp {
                                from { opacity: 0; transform: translateY(15px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
                        <h3 className="text-xl font-bold text-white">No Matching Analyses</h3>
                        <p className="mt-2 text-slate-400">Try adjusting your search or filter settings.</p>
                         <button onClick={() => { setSearchQuery(''); setFilterByRisk('All'); }} className="mt-4 text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                            Clear Filters
                        </button>
                    </div>
                )
            ) : (
                <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h3 className="text-xl font-bold text-white">Your Library is Empty</h3>
                    <p className="mt-2 text-slate-400">Start a new analysis to see your results here.</p>
                </div>
            )}

            {itemToDelete && (
                <ConfirmationModal 
                    title="Delete Analysis"
                    message={`Are you sure you want to permanently delete "${itemToDelete.songTitle}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default LibraryPage;