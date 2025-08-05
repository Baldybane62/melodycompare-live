import React, { useState } from 'react';
import { 
  HomeIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  WandSparklesIcon,
  RectangleStackIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from './icons';
import type { AppState } from '../types';
import type { User } from '../types';

interface HeaderProps {
    appState: AppState;
    user: User | null;
    onNavigate: (page: AppState) => void;
    onLogout: () => void;
}

// Fallback component for missing icons
const IconFallback = ({ className }: { className?: string }) => (
  <span className={`${className} bg-red-500 rounded-full w-5 h-5`} />
);

const Header: React.FC<HeaderProps> = ({ appState, user, onNavigate, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Safe icon rendering
    const renderIcon = (IconComponent: React.FC<any> | undefined, props: any) => {
      return IconComponent ? <IconComponent {...props} /> : <IconFallback {...props} />;
    };

    return (
        <header className="flex items-center justify-end w-full h-16">
            {/* Right Section: Navigation and User */}
            <div className="flex items-center gap-2 md:gap-3">
                <button 
                    onClick={() => onNavigate(user ? 'dashboard' : 'home')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="Go to Home"
                >
                    <span className="hidden lg:inline">Home</span>
                    {renderIcon(HomeIcon, { className: "w-5 h-5 transition-transform group-hover:scale-110" })}
                </button>
                
                <button 
                    onClick={() => onNavigate('catalog')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="View Cleared Catalog"
                >
                    <span className="hidden lg:inline">Catalog</span>
                    {renderIcon(BuildingStorefrontIcon, { className: "w-5 h-5 transition-transform group-hover:scale-110" })}
                </button>
                
                <button 
                    onClick={() => onNavigate('pricing')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="View Pricing"
                >
                    <span className="hidden lg:inline">Pricing</span>
                    {renderIcon(CreditCardIcon, { className: "w-5 h-5 transition-transform group-hover:scale-110" })}
                </button>
                
                <button 
                    onClick={() => onNavigate('info')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="View Info and Help"
                >
                    <span className="hidden lg:inline">Info</span>
                    {renderIcon(QuestionMarkCircleIcon, { className: "w-6 h-6 transition-transform group-hover:scale-110" })}
                </button>
                
                <button 
                    onClick={() => onNavigate('prompt-composer')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="Open AI Prompt Composer"
                >
                    <span className="hidden lg:inline">Composer</span>
                    {renderIcon(WandSparklesIcon, { className: "w-5 h-5 transition-transform group-hover:scale-110" })}
                </button>
                
                <button 
                    onClick={() => onNavigate('library')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    aria-label="View analysis library"
                >
                    <span className="hidden lg:inline">Library</span>
                    {renderIcon(RectangleStackIcon, { className: "w-5 h-5 transition-transform group-hover:scale-110" })}
                </button>

                <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>
                
                {user ? (
                    <div className="relative" onMouseLeave={() => setIsMenuOpen(false)}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group whitespace-nowrap"
                        >
                            <span className="hidden lg:inline">{user.name}</span>
                            {renderIcon(UserCircleIcon, { className: "w-7 h-7 transition-transform group-hover:scale-110" })}
                        </button>
                        
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-20">
                                <div className="px-4 py-2 border-b border-slate-700">
                                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => { onNavigate('account'); setIsMenuOpen(false); }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-fuchsia-500/10 hover:text-fuchsia-400"
                                >
                                    {renderIcon(Cog6ToothIcon, { className: "w-5 h-5" })}
                                    My Account
                                </button>
                                <button
                                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-fuchsia-500/10 hover:text-fuchsia-400"
                                >
                                    {renderIcon(ArrowRightOnRectangleIcon, { className: "w-5 h-5" })}
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={() => onNavigate('login')}
                        className="flex-shrink-0 flex items-center gap-2 text-slate-300 hover:text-white transition-colors group bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-md whitespace-nowrap"
                        aria-label="Sign In"
                    >
                        <span className="hidden lg:inline">Sign In</span>
                        {renderIcon(UserCircleIcon, { className: "w-5 h-5" })}
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;