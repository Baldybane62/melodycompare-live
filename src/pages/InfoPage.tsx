
import React, { useState, useEffect } from 'react';
import type { InfoSection, SystemStatus } from '../types';
import { getSystemStatus } from '../services/geminiService';
import { ChevronDownIcon } from '../components/icons';

const faqData = [
    {
        q: "What is MelodyCompare?",
        a: "MelodyCompare is an AI-powered tool designed to help musicians, producers, and creators analyze their music for potential copyright infringement. It provides a detailed risk assessment by comparing your track against existing songs and offers creative suggestions to help you make your work more original."
    },
    {
        q: "Is the analysis from MelodyCompare legal advice?",
        a: "No. This is a critical point. MelodyCompare is an informational tool only. The analysis, risk scores, and AI-generated reports DO NOT constitute legal advice. Copyright law is complex and nuanced. We strongly recommend consulting with a qualified music or intellectual property lawyer before releasing your music."
    },
    {
        q: "What is the accuracy of the scan results?",
        a: "MelodyCompare uses a two-part system. For direct, identical copies of songs (audio fingerprinting), accuracy is exceptionally high, over 99%. For more nuanced creative similarities (like melody or chord progressions), our AI provides a 'Risk Score' and 'Expert Report' rather than a simple percentage. This is about giving you the same expert-level insight a musicologist would provide to help you identify potential issues and make your work more unique."
    },
    {
        q: "How does the analysis work?",
        a: "Our system uses a multi-faceted approach. It combines audio fingerprinting to find direct matches, AI-powered stem analysis to compare individual elements like vocals and drums, and similarity algorithms to calculate an overall risk score. The AI report then synthesizes this data into a human-readable summary."
    },
    {
        q: "Is my uploaded music stored on your servers?",
        a: "No. For your privacy and security, uploaded audio files are processed in-memory for the analysis and are not stored on our servers long-term. This is a demonstration app, and we do not retain your creative work."
    }
];

// StatusRow component for displaying individual status items
const StatusRow: React.FC<{ label: string; isOk: boolean; details?: string | null }> = ({ label, isOk, details }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-b-0">
        <span className="text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
            {details && <span className="text-sm text-slate-400">{details}</span>}
            <span className={`text-lg ${isOk ? 'text-green-400' : 'text-red-400'}`}>
                {isOk ? '✅' : '❌'}
            </span>
        </div>
    </div>
);

// Loader component for loading states
const Loader: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-400 mr-3"></div>
        <span className="text-slate-400">{text}</span>
    </div>
);

