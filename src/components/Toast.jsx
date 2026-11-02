import { createContext, useCallback, useContext, useState } from 'react'
import { X } from 'lucide-react'

const ToastContext = createContext(null)
let nextId = 0

/**
 * Small notification stack in the bottom-right corner.
 * toast({ title, text, icon, tone: 'brand' | 'amber' | 'emerald' })
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (t) => {
      const id = ++nextId
      setToasts((list) => [...list, { ...t, id }])
      setTimeout(() => dismiss(id), t.duration ?? 4000)
    },
    [dismiss]
  )

  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6">
        {toasts.map(({ id, title, text, icon: Icon, tone = 'brand' }) => (
          <div
            key={id}
            role="status"
            className="card pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 p-4 shadow-lg dark:shadow-black/40"
          >
            {Icon && (
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
                <Icon size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{title}</p>
              {text && <p className="mt-0.5 text-sm text-slate-500">{text}</p>}
            </div>
            <button onClick={() => dismiss(id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
