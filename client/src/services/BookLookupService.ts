import { GenreMapper } from "./GenreMapper";

export interface BookMetadata {
  title?: string;
  author?: string;
  publisher?: string;
  coverURL?: string;
  categories?: string[];
  genre?: string;
}

export class BookLookupService {
  private readonly GOOGLE_BOOKS_API_KEY: string;
  private readonly genreMapper: GenreMapper;

  constructor() {
    this.GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
    this.genreMapper = new GenreMapper();
  }

  async lookupISBN(isbn: string): Promise<BookMetadata | null> {
    // First try Google Books API
    try {
      const googleResult = await this.lookupGoogleBooks(isbn);
      if (googleResult) {
        return googleResult;
      }
    } catch (error) {
      console.warn('Google Books lookup failed:', error);
    }

    // Fallback to Open Library
    try {
      const openLibraryResult = await this.lookupOpenLibrary(isbn);
      return openLibraryResult;
    } catch (error) {
      console.warn('Open Library lookup failed:', error);
      return null;
    }
  }

  private async lookupGoogleBooks(isbn: string): Promise<BookMetadata | null> {
    const apiKey = this.GOOGLE_BOOKS_API_KEY ? `&key=${this.GOOGLE_BOOKS_API_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }

    const volumeInfo = data.items[0].volumeInfo;
    const categories = volumeInfo.categories || [];
    
    return {
      title: volumeInfo.title,
      author: volumeInfo.authors?.join(', '),
      publisher: volumeInfo.publisher,
      coverURL: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      categories,
      genre: this.genreMapper.mapCategoriesToGenre(categories)
    };
  }

  private async lookupOpenLibrary(isbn: string): Promise<BookMetadata | null> {
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Open Library returns different structure, need to fetch work details
    const workKey = data.works?.[0]?.key;
    let workData = null;
    
    if (workKey) {
      try {
        const workResponse = await fetch(`https://openlibrary.org${workKey}.json`);
        if (workResponse.ok) {
          workData = await workResponse.json();
        }
      } catch (error) {
        console.warn('Failed to fetch work details:', error);
      }
    }

    const subjects = workData?.subjects || data.subjects || [];
    const genre = this.genreMapper.mapSubjectsToGenre(subjects);

    return {
      title: data.title,
      author: data.authors?.map((a: any) => a.name || 'Unknown').join(', '),
      publisher: data.publishers?.[0],
      coverURL: data.covers?.[0] ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg` : undefined,
      categories: subjects,
      genre
    };
  }
}
