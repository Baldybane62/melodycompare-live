
import React, { useState } from 'react';
import type { User } from '../types';
import { UserCircleIcon } from '../components/icons';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // In a real app, you'd validate against a backend.
        // For this demo, we'll create a user from the email.
        const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        onLogin({ name, email });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-2xl shadow-fuchsia-900/10">
                <div className="text-center">
                    <div className="bg-fuchsia-500/10 text-fuchsia-400 rounded-full p-3 mb-4 inline-block">
                        <UserCircleIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Sign In</h2>
                    <p className="mt-2 text-slate-400">Access your MelodyCompare account.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    
                    <p className="text-xs text-center text-slate-500 pt-2">
                        This is a demo. You can enter any details to proceed.
                    </p>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;