// SystemStatusChecker component for diagnostic functionality
const SystemStatusChecker: React.FC = () => {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getSystemStatus();
                setStatus(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to fetch system status');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatus();
    }, []);

    if (isLoading) {
        return <Loader text="Checking system status..." />;
    }

    if (error) {
        return <p className="text-red-400">Error: {error}</p>;
    }

    if (!status) {
        return <p className="text-slate-400">Could not retrieve system status.</p>;
    }

    return (
        <div className="space-y-4">
            <h2>System Status & Credentials Check</h2>
            <p>This page checks if the server has access to the necessary API keys and credentials from your environment variables (e.g., your <code>env</code> files or Render dashboard). <strong>Your secret keys are never displayed here.</strong></p>
            
            <div className="bg-slate-900/50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-bold text-sky-400 mb-2">Google Gemini API</h3>
                <StatusRow label="API Key" isOk={status.geminiConfigured} />
                {!status.geminiConfigured && <p className="text-sm text-amber-400 mt-2">The Gemini API key is missing. All AI features will fail.</p>}
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-bold text-sky-400 mb-2">ACRCloud Live Analysis</h3>
                <StatusRow label="Overall Status" isOk={status.acrCloudConfigured} details={status.acrCloudConfigured ? 'Enabled' : 'Disabled'} />
                <StatusRow label="Host" isOk={!!status.acrHost} details={status.acrHost} />
                <StatusRow label="Access Key" isOk={status.acrAccessKeySet} />
                <StatusRow label="Access Secret" isOk={status.acrAccessSecretSet} />

                {status.acrCloudConfigured && (
                    <div className="mt-3 text-sm text-green-400/80 border-l border-slate-700 pl-3">
                        <p>All ACRCloud credentials are set on the server. If you are still seeing a "Missing/Invalid Access Key (Code: 3001)" error, it means the values themselves (copied from your ACRCloud dashboard) are incorrect. Please verify them carefully, ensuring there are no extra spaces.</p>
                    </div>
                )}

                {!status.acrCloudConfigured && (
                    <div className="mt-3 text-sm text-amber-400/80 border-l border-slate-700 pl-3">
                        <p>One or more ACRCloud credentials are not set on the server. Live fingerprinting analysis is disabled, and the app will use simulated data instead.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<InfoSection>('mission');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const NavButton: React.FC<{ section: InfoSection, children: React.ReactNode }> = ({ section, children }) => (
        <button
            onClick={() => setActiveSection(section)}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                activeSection === section 
                    ? 'bg-fuchsia-500/10 text-fuchsia-400' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
        >
            {children}
        </button>
    );

    const SectionContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-fuchsia-400 prose-strong:text-white prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline">
            {children}
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'mission':
                return (
                    <SectionContent>
                        <h2>The AI Solution to an AI Problem</h2>
                        <p>Generative AI has unleashed a new era of musical creativity. It has also created a new, complex problem: <strong>How do you innovate with confidence when the line between inspiration and infringement is blurrier than ever?</strong></p>
                        <p>This is the central question MelodyCompare was built to answer. We believe that the same technology that created this challenge is the only tool powerful enough to solve it. We are using AI to fight for the creator.</p>
                        
                        <h3>Your Unbiased, Independent Partner</h3>
                        <p>Major streaming platforms and record labels have their own priorities. Their analysis tools will always serve their own interests first. We are different. MelodyCompare is not a publisher, a label, or a streaming giant.</p>
                        <p><strong>Our only mission is to empower you with transparent, objective, and actionable intelligence.</strong> We provide the clarity you need to navigate the new music landscape, protecting your work and giving you the confidence to release it to the world.</p>
                        <p>This isn't just about avoiding risk. It's about enabling creativity with peace of mind. That is our promise to you.</p>
                    </SectionContent>
                );
            case 'faq':
                return (
                    <SectionContent>
                        <h2>Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqData.map((item, index) => (
                                <div key={index} className="border-b border-slate-700 last:border-b-0 pb-4">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex justify-between items-center text-left"
                                    >
                                        <h3 className="text-lg font-semibold text-white">{item.q}</h3>
                                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 pt-3' : 'max-h-0'}`}>
                                        <p>{item.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionContent>
                );
            case 'help':
                return (
                    <SectionContent>
                        <h2>Help & Support</h2>
                        <p>If you encounter any issues or have questions, please don't hesitate to reach out. You can contact our support team via email at <a href="mailto:support@melodycompare.com">support@melodycompare.com</a>.</p>
                        <p>We typically respond within 24-48 hours. Please provide as much detail as possible about your issue to help us resolve it quickly.</p>
                    </SectionContent>
                );
            case 'privacy':
                return (
                     <SectionContent>
                        <h2>Privacy Policy</h2>
                        <p><strong>Last Updated: 3rd August 2025</strong></p>
                        <p>Your privacy is paramount. This policy outlines how we handle your data.</p>
                        <h3>Data We Collect</h3>
                        <ul>
                            <li><strong>Account Information:</strong> When you register, we collect your name and email address.</li>
                            <li><strong>Analysis Data:</strong> We process your uploaded audio files to provide our services. These files are NOT stored on our servers after the analysis is complete. The resulting analysis reports are stored in your private library.</li>
                            <li><strong>Usage Data:</strong> We may collect anonymous data about how you interact with our service to improve user experience.</li>
                        </ul>
                        <h3>How We Use Your Data</h3>
                        <ul>
                            <li>To provide and maintain our service.</li>
                            <li>To manage your account and provide customer support.</li>
                            <li>To improve our application.</li>
                        </ul>
                         <p>We will never sell your personal data or your creative work. Please note this is placeholder text and should be reviewed by a legal expert.</p>
                    </SectionContent>
                );
            case 'terms':
                return (
                     <SectionContent>
                        <h2>Terms of Service</h2>
                        <p><strong>Last Updated: 3rd August 2025</strong></p>
                        <p>By using MelodyCompare, you agree to these terms.</p>
                        <h3>1. Use of Service</h3>
                        <p>You agree to use our service for its intended purpose of music analysis. You are responsible for the content you upload and must have the necessary rights to do so.</p>
                        <h3>2. Disclaimer of Legal Advice</h3>
                        <p>MelodyCompare provides informational analysis only. It is not a substitute for professional legal advice. The risk scores and reports do not guarantee a song is free from copyright claims. We are not liable for any legal action taken against you in relation to your music.</p>
                         <h3>3. Intellectual Property</h3>
                        <p>You retain all ownership rights to the music you upload. We claim no ownership over your creative work.</p>
                        <h3>4. Limitation of Liability</h3>
                        <p>Our service is provided "as is". We are not responsible for any damages or losses resulting from your use of our platform. Please note this is placeholder text and should be reviewed by a legal expert.</p>
                    </SectionContent>
                );
            case 'legal':
                 return (
                    <SectionContent>
                        <h2>Legal Notice</h2>
                        <p>MelodyCompare is a product of MelodyCompare Inc. The information provided on this website is for informational purposes only and does not constitute legal advice.</p>
                        <p>The service is provided "as is" without any warranties, express or implied. By using our service, you agree to our Terms of Service and Privacy Policy.</p>
                        <p>For legal inquiries, please contact <a href="mailto:support@melodycompare.com">support@melodycompare.com</a>.</p>
                    </SectionContent>
                );
            case 'status':
                return (
                    <SectionContent>
                        <SystemStatusChecker />
                    </SectionContent>
                );
            default:
                return <SectionContent><h2>Welcome</h2><p>Please select a topic from the navigation.</p></SectionContent>;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <nav className="md:col-span-1">
                <div className="sticky top-24 space-y-2">
                    <NavButton section="mission">Our Mission</NavButton>
                    <NavButton section="faq">FAQ</NavButton>
                    <NavButton section="terms">Terms of Service</NavButton>
                    <NavButton section="privacy">Privacy Policy</NavButton>
                    <NavButton section="help">Help & Support</NavButton>
                    <NavButton section="legal">Legal</NavButton>
                    <NavButton section="status">System Status</NavButton>
                </div>
            </nav>
            <main className="md:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-8 min-h-[400px]">
                {renderContent()}
            </main>
        </div>
    );
};

export default InfoPage;