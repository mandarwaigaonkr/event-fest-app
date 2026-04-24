// src/components/ConfirmModal.jsx
// Reusable confirmation modal overlay

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-card border border-bg-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <h3 className="text-lg font-bold text-text-primary mb-2 shrink-0">{title}</h3>
        {message && <p className="text-sm text-text-secondary mb-4 whitespace-pre-line shrink-0">{message}</p>}
        {children && <div className="mb-6 overflow-y-auto min-h-0 pr-2">{children}</div>}
        <div className="flex gap-3 shrink-0 mt-auto">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-bg-border text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-danger hover:bg-red-600 shadow-danger/20' 
                : 'bg-accent hover:bg-accent-light shadow-accent/20'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
