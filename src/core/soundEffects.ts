/**
 * Sound Effects Manager
 * Handles all sound effects for the application with fallback support
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Initialize AudioContext for fallback sounds
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Play a sound effect from file or generate fallback
   */
  async playSound(soundName: 'click' | 'result' | 'error'): Promise<void> {
    try {
      // Try to play from file first
      const soundPath = `/sounds/${soundName}.mp3`;
      
      // Check if sound is already cached
      if (this.soundCache.has(soundName)) {
        const audio = this.soundCache.get(soundName)!;
        audio.currentTime = 0;
        await audio.play();
        return;
      }

      // Try to load and play the sound file
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      
      // Cache the audio element
      this.soundCache.set(soundName, audio);
      
      await audio.play();
    } catch (error) {
      // If file doesn't exist or fails to play, use Web Audio API fallback
      this.playFallbackSound(soundName);
    }
  }

  /**
   * Generate and play a fallback sound using Web Audio API
   */
  private playFallbackSound(soundName: 'click' | 'result' | 'error'): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure sound based on type
    switch (soundName) {
      case 'click':
        // Short, high-pitched click
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.1
        );
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;

      case 'result':
        // Pleasant notification sound
        oscillator.frequency.value = 523.25; // C5 note
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.3
        );
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        
        // Add a second tone for harmony
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        oscillator2.frequency.value = 659.25; // E5 note
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.4
        );
        oscillator2.start(this.audioContext.currentTime + 0.1);
        oscillator2.stop(this.audioContext.currentTime + 0.4);
        break;

      case 'error':
        // Low, descending error sound
        oscillator.frequency.value = 300;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.2
        );
        oscillator.frequency.exponentialRampToValueAtTime(
          150,
          this.audioContext.currentTime + 0.2
        );
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;
    }
  }

  /**
   * Preload sound files for better performance
   */
  preloadSounds(): void {
    const sounds: Array<'click' | 'result' | 'error'> = ['click', 'result', 'error'];
    
    sounds.forEach(soundName => {
      const soundPath = `/sounds/${soundName}.mp3`;
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      audio.preload = 'auto';
      
      // Cache the audio element
      this.soundCache.set(soundName, audio);
    });
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Convenience functions
export const playClickSound = () => soundManager.playSound('click');
export const playResultSound = () => soundManager.playSound('result');
export const playErrorSound = () => soundManager.playSound('error');
export const preloadSounds = () => soundManager.preloadSounds();
