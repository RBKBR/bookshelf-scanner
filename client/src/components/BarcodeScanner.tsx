import { useEffect, useRef, useState } from "react";
import { useBookScanner } from "@/hooks/useBookScanner";
import { useToast } from "@/hooks/use-toast";
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onManualEntry: () => void;
  onLoading: (loading: boolean) => void;
}

export default function BarcodeScanner({ onManualEntry, onLoading }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScannedBook, setLastScannedBook] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<'environment' | 'user'>('environment');
  const [isRealScanning, setIsRealScanning] = useState(false);
  
  const { toast } = useToast();
  const { scanISBN, isLoading } = useBookScanner();
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let scanningInterval: NodeJS.Timeout | null = null;

    const startCamera = async () => {
      try {
        // Stop existing stream if any
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentCamera,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScanning(true);
        }

        // Initialize real barcode scanning with ZXing
        if (!codeReader.current) {
          codeReader.current = new BrowserMultiFormatReader();
        }

        // Start real barcode scanning
        if (videoRef.current && codeReader.current) {
          try {
            await codeReader.current.decodeFromVideoDevice(
              null, // Use default device or selected camera
              videoRef.current,
              (result, error) => {
                if (result) {
                  const scannedText = result.getText();
                  // Check if it looks like an ISBN (10 or 13 digits)
                  const cleanText = scannedText.replace(/[^0-9X]/gi, '');
                  if (cleanText.length === 10 || cleanText.length === 13) {
                    handleBarcodeDetected(cleanText);
                  }
                }
                // Ignore NotFoundException - just keep scanning
                if (error && !(error instanceof NotFoundException)) {
                  console.log('Barcode scanning error:', error);
                }
              }
            );
            setIsRealScanning(true);
          } catch (error) {
            console.error('Failed to start real barcode scanning:', error);
            setIsRealScanning(false);
          }
        }

      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive"
        });
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [currentCamera]);

  const handleBarcodeDetected = async (isbn: string) => {
    try {
      const book = await scanISBN(isbn);
      if (book) {
        setLastScannedBook(book);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Play success sound (if supported)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhSuA');
          audio.volume = 0.3;
          audio.play().catch(() => {}); // Ignore errors if audio fails
        } catch (e) {}
        
        toast({
          title: "Book Scanned Successfully!",
          description: book.title ? `Added "${book.title}" to your library` : `Added book with ISBN ${isbn}`
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Book already exists in library") {
        toast({
          title: "Already in Library",
          description: "This book is already in your collection.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Scan Failed",
          description: "Unable to lookup book metadata. Try manual entry or scan again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    // In production, this would control camera flash
  };

  const switchCamera = async () => {
    try {
      const newCamera = currentCamera === 'environment' ? 'user' : 'environment';
      setCurrentCamera(newCamera);
      
      toast({
        title: "Camera Switched",
        description: `Switched to ${newCamera === 'environment' ? 'back' : 'front'} camera`
      });
    } catch (error) {
      toast({
        title: "Camera Switch Failed",
        description: "Unable to switch camera. Device may not support multiple cameras.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      {/* Camera Preview Container */}
      <div className="relative h-64 bg-gray-900 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          data-testid="camera-preview"
        />
        
        {!isScanning && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <span className="material-icons text-6xl mb-2 opacity-50">videocam</span>
              <p className="text-sm opacity-75">Starting Camera...</p>
            </div>
          </div>
        )}
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-64 h-16 border-2 rounded-lg relative bg-opacity-10" style={{ borderColor: 'hsl(14, 77%, 52%)', backgroundColor: 'hsl(14, 77%, 52%)' }}>
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
              
              {/* Scanning line */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className={`w-full h-0.5 shadow-lg ${isLoading ? 'animate-ping' : 'animate-pulse'}`} style={{ backgroundColor: 'hsl(14, 77%, 52%)' }}></div>
              </div>
            </div>
            
            <p className="text-white text-center mt-4 text-sm font-medium">
              {isLoading ? "🔍 Looking up book..." : "📱 Point camera at ISBN barcode"}
            </p>
            <p className="text-white text-center mt-1 text-xs opacity-75">
              {isLoading ? "Fetching metadata" : `Ready to scan • ${currentCamera === 'environment' ? 'Back' : 'Front'} camera`}
            </p>
          </div>
        </div>
        
        {/* Success feedback */}
        <div
          className={`absolute top-4 left-4 right-4 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            showSuccess ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
          }`}
          style={{ backgroundColor: 'hsl(123, 43%, 46%)' }}
          data-testid="scan-success-message"
        >
          <div className="flex items-center space-x-2">
            <span className="material-icons text-sm">check_circle</span>
            <span className="text-sm font-medium">ISBN Scanned Successfully!</span>
          </div>
        </div>
      </div>
      
      {/* Scanner Controls */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="text-center mb-3">
          <div className="text-sm font-medium text-gray-700 mb-1">Scanner Status</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            isRealScanning ? 'bg-green-100 text-green-800' : 
            isScanning ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isRealScanning ? 'bg-green-500 animate-pulse' : 
              isScanning ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'
            }`}></div>
            {isRealScanning ? 'Real Barcode Scanning Active' : 
             isScanning ? 'Camera Ready' : 'Starting Camera...'}
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {isRealScanning ? "Real barcode scanning active - point at ISBN" : "Real barcode scanning enabled"}
            </p>
            <div className="flex space-x-2 justify-center">
              <button
                className="text-white px-4 py-2 rounded-lg font-medium shadow-lg"
                style={{ backgroundColor: 'hsl(14, 77%, 52%)' }}
                onClick={() => {
                  // Simulate scanning a book for demo
                  const demoISBNs = [
                    '9780465050659', // The Design of Everyday Things
                    '9780134685991', // Effective Java
                    '9781617294945', // Spring in Action
                    '9780596517748', // JavaScript: The Good Parts
                    '9780321965515'  // Don't Make Me Think
                  ];
                  const randomISBN = demoISBNs[Math.floor(Math.random() * demoISBNs.length)];
                  handleBarcodeDetected(randomISBN);
                }}
                disabled={isLoading}
                data-testid="demo-scan-button"
              >
                {isLoading ? "Scanning..." : "Demo Scan"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {isRealScanning ? "Fallback: Use if real scanning doesn't work" : "Simulates finding a random programming book"}
            </p>
            {!isRealScanning && (
              <p className="text-xs text-orange-600 font-medium mt-1">
                ⚠️ Demo mode: Real barcode scanning failed to start
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <button
            className="flex items-center space-x-2 text-gray-500"
            onClick={toggleFlash}
            data-testid="flash-toggle"
          >
            <span className="material-icons">{flashEnabled ? 'flash_on' : 'flash_off'}</span>
            <span className="text-sm">Flash</span>
          </button>
          <button
            className="text-white px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'hsl(14, 77%, 52%)' }}
            onClick={onManualEntry}
            data-testid="manual-entry-button"
          >
            Manual Entry
          </button>
          <button
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={switchCamera}
            data-testid="switch-camera"
          >
            <span className="material-icons">
              {currentCamera === 'environment' ? 'camera_rear' : 'camera_front'}
            </span>
            <span className="text-sm">{currentCamera === 'environment' ? 'Back' : 'Front'}</span>
          </button>
        </div>
        
        {/* Last scanned book preview */}
        {lastScannedBook && (
          <div className="bg-gray-50 rounded-lg p-3" data-testid="last-scanned-book">
            <div className="flex items-center space-x-3">
              <img
                src={lastScannedBook.coverURL || "https://via.placeholder.com/48x64?text=Book"}
                alt="Book cover"
                className="w-12 h-16 object-cover rounded shadow-sm"
                data-testid="book-cover-thumbnail"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate" data-testid="book-title">
                  {lastScannedBook.title}
                </h3>
                <p className="text-xs text-gray-500 truncate" data-testid="book-author">
                  {lastScannedBook.author}
                </p>
                <p className="text-xs font-medium" style={{ color: 'hsl(123, 43%, 46%)' }} data-testid="book-genre">
                  {lastScannedBook.genre || 'Unknown'}
                </p>
              </div>
              <span className="material-icons" style={{ color: 'hsl(123, 43%, 46%)' }}>check_circle</span>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
