import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const wrapRef = useRef<HTMLSpanElement>(null)

  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setPos({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    })
  }, [])

  useEffect(() => {
    if (!show) return
    updatePos()
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
          className="fixed z-[9999] w-64 bg-white border border-border rounded-lg shadow-lg p-3 text-xs text-text-secondary leading-relaxed font-normal normal-case tracking-normal pointer-events-none"
          style={{
            top: pos.top - 8,
            left: pos.left,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white" />
        </div>,
        document.body
      )}
    </span>
  )
}
