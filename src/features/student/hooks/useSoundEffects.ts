
import { useState, useRef, useCallback } from 'react';

export const useSoundEffects = (initialEnabled: boolean = true) => {
    const [soundEnabled, setSoundEnabled] = useState(initialEnabled);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playSound = useCallback((type: 'correct' | 'wrong') => {
        if (!soundEnabled) return;

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            if (type === 'correct') {
                // Pleasant success sound - ascending notes
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
            } else {
                // Soft error sound - descending tone
                oscillator.frequency.setValueAtTime(311.13, ctx.currentTime); // Eb4
                oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3); // A3
                gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            console.log('Audio not supported', e);
        }
    }, [soundEnabled]);

    return { soundEnabled, setSoundEnabled, playSound };
};
