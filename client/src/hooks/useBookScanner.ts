import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BookLookupService } from "@/services/BookLookupService";
import { validateISBN } from "@/lib/isbnValidator";
import type { Book, InsertBook } from "@shared/schema";

export function useBookScanner() {
  const [scannedBooks, setScannedBooks] = useState<Book[]>([]);
  const queryClient = useQueryClient();
  const lookupService = new BookLookupService();

  const createBookMutation = useMutation({
    mutationFn: async (bookData: InsertBook) => {
      const response = await apiRequest("POST", "/api/books", bookData);
      return response.json();
    },
    onSuccess: (newBook: Book) => {
      setScannedBooks(prev => [newBook, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/stats'] });
    },
  });

  const scanISBN = async (isbn: string): Promise<Book | null> => {
    // Validate ISBN format
    if (!validateISBN(isbn)) {
      throw new Error("Invalid ISBN format");
    }

    // Check if book already exists
    try {
      const response = await fetch(`/api/books/isbn/${isbn}`);
      if (response.ok) {
        const existingBook = await response.json();
        throw new Error("Book already exists in library");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Book already exists in library") {
        throw error;
      }
      // Continue if book doesn't exist (404 expected)
    }

    // Create initial book record
    const initialBook: InsertBook = {
      isbn,
      title: "",
      author: "",
      publisher: "",
      coverURL: "",
      genre: "",
      categories: [],
      isManualEntry: "false"
    };

    // First create the book record
    const book = await createBookMutation.mutateAsync(initialBook);

    // Then lookup metadata in background
    try {
      const metadata = await lookupService.lookupISBN(isbn);
      
      if (metadata) {
        // Update book with metadata
        const updateResponse = await apiRequest("PATCH", `/api/books/${book.id}`, {
          title: metadata.title,
          author: metadata.author,
          publisher: metadata.publisher,
          coverURL: metadata.coverURL,
          genre: metadata.genre,
          categories: metadata.categories
        });
        
        const updatedBook = await updateResponse.json();
        
        // Update local state
        setScannedBooks(prev => 
          prev.map(b => b.id === book.id ? updatedBook : b)
        );
        
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['/api/books'] });
        queryClient.invalidateQueries({ queryKey: ['/api/books/stats'] });
        
        return updatedBook;
      }
    } catch (error) {
      console.warn("Failed to fetch metadata:", error);
      // Book is still created, just without metadata
    }

    return book;
  };

  return {
    scanISBN,
    scannedBooks,
    isLoading: createBookMutation.isPending,
    error: createBookMutation.error
  };
}
