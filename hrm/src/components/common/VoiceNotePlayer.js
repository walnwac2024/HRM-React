import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

/**
 * VoiceNotePlayer - WhatsApp-style audio player for voice notes
 * 
 * @param {string} audioUrl - URL of the audio file
 * @param {boolean} isMe - Whether this is the current user's message
 * @param {number} duration - Duration in seconds (optional)
 */
export default function VoiceNotePlayer({ audioUrl, isMe = false, duration: initialDuration }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(initialDuration || 0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        audio.currentTime = percentage * duration;
    };

    const cyclePlaybackSpeed = () => {
        const speeds = [1, 1.5, 2];
        const currentIndex = speeds.indexOf(playbackRate);
        const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
        setPlaybackRate(nextSpeed);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextSpeed;
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-2 py-1 min-w-[200px] max-w-[280px]">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isMe
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
            >
                {isPlaying ? (
                    <FaPause className="w-3 h-3" />
                ) : (
                    <FaPlay className="w-3 h-3 ml-0.5" />
                )}
            </button>

            {/* Waveform / Progress Bar */}
            <div className="flex-1 min-w-0">
                <div
                    onClick={handleSeek}
                    className="relative h-6 cursor-pointer group"
                >
                    {/* Background bars (waveform simulation) */}
                    <div className="absolute inset-0 flex items-center gap-[2px] px-1">
                        {[...Array(40)].map((_, i) => {
                            const height = 20 + Math.random() * 60;
                            const isActive = (i / 40) * 100 <= progress;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all ${isActive
                                            ? isMe ? 'bg-white' : 'bg-emerald-600'
                                            : isMe ? 'bg-white/30' : 'bg-gray-300'
                                        }`}
                                    style={{ height: `${height}%` }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Duration / Time */}
            <div className={`text-[10px] font-medium tabular-nums min-w-[32px] text-right ${isMe ? 'text-white/90' : 'text-gray-600'
                }`}>
                {formatTime(isPlaying ? currentTime : duration)}
            </div>

            {/* Playback Speed */}
            <button
                onClick={cyclePlaybackSpeed}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${isMe
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
            >
                {playbackRate}x
            </button>
        </div>
    );
}
