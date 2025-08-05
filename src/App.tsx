import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import LibraryPage from './pages/LibraryPage';
import Loader from './components/Loader';
import Footer from './components/Footer';
import PromptComposerPage from './pages/PromptComposerPage';
import InfoPage from './pages/InfoPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';
import ChatBubble from './components/ChatBubble';
import ChatPanel from './components/ChatPanel';
import FeedbackModal from './components/FeedbackModal';
import Notification from './components/Notification';
import CatalogPage from './pages/CatalogPage';
import type { AppState, AnalysisData, LibraryItem, User, AnalysisResultPayload, ChatMessage, ChatContext, CatalogItem, Notification as NotificationType } from './types';
import { saveState, loadState, clearState } from './services/localStorageService';
import { analyzeFile, compareFiles, getChatAssistantStream, getSharedAnalysis, sendFeedback, getCatalogEntries, uploadAnalysisAudio } from './services/geminiService';
import BackgroundAnimation from './components/BackgroundAnimation';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('home');
    const [user, setUser] = useState<User | null>(() => loadState<User>('user'));
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
    const [initialReport, setInitialReport] = useState<string | null>(null);
    const [analysisLibrary, setAnalysisLibrary] = useState<LibraryItem[]>(() => loadState<LibraryItem[]>('analysisLibrary') || []);
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loaderText, setLoaderText] = useState('Initializing...');
    const [isLoaded, setIsLoaded] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isSharedView, setIsSharedView] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [analysisAudioUrl, setAnalysisAudioUrl] = useState<string | null>(null);
    const [analysisAudioTitle, setAnalysisAudioTitle] = useState<string | null>(null);

    // AI Assistant State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const assistantChatStorageKey = 'assistantChatHistory';
    const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>(() => {
        const saved = loadState<ChatMessage[]>(assistantChatStorageKey);
        return saved && saved.length > 0 ? saved : [{ role: 'model', content: "Hi! I'm Melody, your AI assistant. How can I help you today?" }];
    });
    const [isAssistantResponding, setIsAssistantResponding] = useState(false);
    const [assistantError, setAssistantError] = useState<string | null>(null);

    const addNotification = useCallback((type: NotificationType['type'], message: string) => {
        const id = crypto.randomUUID();
        // Prevent duplicate messages in quick succession
        setNotifications(prev => {
            if(prev.some(n => n.message === message)) return prev;
            return [...prev, { id, type, message }];
        });
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    // Auto-dismiss notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications(prev => prev.slice(1));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notifications]);
    
    useEffect(() => {
        if (analysisError) {
            addNotification('error', analysisError);
        }
    }, [analysisError, addNotification]);

    useEffect(() => {
        // This effect manages the lifecycle of the object URL for the audio player.
        // It returns a cleanup function that will be called when the component unmounts
        // or when the dependencies change before running the effect again.
        const currentUrl = analysisAudioUrl;
        
        // Only revoke if it's a blob URL, not a backend URL
        const isBlobUrl = currentUrl?.startsWith('blob:');

        return () => {
            if (currentUrl && isBlobUrl) {
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [analysisAudioUrl]);

    useEffect(() => {
        const handleRouting = async () => {
            const path = window.location.pathname;
            const match = path.match(/^\/view\/([a-zA-Z0-9]+)$/);

            if (match) {
                const analysisId = match[1];
                setLoaderText('Loading shared analysis...');
                setAppState('analyzing');
                try {
                    const data = await getSharedAnalysis(analysisId);
                    setSelectedAnalysis(data.analysisData);
                    setInitialReport(data.reportText); // A shared analysis might have a pre-generated report
                    setAppState('analysis');
                    setIsSharedView(true);
                    addNotification('info', 'Viewing a shared analysis.');
                } catch (error) {
                    console.error("Failed to load shared analysis:", error);
                    setAnalysisError("Could not load the shared analysis. The link may be invalid or expired.");
                    setAppState('home');
                } finally {
                    window.history.replaceState({}, document.title, '/');
                }
            } else {
                 // Load state from local storage only if not loading a shared link
                const savedState = loadState<AppState>('appState') || 'home';
                if (savedState === 'catalog') {
                    handleNavigate('catalog'); // Special handling to pre-load catalog data
                } else {
                    setAppState(savedState);
                }
                setSelectedAnalysis(loadState<AnalysisData>('selectedAnalysis'));
                setInitialReport(loadState<string>('initialReport'));
            }
        };
        
        handleRouting();
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, [addNotification]);

    useEffect(() => {
        // Don't save state if we are in a temporary shared view
        if (isSharedView) return;
        
        // Don't save 'login' state, so a refresh doesn't keep them on the login page
        if (appState !== 'login') {
             saveState('appState', appState);
        }
        saveState('user', user);
        saveState('selectedAnalysis', selectedAnalysis);
        saveState('initialReport', initialReport);
        saveState('analysisLibrary', analysisLibrary);
    }, [appState, user, selectedAnalysis, initialReport, analysisLibrary, isSharedView]);
    
     useEffect(() => {
        // Save chat history separately so it persists even in shared views.
        saveState(assistantChatStorageKey, assistantMessages);
    }, [assistantMessages]);


    const resetToHome = () => {
        setIsSharedView(false);
        setSelectedAnalysis(null);
        setInitialReport(null);
        setAnalysisAudioUrl(null);
        setAnalysisAudioTitle(null);
        setAppState('home');
    }

    const handleStartAnalysis = useCallback(async (file: File, fileName: string) => {
        setLoaderText('Uploading... Analyzing audio... Generating report...');
        setAnalysisError(null);
        setIsSharedView(false);
        setAppState('analyzing');
        setAnalysisAudioUrl(URL.createObjectURL(file));
        setAnalysisAudioTitle(fileName.replace(/\.[^/.]+$/, ""));

        try {
            const result: AnalysisResultPayload = await analyzeFile(file);
            const { analysisData, reportText } = result;
            
            const newLibraryItem: LibraryItem = {
                id: crypto.randomUUID(),
                songTitle: fileName.replace(/\.[^/.]+$/, "") || `Analysis #${analysisLibrary.length + 1}`,
                date: new Date().toISOString(),
                data: analysisData
            };
            if(user) { // Only add to library if logged in
                await uploadAnalysisAudio(file, newLibraryItem.id);
                setAnalysisLibrary(prev => [newLibraryItem, ...prev]);
            }
            setSelectedAnalysis(analysisData);
            setInitialReport(reportText);
            setAppState('analysis');
            addNotification('success', 'Analysis complete and saved to library.');

        } catch (error) {
            console.error("Analysis failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
            setAnalysisError(errorMessage);
            setAppState('home');
        }
    }, [analysisLibrary, user, addNotification]);
    
    const handleStartComparison = useCallback(async (aiSong: File, copyrightedSong: File, fileName: string) => {
        setLoaderText('Uploading... Comparing songs... Generating report...');
        setAnalysisError(null);
        setIsSharedView(false);
        setAppState('analyzing');
        setAnalysisAudioUrl(URL.createObjectURL(aiSong));
        setAnalysisAudioTitle(fileName.replace(/\.[^/.]+$/, ""));

        try {
            const result: AnalysisResultPayload = await compareFiles(aiSong, copyrightedSong);
            const { analysisData, reportText } = result;

            const newLibraryItem: LibraryItem = {
                id: crypto.randomUUID(),
                songTitle: fileName.replace(/\.[^/.]+$/, "") || `Comparison #${analysisLibrary.length + 1}`,
                date: new Date().toISOString(),
                data: analysisData
            };
            
            if(user) { // Only add to library if logged in
              await uploadAnalysisAudio(aiSong, newLibraryItem.id);
              setAnalysisLibrary(prev => [newLibraryItem, ...prev]);
            }
            setSelectedAnalysis(analysisData);
            setInitialReport(reportText);
            setAppState('analysis');
            addNotification('success', 'Comparison complete and saved to library.');

        } catch (error) {
            console.error("Comparison failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during comparison.";
            setAnalysisError(errorMessage);
            setAppState('home');
        }
    }, [analysisLibrary, user, addNotification]);

    const handleViewAnalysis = useCallback((item: LibraryItem) => {
        setSelectedAnalysis(item.data);
        // Point the audio URL to our backend endpoint for library items
        setAnalysisAudioUrl(`/api/audio/${item.id}`); 
        setAnalysisAudioTitle(item.songTitle);
        // A report might not be pre-generated for a library item.
        setInitialReport(null); 
        setIsSharedView(false);
        setAppState('analysis');
    }, []);

    const handleNavigate = useCallback(async (page: AppState) => {
        setAnalysisError(null);
        if (page === 'home' && isSharedView) {
            resetToHome();
        } else if (page === 'catalog') {
            try {
                setLoaderText('Loading Cleared Catalog...');
                setAppState('analyzing');
                const entries = await getCatalogEntries();
                setCatalogItems(entries);
                setAppState('catalog');
            } catch(e) {
                console.error("Failed to load catalog", e);
                setAnalysisError("Could not load the Cleared Catalog. Please try again later.");
                setAppState('home');
            }
        }
        else {
            setAppState(page);
        }
    }, [isSharedView]);

    const handleLogin = useCallback((loggedInUser: User) => {
        setUser(loggedInUser);
        setAppState('dashboard');
        addNotification('success', `Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
    }, [addNotification]);

    const handleLogout = useCallback(() => {
        setUser(null);
        // Fully clear state on logout to ensure a clean slate for the next user.
        clearState();
        setAnalysisLibrary([]);
        setAssistantMessages([{ role: 'model', content: "Hi! I'm Melody, your AI assistant. How can I help you today?" }]);
        resetToHome();
        addNotification('info', 'You have been signed out.');
    }, [addNotification]);
    
    const handleUpdateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        addNotification('success', 'Account details updated successfully.');
    }, [addNotification]);

    const handleSendAssistantMessage = useCallback(async (message: string) => {
        setIsAssistantResponding(true);
        setAssistantError(null);
    
        const newHistory: ChatMessage[] = [...assistantMessages, { role: 'user', content: message }];
        setAssistantMessages(newHistory);
    
        setAssistantMessages(prev => [...prev, { role: 'model', content: '', isLoading: true }]);
    
        try {
            const context: ChatContext = {
                appState,
                analysisData: selectedAnalysis
            };
    
            // Pass only non-system-init messages to the backend
            const historyForApi = newHistory.filter(m => m.content !== "Hi! I'm Melody, your AI assistant. How can I help you today?");
    
            const stream = await getChatAssistantStream(historyForApi, message, context);
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
    
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
                setAssistantMessages([...newHistory, { role: 'model', content: fullText, isLoading: true }]);
            }
            setAssistantMessages([...newHistory, { role: 'model', content: fullText, isLoading: false }]);
    
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An error occurred.";
            setAssistantError(errorMsg);
            addNotification('error', `AI Assistant Error: ${errorMsg}`);
            setAssistantMessages(newHistory); // remove placeholder
        } finally {
            setIsAssistantResponding(false);
        }
    }, [assistantMessages, appState, selectedAnalysis, addNotification]);

    const handleDeleteAnalysis = useCallback((id: string) => {
        setAnalysisLibrary(prev => prev.filter(item => item.id !== id));
        addNotification('info', 'Analysis deleted from library.');
    }, [addNotification]);

    const handleRenameAnalysis = useCallback((id: string, newTitle: string) => {
        setAnalysisLibrary(prev => prev.map(item =>
            item.id === id ? { ...item, songTitle: newTitle } : item
        ));
        addNotification('success', 'Analysis renamed.');
    }, [addNotification]);
    
    const handleFeedbackSubmit = async (type: string, message: string, email?: string) => {
        try {
            await sendFeedback(type, message, user?.email || email);
            setIsFeedbackModalOpen(false);
            addNotification('success', 'Thank you! Your feedback has been submitted.');
        } catch(e) {
             const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
             addNotification('error', `Feedback submission failed: ${errorMsg}`);
        }
    };
    
    const handleCatalogSubmitSuccess = (newItem: CatalogItem) => {
        setCatalogItems(prev => [newItem, ...prev]);
        handleNavigate('catalog');
        addNotification('success', 'Your track has been submitted to the Cleared Catalog!');
    }
    
    const renderContent = () => {
        switch (appState) {
            case 'home':
                return <HomePage onStartAnalysis={handleStartAnalysis} onStartComparison={handleStartComparison} onNavigate={handleNavigate} user={user} error={analysisError} />;
            case 'login':
                return <LoginPage onLogin={handleLogin} />;
            case 'dashboard':
                 return user ? <DashboardPage 
                            user={user} 
                            library={analysisLibrary} 
                            onNavigate={handleNavigate} 
                            onViewAnalysis={handleViewAnalysis}
                        /> : <LoginPage onLogin={handleLogin} />;
            case 'account':
                return user ? <AccountPage 
                            user={user}
                            onUpdateUser={handleUpdateUser}
                            onNavigate={handleNavigate}
                            onDeleteAccount={handleLogout}
                            onAddNotification={addNotification}
                        /> : <LoginPage onLogin={handleLogin} />;
            case 'analyzing':
                return <Loader text={loaderText} />;
            case 'analysis':
                const analysisItem = analysisLibrary.find(item => JSON.stringify(item.data) === JSON.stringify(selectedAnalysis))
                return selectedAnalysis ? <AnalysisPage 
                    analysisData={selectedAnalysis} 
                    analysisId={analysisItem?.id}
                    initialReportText={initialReport} 
                    isSharedView={isSharedView} 
                    user={user}
                    onCatalogSubmitSuccess={handleCatalogSubmitSuccess}
                    onAddNotification={addNotification}
                    analysisAudioUrl={analysisAudioUrl}
                    analysisAudioTitle={analysisAudioTitle}
                    /> : <HomePage onStartAnalysis={handleStartAnalysis} onStartComparison={handleStartComparison} onNavigate={handleNavigate} user={user} error={analysisError} />;
            case 'library':
                return user ? <LibraryPage 
                            library={analysisLibrary} 
                            onViewAnalysis={handleViewAnalysis} 
                            onDeleteAnalysis={handleDeleteAnalysis}
                            onRenameAnalysis={handleRenameAnalysis}
                        /> : <LoginPage onLogin={handleLogin} />;
            case 'prompt-composer':
                return <PromptComposerPage onAddNotification={addNotification} />;
            case 'info':
                return <InfoPage />;
            case 'pricing':
                return <PricingPage />;
            case 'catalog':
                return <CatalogPage entries={catalogItems} onNavigate={handleNavigate}/>;
            default:
                return <HomePage onStartAnalysis={handleStartAnalysis} onStartComparison={handleStartComparison} onNavigate={handleNavigate} user={user} error={analysisError} />;
        }
    };
    
    const mainContainerClasses = [
        'mt-8',
        'flex-grow',
        'flex',
        'flex-col',
        (appState === 'home' || appState === 'analyzing' || appState === 'pricing' || appState === 'login') && 'justify-center',
    ].filter(Boolean).join(' ');

    return (
        <div className={`min-h-screen bg-slate-900 text-slate-300 font-sans transition-opacity duration-500 ease-in ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <BackgroundAnimation />
             {/* Notification Container */}
            <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
                {notifications.map(n => (
                    <Notification key={n.id} notification={n} onDismiss={removeNotification} />
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
                <Header 
                    appState={appState}
                    onNavigate={handleNavigate}
                    user={user}
                    onLogout={handleLogout}
                />
                <main className={mainContainerClasses}>
                    {renderContent()}
                </main>
                <Footer onFeedbackClick={() => setIsFeedbackModalOpen(true)} />
            </div>
             <ChatBubble onClick={() => setIsChatOpen(true)} />
             <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={assistantMessages}
                onSendMessage={handleSendAssistantMessage}
                isResponding={isAssistantResponding}
                error={assistantError}
            />
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
                user={user}
            />
        </div>
    );
};

export default App;

