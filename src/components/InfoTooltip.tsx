import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; flipped: boolean } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2

    // Estimate tooltip height (or measure if already rendered)
    const tooltipH = tooltipRef.current?.offsetHeight || 80
    const spaceAbove = rect.top
    const flipped = spaceAbove < tooltipH + 12

    // Clamp horizontally so tooltip doesn't go off-screen
    const tooltipW = 256 // w-64 = 16rem = 256px
    const minLeft = tooltipW / 2 + 8
    const maxLeft = window.innerWidth - tooltipW / 2 - 8
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, centerX))

    setPos({
      top: flipped ? rect.bottom + 8 : rect.top - 8,
      left: clampedLeft,
      flipped,
    })
  }, [])

  useEffect(() => {
    if (!show) return
    updatePos()
    // Re-measure after first render so tooltipRef is available
    requestAnimationFrame(updatePos)
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShow(false)
    }
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    document.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [show, updatePos])

  return (
    <span className="relative inline-flex items-center" ref={wrapRef}>
      <button
        ref={btnRef}
        className="ml-1 p-0.5 rounded-full text-text-muted hover:text-primary hover:bg-primary/5 transition-colors cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        type="button"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && pos && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-64 bg-white border border-border rounded-lg shadow-lg p-3 text-xs text-text-secondary leading-relaxed font-normal normal-case tracking-normal pointer-events-none"
          style={{
            top: pos.top,
            left: pos.left,
            transform: pos.flipped ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
        >
          {text}
          {/* Arrow: points up when flipped (tooltip below), points down when above */}
          {pos.flipped ? (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-white" />
          ) : (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white" />
          )}
        </div>,
        document.body
      )}
    </span>
  )
}
