'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  duration?: number
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce'
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -10 }
  }
}

export function AnimatedContainer({
  children,
  delay = 0,
  duration = 0.3,
  animation = 'fadeIn',
  ...props
}: AnimatedContainerProps) {
  const animationConfig = animations[animation]

  return (
    <motion.div
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      exit={animationConfig.exit}
      transition={{
        duration,
        delay,
        ease: [0.23, 1, 0.32, 1] // Custom easing for smooth animation
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for animating multiple children
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  ...props
}: {
  children: ReactNode
  staggerDelay?: number
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export function StaggerItem({
  children,
  animation = 'slideUp',
  ...props
}: {
  children: ReactNode
  animation?: keyof typeof animations
} & HTMLMotionProps<'div'>) {
  const animationConfig = animations[animation]

  return (
    <motion.div
      variants={animationConfig}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1]
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}