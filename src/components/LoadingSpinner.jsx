// LoadingSpinner — Full-screen centered loading indicator (dark theme)

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-9 h-9 border-2 border-bg-border border-t-accent rounded-full animate-spin" />
        <p className="text-xs text-text-muted">Loading...</p>
      </div>
    </div>
  )
}
