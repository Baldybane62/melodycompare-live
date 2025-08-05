
import React from 'react';
import { CheckIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from './icons';
import type { Notification as NotificationType } from '../types';

interface NotificationProps {
    notification: NotificationType;
    onDismiss: (id: string) => void;
}

const icons = {
    success: <CheckIcon className="w-6 h-6 text-green-400" />,
    error: <XCircleIcon className="w-6 h-6 text-red-400" />,
    info: <InformationCircleIcon className="w-6 h-6 text-sky-400" />,
};

const colors = {
    success: 'bg-green-800/50 border-green-500/30',
    error: 'bg-red-800/50 border-red-500/30',
    info: 'bg-sky-800/50 border-sky-500/30',
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
    return (
        <div className={`flex items-start p-4 rounded-lg shadow-lg border backdrop-blur-sm ${colors[notification.type]} animate-slide-in-right`}>
            <div className="flex-shrink-0">{icons[notification.type]}</div>
            <div className="ml-3 flex-1 pt-0.5">
                <p className="text-sm font-medium text-slate-200">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
                <button 
                    onClick={() => onDismiss(notification.id)} 
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition"
                    aria-label="Dismiss notification"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Notification;
