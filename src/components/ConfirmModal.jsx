// src/components/ConfirmModal.jsx
import { useEffect } from 'react'

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText, 
  isDestructive,
  children
}) {
  // Prevent scrolling on the body while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = 'auto' }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <div 
        className="bg-bg-card border border-bg-border rounded-2xl w-full max-w-sm p-5 shadow-medium animate-fade-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-text-primary mb-1.5 shrink-0">{title}</h3>
        {message && <p className="text-sm text-text-secondary mb-5 whitespace-pre-line shrink-0">{message}</p>}
        {children && <div className="mb-5 overflow-y-auto min-h-0 pr-2">{children}</div>}
        <div className="flex gap-2.5 shrink-0 mt-auto">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-bg-elevated text-sm font-medium text-text-primary hover:bg-bg-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97] ${
              isDestructive 
                ? 'bg-danger hover:bg-red-500' 
                : 'bg-accent hover:opacity-90'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
