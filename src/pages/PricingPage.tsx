
import React, { useState } from 'react';
import { CheckIcon } from '../components/icons';

const FeatureListItem: React.FC<{ children: React.ReactNode; isAvailable: boolean }> = ({ children, isAvailable }) => (
    <li className={`flex items-start gap-3 ${isAvailable ? 'text-slate-300' : 'text-slate-500'}`}>
        <CheckIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isAvailable ? 'text-sky-400' : 'text-slate-600'}`} />
        <span className={!isAvailable ? 'line-through' : ''}>{children}</span>
    </li>
);

const PricingCard: React.FC<{
    plan: string;
    description: string;
    price: string;
    period: string;
    features: { text: string; isAvailable: boolean }[];
    buttonText: string;
    isPopular?: boolean;
    contact?: boolean;
}> = ({ plan, description, price, period, features, buttonText, isPopular = false, contact = false }) => (
    <div className={`bg-slate-800/50 border rounded-xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1.5 relative ${
        isPopular 
            ? 'border-2 border-fuchsia-500 shadow-2xl shadow-fuchsia-900/20' 
            : 'border-slate-700 hover:border-slate-500/50 hover:shadow-2xl hover:shadow-slate-900/20'
    }`}>
        {isPopular && <div className="absolute top-0 right-8 -mt-3 bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>}
        <h3 className={`text-2xl font-bold ${isPopular ? 'text-fuchsia-400' : 'text-white'}`}>{plan}</h3>
        <p className="text-slate-400 mt-2 h-10">{description}</p>
        <div className="my-6">
            <span className="text-5xl font-extrabold text-white">{price}</span>
            {period && <span className="text-slate-400"> / {period}</span>}
        </div>
        <ul className="space-y-4 text-sm flex-grow">
            {features.map((feature, index) => (
                <FeatureListItem key={index} isAvailable={feature.isAvailable}>{feature.text}</FeatureListItem>
            ))}
        </ul>
        <button className={`mt-8 w-full font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 ${
            isPopular 
                ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500'
                : contact 
                ? 'bg-sky-600 text-white hover:bg-sky-500' 
                : 'bg-slate-600 text-white hover:bg-slate-500'
        }`}>
            {buttonText}
        </button>
    </div>
);

const plansData = [
    {
        plan: 'Starter',
        description: 'For getting started and occasional analysis.',
        price: { monthly: '$0', yearly: '$0' },
        period: { monthly: 'forever', yearly: 'forever' },
        buttonText: 'Get Started',
        features: [
            { text: '1 Analysis per month', isAvailable: true },
            { text: 'Standard Database Scan', isAvailable: true },
            { text: 'Basic Risk Score', isAvailable: true },
            { text: 'Full Expert Report & Chat', isAvailable: false },
            { text: 'Creative Brainstorming Tool', isAvailable: false },
            { text: 'AI Prompt Composer', isAvailable: false },
            { text: 'Analysis Library Access', isAvailable: false },
        ]
    },
    {
        plan: 'Creator',
        description: 'For active musicians and content creators.',
        price: { monthly: '$10', yearly: '$100' },
        period: { monthly: 'month', yearly: 'year' },
        buttonText: 'Choose Creator',
        features: [
            { text: '25 Analyses per month', isAvailable: true },
            { text: 'Standard Database Scan', isAvailable: true },
            { text: 'Advanced Risk Score', isAvailable: true },
            { text: 'Full Expert Report & Chat', isAvailable: true },
            { text: 'Creative Brainstorming Tool', isAvailable: false },
            { text: 'AI Prompt Composer', isAvailable: false },
            { text: 'Analysis Library Access', isAvailable: true },
        ]
    },
    {
        plan: 'Pro',
        description: 'For professionals who need unlimited power.',
        price: { monthly: '$20', yearly: '$200' },
        period: { monthly: 'month', yearly: 'year' },
        buttonText: 'Upgrade to Pro',
        isPopular: true,
        features: [
            { text: 'Unlimited Analyses', isAvailable: true },
            { text: 'Standard Database Scan', isAvailable: true },
            { text: 'Advanced Risk Score', isAvailable: true },
            { text: 'Full Expert Report & Chat', isAvailable: true },
            { text: 'Creative Brainstorming Tool', isAvailable: true },
            { text: 'AI Prompt Composer', isAvailable: true },
            { text: 'Analysis Library Access', isAvailable: true },
        ]
    },
    {
        plan: 'Studio',
        description: 'For teams and labels needing advanced features.',
        price: { monthly: 'Custom', yearly: 'Custom' },
        period: { monthly: '', yearly: '' },
        buttonText: 'Contact Us',
        contact: true,
        features: [
            { text: 'Everything in Pro', isAvailable: true },
            { text: 'Multiple Team Seats', isAvailable: true },
            { text: 'Priority Support Queue', isAvailable: true },
            { text: 'Custom Integrations', isAvailable: true },
            { text: 'Advanced Security & SSO', isAvailable: true },
            { text: 'Dedicated Account Manager', isAvailable: true },
            { text: 'Annual Billing Available', isAvailable: true },
        ]
    }
];

const allFeatures = [
    'Analyses per month',
    'Standard Database Scan',
    'Advanced Risk Score',
    'Full Expert Report & Chat',
    'Creative Brainstorming Tool',
    'AI Prompt Composer',
    'Analysis Library Access',
    'Multiple Team Seats',
    'Priority Support Queue'
];

const planFeatureMap = {
    'Starter': { 'Analyses per month': '1', 'Standard Database Scan': true, 'Advanced Risk Score': false, 'Full Expert Report & Chat': false, 'Creative Brainstorming Tool': false, 'AI Prompt Composer': false, 'Analysis Library Access': false, 'Multiple Team Seats': false, 'Priority Support Queue': false },
    'Creator': { 'Analyses per month': '25', 'Standard Database Scan': true, 'Advanced Risk Score': true, 'Full Expert Report & Chat': true, 'Creative Brainstorming Tool': false, 'AI Prompt Composer': false, 'Analysis Library Access': true, 'Multiple Team Seats': false, 'Priority Support Queue': false },
    'Pro': { 'Analyses per month': 'Unlimited', 'Standard Database Scan': true, 'Advanced Risk Score': true, 'Full Expert Report & Chat': true, 'Creative Brainstorming Tool': true, 'AI Prompt Composer': true, 'Analysis Library Access': true, 'Multiple Team Seats': false, 'Priority Support Queue': false },
    'Studio': { 'Analyses per month': 'Unlimited', 'Standard Database Scan': true, 'Advanced Risk Score': true, 'Full Expert Report & Chat': true, 'Creative Brainstorming Tool': true, 'AI Prompt Composer': true, 'Analysis Library Access': true, 'Multiple Team Seats': true, 'Priority Support Queue': true },
};


const PricingPage: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white">Find the Right Plan for You</h2>
                <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">Start for free and scale up as you create. Simple, transparent pricing.</p>
            </div>

            <div className="flex justify-center items-center gap-4 mb-10">
                <span className={`font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                <button
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-fuchsia-600' : 'bg-slate-600'}`}
                    aria-label={`Switch to ${billingCycle === 'monthly' ? 'yearly' : 'monthly'} billing`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`font-semibold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>Yearly</span>
                <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold px-2.5 py-1 rounded-full">Save 16%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {plansData.map((plan, index) => (
                    <PricingCard 
                        key={index} 
                        {...plan}
                        price={plan.price[billingCycle]}
                        period={plan.period[billingCycle]}
                    />
                ))}
            </div>

            {/* Detailed Feature Comparison */}
            <div className="mt-20">
                 <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white">Compare Plans</h2>
                    <p className="mt-2 text-lg text-slate-400">Find the perfect feature set for your needs.</p>
                </div>
                <div className="overflow-x-auto bg-slate-800/50 border border-slate-700 rounded-xl p-2">
                    <table className="w-full min-w-[800px] text-sm text-left text-slate-400">
                        <thead className="text-xs text-white uppercase bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-tl-lg">Features</th>
                                {plansData.map(p => <th key={p.plan} scope="col" className="px-6 py-3 text-center">{p.plan}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {allFeatures.map(feature => (
                                <tr key={feature} className="border-b border-slate-700 last:border-none hover:bg-slate-800/30">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-300 whitespace-nowrap">{feature}</th>
                                    {plansData.map(plan => {
                                        // @ts-ignore
                                        const featureValue = planFeatureMap[plan.plan][feature];
                                        return (
                                            <td key={`${plan.plan}-${feature}`} className="px-6 py-4 text-center">
                                                {typeof featureValue === 'boolean' ? (
                                                    featureValue ? <CheckIcon className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-slate-500 text-lg">&ndash;</span>
                                                ) : (
                                                    <span className="font-semibold text-slate-200">{featureValue}</span>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
