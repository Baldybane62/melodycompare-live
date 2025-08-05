
import React from 'react';

const Footer: React.FC<{ onFeedbackClick: () => void }> = ({ onFeedbackClick }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full text-center py-6 mt-12 border-t border-slate-800">
            <div className="text-xs text-slate-500 space-y-2">
                 <div className="flex justify-center items-center gap-4">
                     <p className="font-semibold text-slate-400">MelodyCompare &trade; &mdash; Your Independent Music Advisor</p>
                     <button
                        onClick={onFeedbackClick}
                        className="font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors hover:underline"
                    >
                        Feedback & Support
                    </button>
                </div>
                <div className="sm:flex sm:items-center sm:justify-center sm:gap-4">
                     <span>
                        Copyright &copy; {currentYear}
                    </span>
                    <span className="hidden sm:inline">|</span>
                    <span>
                        Contact: <a href="mailto:support@melodycompare.com" className="hover:text-fuchsia-400 transition-colors">support@melodycompare.com</a>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;