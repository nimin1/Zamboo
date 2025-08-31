'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import ZambooMascot from './ZambooMascot'
import ZambooSpeechBubble from './ZambooSpeechBubble'
import type { ZambooState } from '@/types'

interface ZambooGuideProps {
  messages: string[]
  initialMood?: ZambooState['mood']
  autoAdvance?: boolean
  advanceDelay?: number
  onComplete?: () => void
  onMessageChange?: (messageIndex: number) => void
  showControls?: boolean
  interactive?: boolean
  size?: 'small' | 'medium' | 'large' | 'xl'
  position?: 'left' | 'right' | 'center'
  className?: string
}

const ZambooGuide: React.FC<ZambooGuideProps> = ({
  messages,
  initialMood = 'happy',
  autoAdvance = true,
  advanceDelay = 4000,
  onComplete,
  onMessageChange,
  showControls = true,
  interactive = true,
  size = 'large',
  position = 'center',
  className = ''
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: initialMood,
    animation: 'idle'
  })
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentMessage = messages[currentMessageIndex] || ''

  // Handle message completion
  const handleMessageComplete = useCallback(() => {
    if (autoAdvance && !isPaused && currentMessageIndex < messages.length - 1) {
      setTimeout(() => {
        advanceToNext()
      }, advanceDelay)
    } else if (currentMessageIndex >= messages.length - 1) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [autoAdvance, isPaused, currentMessageIndex, messages.length, advanceDelay, onComplete])

  const advanceToNext = useCallback(() => {
    if (currentMessageIndex < messages.length - 1) {
      const nextIndex = currentMessageIndex + 1
      setCurrentMessageIndex(nextIndex)
      onMessageChange?.(nextIndex)
      
      // Change Zamboo's mood/animation based on message content
      const nextMessage = messages[nextIndex].toLowerCase()
      if (nextMessage.includes('great') || nextMessage.includes('awesome') || nextMessage.includes('fantastic')) {
        setZambooState({ mood: 'celebrating', animation: 'dance' })
      } else if (nextMessage.includes('think') || nextMessage.includes('consider') || nextMessage.includes('hmm')) {
        setZambooState({ mood: 'thinking', animation: 'thinking' })
      } else if (nextMessage.includes('exciting') || nextMessage.includes('wow') || nextMessage.includes('amazing')) {
        setZambooState({ mood: 'excited', animation: 'jump' })
      } else if (nextMessage.includes('try') || nextMessage.includes('keep going') || nextMessage.includes('don\'t give up')) {
        setZambooState({ mood: 'encouraging', animation: 'clap' })
      } else {
        setZambooState({ mood: 'happy', animation: 'idle' })
      }
    }
  }, [currentMessageIndex, messages, onMessageChange])

  const goToPrevious = useCallback(() => {
    if (currentMessageIndex > 0) {
      const prevIndex = currentMessageIndex - 1
      setCurrentMessageIndex(prevIndex)
      onMessageChange?.(prevIndex)
      setZambooState({ mood: 'happy', animation: 'idle' })
      setIsComplete(false)
    }
  }, [currentMessageIndex, onMessageChange])

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused)
  }, [isPaused])

  const restart = useCallback(() => {
    setCurrentMessageIndex(0)
    setZambooState({ mood: initialMood, animation: 'idle' })
    setIsPaused(false)
    setIsComplete(false)
    onMessageChange?.(0)
  }, [initialMood, onMessageChange])

  // Handle Zamboo click interaction
  const handleZambooClick = useCallback(() => {
    if (interactive) {
      if (isComplete) {
        restart()
      } else if (isPaused) {
        setIsPaused(false)
      } else if (currentMessageIndex < messages.length - 1) {
        advanceToNext()
      }
    }
  }, [interactive, isComplete, isPaused, currentMessageIndex, messages.length, restart, advanceToNext])

  // Position classes
  const positionClasses = {
    left: 'flex-row items-start',
    right: 'flex-row-reverse items-start',
    center: 'flex-col items-center'
  }

  const speechBubblePosition = {
    left: 'right' as const,
    right: 'left' as const,
    center: 'top' as const
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <div className={`flex ${positionClasses[position]} space-x-4 space-y-4 ${className}`}>
      {/* Zamboo Mascot */}
      <motion.div
        className="flex-shrink-0"
        whileHover={interactive ? { scale: 1.02 } : {}}
      >
        <ZambooMascot
          state={zambooState}
          size={size}
          interactive={interactive}
          onAnimationComplete={() => {
            // Return to idle after special animations
            if (zambooState.animation !== 'idle') {
              setTimeout(() => {
                setZambooState(prev => ({ ...prev, animation: 'idle' }))
              }, 1000)
            }
          }}
        />
        
        {interactive && (
          <motion.div
            className="text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-gray-500">
              {isComplete ? 'Click to restart' : isPaused ? 'Click to continue' : 'Click to advance'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0">
        <ZambooSpeechBubble
          message={currentMessage}
          mood={zambooState.mood}
          position={speechBubblePosition[position]}
          size={size === 'xl' ? 'large' : size}
          showAudio={showControls}
          onComplete={handleMessageComplete}
          onReplay={() => {
            // Restart current message
            setZambooState(prev => ({ ...prev, animation: 'thinking' }))
            setTimeout(() => {
              setZambooState(prev => ({ ...prev, animation: 'idle' }))
            }, 500)
          }}
        />
        
        {/* Controls */}
        {showControls && (
          <motion.div
            className="flex items-center justify-center space-x-3 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Previous button */}
            <button
              onClick={goToPrevious}
              disabled={currentMessageIndex === 0}
              className="p-2 rounded-full bg-white shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              aria-label="Previous message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Progress indicator */}
            <div className="flex items-center space-x-1">
              {messages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentMessageIndex(index)
                    onMessageChange?.(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentMessageIndex 
                      ? 'bg-funky-pink scale-125' 
                      : index < currentMessageIndex 
                        ? 'bg-funky-purple' 
                        : 'bg-gray-300'
                  }`}
                  aria-label={`Go to message ${index + 1}`}
                />
              ))}
            </div>

            {/* Next/Pause button */}
            <button
              onClick={isComplete ? restart : isPaused ? togglePause : advanceToNext}
              disabled={!isComplete && currentMessageIndex >= messages.length - 1 && !isPaused}
              className="p-2 rounded-full bg-white shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              aria-label={isComplete ? 'Restart' : isPaused ? 'Resume' : 'Next message'}
            >
              {isComplete ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : isPaused ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ZambooGuide