import { type User, type InsertUser, type Book, type InsertBook, type UpdateBook } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book methods
  getBook(id: string): Promise<Book | undefined>;
  getBookByISBN(isbn: string): Promise<Book | undefined>;
  getAllBooks(): Promise<Book[]>;
  getBooksByGenre(genre: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, updates: UpdateBook): Promise<Book | undefined>;
  deleteBook(id: string): Promise<boolean>;
  searchBooks(query: string): Promise<Book[]>;
  getBookStats(): Promise<{
    totalBooks: number;
    genres: number;
    pending: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(book => book.isbn === isbn);
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).sort((a, b) => 
      new Date(b.scannedAt || 0).getTime() - new Date(a.scannedAt || 0).getTime()
    );
  }

  async getBooksByGenre(genre: string): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.genre === genre)
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = {
      id,
      isbn: insertBook.isbn,
      title: insertBook.title || "",
      author: insertBook.author || null,
      publisher: insertBook.publisher || null,
      coverURL: insertBook.coverURL || null,
      genre: insertBook.genre || null,
      categories: insertBook.categories || null,
      scannedAt: new Date(),
      metadataFetched: insertBook.title ? new Date() : null,
      isManualEntry: insertBook.isManualEntry || "false",
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, updates: UpdateBook): Promise<Book | undefined> {
    const existingBook = this.books.get(id);
    if (!existingBook) return undefined;

    const updatedBook: Book = {
      ...existingBook,
      ...updates,
      metadataFetched: updates.title ? new Date() : existingBook.metadataFetched,
    };
    
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: string): Promise<boolean> {
    return this.books.delete(id);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(book =>
      book.title?.toLowerCase().includes(lowerQuery) ||
      book.author?.toLowerCase().includes(lowerQuery) ||
      book.genre?.toLowerCase().includes(lowerQuery) ||
      book.isbn.includes(query)
    );
  }

  async getBookStats(): Promise<{ totalBooks: number; genres: number; pending: number }> {
    const books = Array.from(this.books.values());
    const totalBooks = books.length;
    const genres = new Set(books.filter(b => b.genre).map(b => b.genre)).size;
    const pending = books.filter(b => !b.metadataFetched).length;
    
    return { totalBooks, genres, pending };
  }
}

export const storage = new MemStorage();
