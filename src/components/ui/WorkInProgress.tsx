'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wrench, Sparkles, Coffee, Code } from 'lucide-react'
import Link from 'next/link'
import BackgroundDecorations from './BackgroundDecorations'

interface WorkInProgressProps {
  title: string
  message?: string
}

const WorkInProgress: React.FC<WorkInProgressProps> = ({ 
  title, 
  message = "We're working hard to bring you something amazing!" 
}) => {
  return (
    <div className="min-h-screen bg-neutral-50 relative flex flex-col">
      <BackgroundDecorations />
      
      {/* Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="relative panda-logo-special group">
                <div className="text-4xl animate-panda-eating cursor-pointer panda-icon transition-all duration-300 hover:scale-110">
                  🐼
                </div>
                <div className="absolute -right-2 top-1 text-lg animate-bamboo-appear bamboo-stick">
                  🎋
                </div>
              </div>
              <h1 className="logo-text-small">zamboo</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Animated Panda Scene */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-7xl mb-4"
              >
                🐼
              </motion.div>
              
              {/* Floating Tools */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5
                }}
                className="absolute -top-4 -left-8 text-3xl"
              >
                🔨
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 1
                }}
                className="absolute -top-6 -right-8 text-3xl"
              >
                🔧
              </motion.div>

              {/* Floating Sparkles */}
              <motion.div
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.2
                }}
                className="absolute top-0 left-4 text-2xl"
              >
                ✨
              </motion.div>
              
              <motion.div
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: [0, -180, -360]
                }}
                transition={{ 
                  duration: 1.8,
                  repeat: Infinity,
                  delay: 0.8
                }}
                className="absolute bottom-4 right-4 text-2xl"
              >
                ⭐
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4 font-display">
              {title}
            </h1>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wrench className="text-duo-blue-500" size={24} />
              </motion.div>
              <span className="text-xl text-duo-green-600 font-semibold">
                Work In Progress
              </span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Code className="text-duo-purple-500" size={24} />
              </motion.div>
            </div>

            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              {message}
            </p>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3 text-sm text-neutral-500">
                <Coffee size={18} />
                <span>Our pandas are working hard with lots of bamboo fuel!</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                >
                  🎋
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 justify-center py-4 px-8 text-lg font-bold rounded-2xl min-w-[200px]"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            
            <Link
              href="/create"
              className="btn-success inline-flex items-center gap-2 justify-center py-4 px-8 text-lg font-bold rounded-2xl min-w-[200px]"
            >
              <Sparkles size={18} />
              Create a Game
            </Link>
          </motion.div>

          {/* Fun Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <div className="text-sm text-neutral-400 mb-2">
              Development Progress
            </div>
            <div className="w-64 mx-auto bg-neutral-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "45%" }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-duo-green-500 to-duo-blue-500 rounded-full relative"
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute right-0 top-0 h-full w-2 bg-white opacity-50 rounded-full"
                />
              </motion.div>
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              Coming Soon! 🚀
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default WorkInProgress