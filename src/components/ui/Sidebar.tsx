'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  href: string
  icon: string
  label: string
  isActive?: boolean
}

interface SidebarProps {
  navItems: NavItem[]
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isExpanded ? (isMobile ? 200 : 256) : 80 // Smaller width on mobile
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
      className="bg-white border-r border-neutral-200 flex-col flex-shrink-0 hidden sm:flex relative"
    >
      <div className="p-4 flex-1">
        <div className="sticky top-6">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || item.isActive
              
              return (
                <Link 
                  key={index}
                  href={item.href} 
                  className={`relative group flex items-center transition-all duration-200 font-semibold cursor-pointer border-none mb-2 min-h-[56px] rounded-2xl ${
                    isExpanded
                      ? `gap-4 px-4 py-4 ${isActive ? 'text-white bg-blue-500 hover:bg-blue-600' : 'text-neutral-600 hover:bg-blue-50'}`
                      : `justify-center px-2 py-4 ${isActive ? 'text-white bg-blue-500 hover:bg-blue-600' : 'text-neutral-600 hover:bg-blue-50'}`
                  }`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8125rem' }}
                >
                  <div className="w-8 h-8 flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Stylish Toggle Button */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={toggleSidebar}
              className={`relative group w-12 h-12 mx-auto flex items-center justify-center rounded-full transition-all duration-300 ${
                isExpanded
                  ? 'bg-gradient-to-r from-blue-500 to-sky-400 text-white hover:from-blue-600 hover:to-sky-500 shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-blue-500 to-sky-400 text-white hover:from-blue-600 hover:to-sky-500 shadow-lg hover:shadow-xl'
              }`}
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <div className="transition-transform duration-300 group-hover:scale-125">
                {isExpanded ? (
                  <ChevronLeft size={20} className="drop-shadow-sm" />
                ) : (
                  <ChevronRight size={20} className="drop-shadow-sm" />
                )}
              </div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 group-hover:animate-ping"></div>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                {isExpanded ? 'Hide Menu' : 'Show Menu'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar