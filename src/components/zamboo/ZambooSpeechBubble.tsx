'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, RotateCcw, Play } from 'lucide-react'
import type { ZambooState } from '@/types'

interface ZambooSpeechBubbleProps {
  message: string
  mood?: ZambooState['mood']
  autoHide?: boolean
  hideDelay?: number
  showAudio?: boolean
  onComplete?: () => void
  onReplay?: () => void
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'small' | 'medium' | 'large'
}

const ZambooSpeechBubble: React.FC<ZambooSpeechBubbleProps> = ({
  message,
  mood = 'happy',
  autoHide = false,
  hideDelay = 3000,
  showAudio = false,
  onComplete,
  onReplay,
  className = '',
  position = 'top',
  size = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedMessage, setDisplayedMessage] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Typing animation
  useEffect(() => {
    if (message && message.length > 0) {
      setIsTyping(true)
      setDisplayedMessage('')
      setCurrentIndex(0)
    }
  }, [message])

  useEffect(() => {
    if (isTyping && currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedMessage(prev => prev + message[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50) // Typing speed

      return () => clearTimeout(timer)
    } else if (isTyping && currentIndex >= message.length) {
      setIsTyping(false)
      onComplete?.()
    }
  }, [isTyping, currentIndex, message, onComplete])

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && !isTyping && displayedMessage.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, hideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay, isTyping, displayedMessage.length])

  // Text-to-speech simulation (placeholder)
  const handleAudioToggle = () => {
    setAudioEnabled(!audioEnabled)
    // TODO: Implement actual text-to-speech
    console.log('Audio toggled:', !audioEnabled)
  }

  const handleReplay = () => {
    setCurrentIndex(0)
    setDisplayedMessage('')
    setIsTyping(true)
    setIsVisible(true)
    onReplay?.()
  }

  const moodColors = {
    happy: 'from-yellow-100 to-orange-100 border-yellow-300',
    excited: 'from-pink-100 to-purple-100 border-pink-300',
    thinking: 'from-blue-100 to-indigo-100 border-blue-300',
    celebrating: 'from-green-100 to-emerald-100 border-green-300',
    encouraging: 'from-red-100 to-rose-100 border-red-300'
  }

  const moodEmojis = {
    happy: '😊',
    excited: '🤩',
    thinking: '🤔',
    celebrating: '🎉',
    encouraging: '💪'
  }

  const sizeClasses = {
    small: 'text-sm max-w-xs p-3',
    medium: 'text-base max-w-sm p-4',
    large: 'text-lg max-w-md p-5'
  }

  const tailPositions = {
    top: {
      tail: 'bottom-0 left-1/2 transform translate-y-full -translate-x-1/2',
      direction: 'border-t-white'
    },
    bottom: {
      tail: 'top-0 left-1/2 transform -translate-y-full -translate-x-1/2',
      direction: 'border-b-white'
    },
    left: {
      tail: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2',
      direction: 'border-l-white'
    },
    right: {
      tail: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2',
      direction: 'border-r-white'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`relative ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? -10 : 10 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
        >
          {/* Main bubble */}
          <div className={`
            bg-gradient-to-r ${moodColors[mood]} 
            rounded-2xl shadow-lg border-2 
            ${sizeClasses[size]}
            relative backdrop-blur-sm
          `}>
            {/* Content */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {displayedMessage}
                  {isTyping && (
                    <motion.span
                      className="inline-block w-1 h-5 bg-gray-600 ml-1"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </p>
              </div>
              
              {/* Mood emoji */}
              <div className="ml-3 text-xl flex-shrink-0">
                {moodEmojis[mood]}
              </div>
            </div>

            {/* Controls */}
            {(showAudio || onReplay) && (
              <div className="flex items-center justify-end mt-3 space-x-2">
                {showAudio && (
                  <button
                    onClick={handleAudioToggle}
                    className="p-1 rounded-full hover:bg-white/50 transition-colors"
                    aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
                  >
                    {audioEnabled ? (
                      <Volume2 size={16} className="text-gray-600" />
                    ) : (
                      <VolumeX size={16} className="text-gray-400" />
                    )}
                  </button>
                )}
                
                {onReplay && !isTyping && (
                  <button
                    onClick={handleReplay}
                    className="p-1 rounded-full hover:bg-white/50 transition-colors"
                    aria-label="Replay message"
                  >
                    <RotateCcw size={16} className="text-gray-600" />
                  </button>
                )}
              </div>
            )}

            {/* Speech bubble tail */}
            <div className={`absolute ${tailPositions[position].tail}`}>
              <div className={`w-0 h-0 border-l-[15px] border-r-[15px] border-t-[15px] border-l-transparent border-r-transparent ${tailPositions[position].direction}`}></div>
            </div>
          </div>

          {/* Floating particles for celebration mood */}
          <AnimatePresence>
            {mood === 'celebrating' && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-lg pointer-events-none"
                    initial={{ 
                      opacity: 0,
                      x: Math.random() * 20 - 10,
                      y: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: -30,
                      x: (Math.random() - 0.5) * 40
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    style={{
                      top: '20%',
                      left: '20%' + (i * 30) + '%'
                    }}
                  >
                    {['🎉', '✨', '🌟'][i]}
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Thinking dots for thinking mood */}
          <AnimatePresence>
            {mood === 'thinking' && isTyping && (
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1,
                        delay: i * 0.2,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ZambooSpeechBubble