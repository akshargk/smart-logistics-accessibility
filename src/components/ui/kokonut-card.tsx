import React, { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

interface KokonutCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glowColor?: string
}

/**
 * Kokonut UI — Bento Spotlight Card
 * Provides subtle mouse-tracking radial gradient glow and rounded dark-mode card styling.
 */
export function KokonutCard({
  children,
  className,
  glowColor = 'rgba(59, 130, 246, 0.12)',
  style,
  ...props
}: KokonutCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden transition-colors',
        className
      )}
      style={{
        ...style,
      }}
      {...(props as any)}
    >
      {/* Kokonut Spotlight radial gradient */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}
