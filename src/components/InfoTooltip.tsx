import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!show) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [show])

  return (
    <span className="relative inline-flex items-center" ref={ref}>
      <button
        className="ml-1 p-0.5 rounded-full text-text-muted hover:text-primary hover:bg-primary/5 transition-colors cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        type="button"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white border border-border rounded-lg shadow-lg p-3 text-xs text-text-secondary leading-relaxed font-normal normal-case tracking-normal">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white" />
        </div>
      )}
    </span>
  )
}
