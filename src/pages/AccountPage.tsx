
import React, { useState } from 'react';
import type { User, AppState, Notification } from '../types';

interface AccountPageProps {
    user: User;
    onUpdateUser: (updatedUser: User) => void;
    onNavigate: (page: AppState) => void;
    onDeleteAccount: () => void;
    onAddNotification: (type: Notification['type'], message: string) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onUpdateUser, onNavigate, onDeleteAccount, onAddNotification }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ name, email });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            onAddNotification('error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            onAddNotification('error', 'Password must be at least 8 characters long.');
            return;
        }
        // In a real app, this would be an API call
        onAddNotification('success', 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleDelete = () => {
        onDeleteAccount();
        // No need to close modal, as the user will be logged out and redirected
    };

    const Card: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
    
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-slow">
            <h2 className="text-3xl font-bold text-white mb-8">My Account</h2>
            <div className="space-y-8">
                {/* Profile Information */}
                <Card title="Profile Information">
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="input-style" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="btn-primary">Save Changes</button>
                        </div>
                    </form>
                </Card>

                {/* Change Password */}
                <Card title="Change Password">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword"className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                            <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="newPassword"className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                            <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-style" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="btn-primary">Update Password</button>
                        </div>
                    </form>
                </Card>

                {/* Subscription */}
                <Card title="Subscription">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-slate-400">Your current plan:</p>
                            <p className="text-lg font-bold text-fuchsia-400">Pro Plan</p>
                        </div>
                        <button onClick={() => onNavigate('pricing')} className="btn-secondary">
                            Manage Subscription
                        </button>
                    </div>
                </Card>

                {/* Danger Zone */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            <p className="font-semibold text-slate-300">Delete Your Account</p>
                            <p className="text-sm text-slate-400">This will permanently delete your account and all associated data. This action cannot be undone.</p>
                        </div>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white">Are you sure?</h3>
                        <p className="text-slate-400 mt-2 mb-6">This will permanently delete your account, including your analysis library. This cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
             <style>{`
                .input-style {
                    width: 100%;
                    background-color: rgb(15 23 42 / 1); /* slate-900 */
                    border: 1px solid rgb(51 65 85 / 1); /* slate-600 */
                    border-radius: 0.5rem;
                    padding: 0.6rem 0.75rem;
                    color: rgb(203 213 225 / 1); /* slate-300 */
                }
                .input-style:focus {
                    outline: none;
                    --tw-ring-color: rgb(217 70 239 / 1); /* fuchsia-500 */
                    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
                }
                .btn-primary {
                    background-color: rgb(162 28 175 / 1); /* fuchsia-700 */
                    color: white;
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover {
                    background-color: rgb(192 38 211 / 1); /* fuchsia-600 */
                }
                .btn-secondary {
                    background-color: rgb(71 85 105 / 1); /* slate-600 */
                    color: white;
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    transition: background-color 0.2s;
                }
                .btn-secondary:hover {
                    background-color: rgb(100 116 139 / 1); /* slate-500 */
                }
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.7s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AccountPage;
