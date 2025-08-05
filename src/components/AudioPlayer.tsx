import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from './icons';

interface AudioPlayerProps {
    src: string;
    title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time < 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    useEffect(() => {
        const audio = audioRef.current;
        if(!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };
        const handleEnded = () => {
            setIsPlaying(false);
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        // Reset state when src changes and load new audio
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        audio.load();

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [src]);
    
    const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !audioRef.current || !duration) return;
        const progressBar = progressBarRef.current;
        const rect = progressBar.getBoundingClientRect();
        const scrubTime = ((e.clientX - rect.left) / rect.width) * duration;
        audioRef.current.currentTime = scrubTime;
        setCurrentTime(scrubTime);
    };
    
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 flex items-center gap-4 w-full">
            <audio ref={audioRef} src={src} preload="metadata" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}></audio>
            <button
                onClick={togglePlayPause}
                className="w-12 h-12 flex-shrink-0 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="flex-grow flex flex-col justify-center overflow-hidden">
                <p className="font-bold text-white truncate" title={title}>{title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                     <div ref={progressBarRef} onClick={onScrub} className="w-full h-1.5 bg-slate-700 rounded-full cursor-pointer group">
                        <div
                            className="h-full bg-fuchsia-500 rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
