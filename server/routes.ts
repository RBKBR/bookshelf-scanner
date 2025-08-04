import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, updateBookSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all books
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  // Get books by genre
  app.get("/api/books/genre/:genre", async (req, res) => {
    try {
      const { genre } = req.params;
      const books = await storage.getBooksByGenre(genre);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books by genre" });
    }
  });

  // Search books
  app.get("/api/books/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const books = await storage.searchBooks(q);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to search books" });
    }
  });

  // Get book by ISBN
  app.get("/api/books/isbn/:isbn", async (req, res) => {
    try {
      const { isbn } = req.params;
      const book = await storage.getBookByISBN(isbn);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // Create new book
  app.post("/api/books", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      
      // Check if book with this ISBN already exists
      const existingBook = await storage.getBookByISBN(validatedData.isbn);
      if (existingBook) {
        return res.status(409).json({ message: "Book with this ISBN already exists" });
      }
      
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  // Update book
  app.patch("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateBookSchema.parse(req.body);
      
      const updatedBook = await storage.updateBook(id, validatedData);
      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(updatedBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  // Delete book
  app.delete("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBook(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Get book statistics
  app.get("/api/books/stats", async (req, res) => {
    try {
      const stats = await storage.getBookStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book statistics" });
    }
  });

  // Export books to CSV
  app.get("/api/books/export/csv", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      
      // CSV headers
      const headers = ['ISBN', 'Title', 'Author', 'Genre', 'Publisher'];
      const csvRows = [headers.join(',')];
      
      // Add book data
      books.forEach(book => {
        const row = [
          book.isbn,
          `"${book.title || ''}"`,
          `"${book.author || ''}"`,
          `"${book.genre || ''}"`,
          `"${book.publisher || ''}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="book-catalog.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export books" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
