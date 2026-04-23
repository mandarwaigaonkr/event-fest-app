// LoadingSpinner — Reusable loading indicator
// Used for action states (registering, saving, etc.)

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
}
