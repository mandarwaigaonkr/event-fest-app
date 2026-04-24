// src/components/ConfirmModal.jsx
// Glass-style confirmation modal

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
  if (!isOpen) return null

  // Prevent scrolling on the body while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div 
        className="glass rounded-3xl w-full max-w-sm p-6 shadow-glass-lg animate-fade-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text-primary mb-2 shrink-0">{title}</h3>
        {message && <p className="text-sm text-text-secondary mb-5 whitespace-pre-line shrink-0 leading-relaxed">{message}</p>}
        {children && <div className="mb-6 overflow-y-auto min-h-0 pr-2">{children}</div>}
        <div className="flex gap-3 shrink-0 mt-auto">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-text-primary hover:bg-bg-elevated/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] ${
              isDestructive 
                ? 'bg-danger hover:bg-red-500' 
                : 'bg-accent hover:bg-accent-light shadow-glow-sm'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
