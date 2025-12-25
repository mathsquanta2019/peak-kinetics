export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        <p className="text-sm text-gray-600">Loading messages...</p>
      </div>
    </div>
  )
}
