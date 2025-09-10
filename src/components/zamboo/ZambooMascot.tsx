'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Star, Music, Zap } from 'lucide-react'
import type { ZambooState } from '@/types'

interface ZambooMascotProps {
  state?: ZambooState
  size?: 'small' | 'medium' | 'large' | 'xl'
  showSpeechBubble?: boolean
  message?: string
  onAnimationComplete?: () => void
  interactive?: boolean
  className?: string
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24',
  large: 'w-32 h-32',
  xl: 'w-48 h-48'
}

const ZambooMascot: React.FC<ZambooMascotProps> = ({
  state = { mood: 'happy', animation: 'idle' },
  size = 'large',
  showSpeechBubble = false,
  message,
  onAnimationComplete,
  interactive = false,
  className = ''
}) => {
  const [currentAnimation, setCurrentAnimation] = useState(state.animation)
  const [showParticles, setShowParticles] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-cycle through idle animations like Duolingo
  useEffect(() => {
    if (state.animation === 'idle') {
      const idleAnimations = ['idle', 'float', 'thinking', 'wave', 'clap']
      let currentIndex = 0
      
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % idleAnimations.length
        setCurrentAnimation(idleAnimations[currentIndex] as any)
        
        // Add some randomness to make it feel more alive
        if (Math.random() > 0.7) {
          setShowParticles(true)
          setTimeout(() => setShowParticles(false), 1000)
        }
      }, Math.random() * 2000 + 3000) // Random interval between 3-5 seconds

      return () => clearInterval(interval)
    } else {
      setCurrentAnimation(state.animation)
    }
  }, [state.animation])

  // Particle effects for celebration
  useEffect(() => {
    if (state.mood === 'celebrating') {
      setShowParticles(true)
      const timer = setTimeout(() => setShowParticles(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [state.mood])

  // Duolingo-style animation variants - more expressive and bouncy
  const pandaVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    },
    dance: {
      scale: [1, 1.1, 0.95, 1.05, 1],
      rotate: [0, -5, 5, -3, 0],
      y: [0, -8, 0, -4, 0],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
        onComplete: onAnimationComplete
      }
    },
    jump: {
      y: [0, -25, -15, -30, 0],
      scale: [1, 1.1, 1.05, 1.15, 1],
      transition: {
        duration: 0.8,
        ease: "easeOut",
        times: [0, 0.3, 0.6, 0.8, 1],
        onComplete: onAnimationComplete
      }
    },
    clap: {
      scale: [1, 1.15, 0.9, 1.1, 1],
      rotate: [0, 3, -3, 2, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        times: [0, 0.3, 0.5, 0.7, 1],
        onComplete: onAnimationComplete
      }
    },
    thinking: {
      scale: [1, 1.02, 1],
      rotate: [0, -2, 2, 0],
      y: [0, -3, 0],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    },
    float: {
      y: [0, -8, 0],
      scale: [1, 1.03, 1],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    },
    celebrate: {
      scale: [1, 1.2, 0.9, 1.15, 1],
      rotate: [0, -10, 10, -5, 0],
      y: [0, -20, 0, -15, 0],
      transition: {
        duration: 1.5,
        ease: "easeOut",
        times: [0, 0.3, 0.5, 0.7, 1],
        onComplete: onAnimationComplete
      }
    },
    wave: {
      rotate: [0, 15, -10, 15, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        ease: "easeInOut",
        onComplete: onAnimationComplete
      }
    }
  }

  const moodEmojis = {
    happy: '😊',
    excited: '🤩',
    thinking: '🤔',
    celebrating: '🎉',
    encouraging: '💪'
  }

  const moodColors = {
    happy: 'from-duo-green-100 to-duo-green-200',
    excited: 'from-duo-blue-100 to-duo-blue-200',
    thinking: 'from-duo-purple-100 to-duo-purple-200',
    celebrating: 'from-duo-yellow-100 to-duo-yellow-200',
    encouraging: 'from-duo-red-100 to-duo-red-200'
  }

  const handleClick = useCallback(() => {
    if (interactive) {
      // Random celebration animation like Duolingo
      const celebrations = ['jump', 'dance', 'clap'] as const
      const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)]
      
      setCurrentAnimation(randomCelebration)
      setShowParticles(true)
      
      setTimeout(() => {
        setCurrentAnimation('idle')
        setShowParticles(false)
      }, 1500)
    }
  }, [interactive])

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="mb-4 relative"
          >
            <div className={`bg-gradient-to-r ${moodColors[state.mood]} rounded-2xl p-4 shadow-lg border-2 border-white max-w-xs`}>
              <p className="text-base md:text-base font-bold text-neutral-800 font-display leading-tight text-center">
                {message}
              </p>
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2">
                <div className={`w-0 h-0 border-l-[15px] border-r-[15px] border-t-[15px] border-l-transparent border-r-transparent border-t-white`}></div>
              </div>
            </div>
            
            {/* Mood indicator emoji */}
            <div className="absolute -top-2 -right-2 text-2xl">
              {moodEmojis[state.mood]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Zamboo Character */}
      <motion.div
        className={`relative ${sizeClasses[size]} ${interactive ? 'cursor-pointer' : ''}`}
        variants={pandaVariants}
        animate={currentAnimation}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
      >
        {/* Main panda body */}
        <div className={`w-full h-full bg-gradient-to-br ${moodColors[state.mood]} rounded-full shadow-lg border-4 border-white relative overflow-hidden`}>
          {/* Panda face */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🐼
          </div>
          
          {/* Animated eyes based on mood */}
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-black rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-black rounded-full animate-pulse"></div>
          
          {/* Bamboo accessory */}
          <motion.div
            className="absolute -top-2 -right-1 text-2xl"
            animate={{ rotate: showParticles ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 0.5, repeat: showParticles ? Infinity : 0 }}
          >
            🎋
          </motion.div>
        </div>

        {/* Interactive glow effect */}
        <AnimatePresence>
          {(isHovered || showParticles) && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-duo-green-300 to-duo-blue-300 opacity-20 blur-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0.2 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{ zIndex: -1 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Particle Effects */}
      <AnimatePresence>
        {showParticles && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100 + -50
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%'
                }}
              >
                {['✨', '🌟', '💫', '⭐'][i % 4]}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Floating icons based on mood */}
      <AnimatePresence>
        {state.mood === 'celebrating' && (
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex space-x-2">
              <Heart className="text-duo-red-500" size={20} />
              <Star className="text-duo-yellow-500" size={20} />
              <Sparkles className="text-duo-purple-500" size={20} />
            </div>
          </motion.div>
        )}
        
        {state.mood === 'excited' && (
          <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Zap className="text-duo-yellow-500" size={24} />
          </motion.div>
        )}
        
        {state.mood === 'thinking' && (
          <motion.div
            className="absolute -top-6 -right-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-lg">💭</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name tag */}
      {size === 'xl' && (
        <motion.div
          className="mt-4 bg-white rounded-full px-4 py-2 shadow-soft border-2 border-duo-green-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-bold text-duo-green-600 text-lg">Zamboo 🐼</p>
        </motion.div>
      )}
    </div>
  )
}

export default ZambooMascot