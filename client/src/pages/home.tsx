import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import LibraryView from "@/components/LibraryView";
import ManualEntryModal from "@/components/ManualEntryModal";
import EditBookModal from "@/components/EditBookModal";
import ExportModal from "@/components/ExportModal";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "@shared/schema";

type View = "scanner" | "library" | "export" | "settings";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("scanner");
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data: stats } = useQuery<{ totalBooks: number; genres: number; pending: number }>({
    queryKey: ['/api/books/stats'],
  });

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingBook(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen relative font-roboto">
      {/* Top App Bar */}
      <header className="bg-primary text-white px-4 py-3 shadow-md" style={{ backgroundColor: 'hsl(211, 82%, 50%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-2xl">auto_stories</span>
            <h1 className="text-lg font-medium">BookShelf Scanner</h1>
          </div>
          <div className="flex items-center space-x-2">
            {stats && (
              <div className="text-xs bg-primary-dark px-2 py-1 rounded" style={{ backgroundColor: 'hsl(211, 82%, 45%)' }}>
                <span>{stats.totalBooks - stats.pending}</span>/<span>{stats.totalBooks}</span>
              </div>
            )}
            <button className="material-icons text-xl" data-testid="menu-button">more_vert</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {currentView === "scanner" && (
          <BarcodeScanner
            onManualEntry={() => setIsManualEntryOpen(true)}
            onLoading={setIsLoading}
          />
        )}
        
        {currentView === "library" && (
          <LibraryView onEditBook={handleEditBook} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <button
            className={`flex flex-col items-center py-2 px-4 ${
              currentView === "scanner" ? "text-primary" : "text-gray-500"
            }`}
            style={{ color: currentView === "scanner" ? 'hsl(211, 82%, 50%)' : undefined }}
            onClick={() => setCurrentView("scanner")}
            data-testid="nav-scanner"
          >
            <span className="material-icons text-xl">qr_code_scanner</span>
            <span className="text-xs mt-1">Scanner</span>
          </button>
          <button
            className={`flex flex-col items-center py-2 px-4 ${
              currentView === "library" ? "text-primary" : "text-gray-500"
            }`}
            style={{ color: currentView === "library" ? 'hsl(211, 82%, 50%)' : undefined }}
            onClick={() => setCurrentView("library")}
            data-testid="nav-library"
          >
            <span className="material-icons text-xl">library_books</span>
            <span className="text-xs mt-1">Library</span>
          </button>
          <button
            className={`flex flex-col items-center py-2 px-4 ${
              currentView === "export" ? "text-primary" : "text-gray-500"
            }`}
            style={{ color: currentView === "export" ? 'hsl(211, 82%, 50%)' : undefined }}
            onClick={() => setIsExportModalOpen(true)}
            data-testid="nav-export"
          >
            <span className="material-icons text-xl">file_download</span>
            <span className="text-xs mt-1">Export</span>
          </button>
          <button
            className={`flex flex-col items-center py-2 px-4 ${
              currentView === "settings" ? "text-primary" : "text-gray-500"
            }`}
            style={{ color: currentView === "settings" ? 'hsl(211, 82%, 50%)' : undefined }}
            onClick={() => setCurrentView("settings")}
            data-testid="nav-settings"
          >
            <span className="material-icons text-xl">settings</span>
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-20 right-4 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        style={{ backgroundColor: 'hsl(14, 77%, 52%)' }}
        onClick={() => setCurrentView("scanner")}
        data-testid="fab-scan"
      >
        <span className="material-icons text-xl">add</span>
      </button>

      {/* Modals */}
      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        onLoading={setIsLoading}
      />
      
      <EditBookModal
        isOpen={isEditModalOpen}
        book={editingBook}
        onClose={handleCloseEditModal}
      />
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
