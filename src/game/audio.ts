import type { Audio } from '../types/gamespec'

export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private musicTrack: HTMLAudioElement | null = null
  private isAudioUnlocked = false
  private spec: Audio

  constructor(audioSpec: Audio) {
    this.spec = audioSpec
    this.init()
  }

  private async init(): Promise<void> {
    // Create audio unlock listener for mobile browsers
    this.setupAudioUnlock()
    
    // Preload sound effects
    await this.preloadSounds()
    
    // Preload background music
    await this.preloadMusic()
  }

  private setupAudioUnlock(): void {
    const unlockAudio = () => {
      if (this.isAudioUnlocked) return

      // Create and play a silent audio to unlock audio context
      const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgdBzuK0fPThjEGJ2+98OKaTxUNUqfj8btoHgU5j9r1zn0vBSB7w/LdlkELDl2y6OqnWhMKR53g7L1qIAY9k9P11ocxBiZttvPrpkQVDU6k9PG0azAGJnfR88t1JwYgcsXk4JhMEQ5Wu+3qpV4GEDx5vOnjklIYEFWu6+qrYBoGBjSa3Ouw==')
      silentAudio.play().catch(() => {})
      
      this.isAudioUnlocked = true
      
      document.removeEventListener('touchend', unlockAudio)
      document.removeEventListener('click', unlockAudio)
      document.removeEventListener('keydown', unlockAudio)
    }

    document.addEventListener('touchend', unlockAudio)
    document.addEventListener('click', unlockAudio)
    document.addEventListener('keydown', unlockAudio)
  }

  private async preloadSounds(): Promise<void> {
    const soundUrls = this.generateSoundUrls()
    
    const loadPromises = Object.entries(soundUrls).map(async ([key, url]) => {
      try {
        const audio = new Audio(url)
        audio.preload = 'auto'
        audio.volume = 0.7
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve)
          audio.addEventListener('error', reject)
          audio.load()
        })
        
        this.sounds.set(key, audio)
      } catch (error) {
        console.warn(`Failed to load sound ${key}:`, error)
        // Create fallback audio
        this.createFallbackSound(key)
      }
    })
    
    await Promise.allSettled(loadPromises)
  }

  private async preloadMusic(): Promise<void> {
    const musicUrl = this.generateMusicUrl(this.spec.music)
    
    try {
      this.musicTrack = new Audio(musicUrl)
      this.musicTrack.loop = true
      this.musicTrack.volume = 0.3
      this.musicTrack.preload = 'auto'
      
      await new Promise((resolve, reject) => {
        this.musicTrack!.addEventListener('canplaythrough', resolve)
        this.musicTrack!.addEventListener('error', reject)
        this.musicTrack!.load()
      })
    } catch (error) {
      console.warn('Failed to load music track:', error)
      this.createFallbackMusic()
    }
  }

  private generateSoundUrls(): Record<string, string> {
    // In a real implementation, these would be URLs to actual sound files
    // For now, we'll use data URLs for basic sounds or fallback to generated audio
    return {
      jump: this.generateToneDataUrl(440, 0.1, 'square'), // A4, 0.1s, square wave
      collect: this.generateToneDataUrl(660, 0.15, 'sine'), // E5, 0.15s, sine wave
      hurt: this.generateToneDataUrl(220, 0.2, 'sawtooth'), // A3, 0.2s, sawtooth
      victory: this.generateChordDataUrl([523, 659, 784], 1.0) // C-E-G major chord, 1s
    }
  }

  private generateMusicUrl(musicId: string): string {
    // In a real implementation, this would return actual music file URLs
    // For now, we'll create a simple procedural music pattern
    return this.generateLoopingMelodyDataUrl()
  }

  private generateToneDataUrl(frequency: number, duration: number, waveType: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine'): string {
    // Create a simple tone using Web Audio API and convert to data URL
    const sampleRate = 44100
    const samples = Math.floor(sampleRate * duration)
    const buffer = new ArrayBuffer(44 + samples * 2)
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // PCM
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // Mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, samples * 2, true)
    
    // Generate tone
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      let sample = 0
      
      switch (waveType) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case 'sawtooth':
          sample = 2 * (t * frequency % 1) - 1
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * (t * frequency % 1) - 1) - 1
          break
      }
      
      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.01), (samples - i) / (sampleRate * 0.01)))
      sample *= envelope * 0.3 // Volume
      
      view.setInt16(44 + i * 2, sample * 32767, true)
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  private generateChordDataUrl(frequencies: number[], duration: number): string {
    // Generate a chord by mixing multiple frequencies
    const sampleRate = 44100
    const samples = Math.floor(sampleRate * duration)
    const buffer = new ArrayBuffer(44 + samples * 2)
    const view = new DataView(buffer)
    
    // WAV header (same as above)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, samples * 2, true)
    
    // Generate chord
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      let sample = 0
      
      // Mix all frequencies
      for (const freq of frequencies) {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length
      }
      
      // Apply envelope
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.02), (samples - i) / (sampleRate * 0.1)))
      sample *= envelope * 0.4
      
      view.setInt16(44 + i * 2, sample * 32767, true)
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  private generateLoopingMelodyDataUrl(): string {
    // Generate a simple looping melody
    const notes = [523, 587, 659, 698, 784, 698, 659, 587] // C-D-E-F-G-F-E-D
    const noteDuration = 0.5
    const totalDuration = notes.length * noteDuration
    
    const sampleRate = 44100
    const samples = Math.floor(sampleRate * totalDuration)
    const buffer = new ArrayBuffer(44 + samples * 2)
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, samples * 2, true)
    
    // Generate melody
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const noteIndex = Math.floor(t / noteDuration) % notes.length
      const noteTime = t % noteDuration
      const frequency = notes[noteIndex]
      
      // Generate note with harmonic
      let sample = Math.sin(2 * Math.PI * frequency * t) * 0.6
      sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2 // Octave
      sample += Math.sin(2 * Math.PI * frequency * 3 / 2 * t) * 0.1 // Fifth
      
      // Apply note envelope
      const noteEnvelope = Math.min(1, Math.min(noteTime / 0.01, (noteDuration - noteTime) / 0.05))
      sample *= noteEnvelope * 0.2
      
      view.setInt16(44 + i * 2, sample * 32767, true)
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  private createFallbackSound(soundId: string): void {
    // Create a basic procedural sound effect
    const audio = new Audio(this.generateToneDataUrl(440, 0.1))
    audio.volume = 0.5
    this.sounds.set(soundId, audio)
  }

  private createFallbackMusic(): void {
    // Create a basic procedural music track
    this.musicTrack = new Audio(this.generateLoopingMelodyDataUrl())
    this.musicTrack.loop = true
    this.musicTrack.volume = 0.2
  }

  public playSound(soundId: string): void {
    if (!this.isAudioUnlocked) return

    const sound = this.sounds.get(soundId)
    if (sound) {
      // Reset and play
      sound.currentTime = 0
      sound.play().catch(error => {
        console.warn(`Failed to play sound ${soundId}:`, error)
      })
    }
  }

  public playMusic(): void {
    if (!this.isAudioUnlocked || !this.musicTrack) return

    this.musicTrack.play().catch(error => {
      console.warn('Failed to play music:', error)
    })
  }

  public stopMusic(): void {
    if (this.musicTrack) {
      this.musicTrack.pause()
      this.musicTrack.currentTime = 0
    }
  }

  public setMusicVolume(volume: number): void {
    if (this.musicTrack) {
      this.musicTrack.volume = Math.max(0, Math.min(1, volume))
    }
  }

  public setSoundVolume(volume: number): void {
    const vol = Math.max(0, Math.min(1, volume))
    this.sounds.forEach(sound => {
      sound.volume = vol
    })
  }

  public destroy(): void {
    // Stop and clean up all audio
    this.stopMusic()
    
    this.sounds.forEach(sound => {
      sound.pause()
      sound.src = ''
    })
    
    this.sounds.clear()
    
    if (this.musicTrack) {
      this.musicTrack.pause()
      this.musicTrack.src = ''
      this.musicTrack = null
    }
  }
}