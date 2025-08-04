interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
}

export default function LoadingOverlay({ 
  isVisible, 
  message = "Looking up book...", 
  submessage = "Fetching metadata from Google Books" 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      data-testid="loading-overlay"
    >
      <div className="bg-white rounded-xl p-6 text-center max-w-sm mx-4">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: 'hsl(211, 82%, 50%)' }}
          data-testid="loading-spinner"
        />
        <h3 className="font-medium text-gray-900 mb-2" data-testid="loading-message">
          {message}
        </h3>
        <p className="text-sm text-gray-500" data-testid="loading-submessage">
          {submessage}
        </p>
      </div>
    </div>
  );
}
