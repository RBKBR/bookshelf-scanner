import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Book } from "@shared/schema";

interface LibraryViewProps {
  onEditBook: (book: Book) => void;
}

export default function LibraryView({ onEditBook }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [expandedGenres, setExpandedGenres] = useState<Set<string>>(new Set());

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });

  const { data: stats } = useQuery<{ totalBooks: number; genres: number; pending: number }>({
    queryKey: ['/api/books/stats'],
  });

  // Filter books based on search and genre
  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchQuery || 
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  // Group books by genre
  const booksByGenre = filteredBooks.reduce((acc, book) => {
    const genre = book.genre || 'Unknown';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  // Get unique genres for filter tabs
  const genres = Array.from(new Set(books.map(book => book.genre).filter(Boolean)));

  const toggleGenreExpansion = (genre: string) => {
    const newExpanded = new Set(expandedGenres);
    if (newExpanded.has(genre)) {
      newExpanded.delete(genre);
    } else {
      newExpanded.add(genre);
    }
    setExpandedGenres(newExpanded);
  };

  const handleDeleteBook = async (bookId: string) => {
    // This would typically show a confirmation dialog
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        // Implementation for delete API call
        console.log('Delete book:', bookId);
      } catch (error) {
        console.error('Failed to delete book:', error);
      }
    }
  };

  return (
    <div className="p-4">
      {/* Search and Filter Controls */}
      <div className="mb-4">
        <div className="relative mb-3">
          <span className="material-icons absolute left-3 top-3 text-gray-500 text-xl">search</span>
          <Input
            type="text"
            placeholder="Search books..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-input"
          />
        </div>
        
        {/* Filter tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={selectedGenre === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(null)}
            className="whitespace-nowrap"
            data-testid="filter-all"
          >
            All Books
          </Button>
          {genres.map((genre, index) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className="whitespace-nowrap"
              data-testid={`filter-genre-${index}`}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Statistics Card */}
      {stats && (
        <Card className="mb-4 text-white" style={{ background: 'linear-gradient(to right, hsl(211, 82%, 50%), hsl(211, 82%, 45%))' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Library Stats</h3>
                <p className="text-sm opacity-90">Track your collection progress</p>
              </div>
              <span className="material-icons text-3xl opacity-75">library_books</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="stats-total">{stats.totalBooks}</div>
                <div className="text-xs opacity-75">Total Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="stats-genres">{stats.genres}</div>
                <div className="text-xs opacity-75">Genres</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="stats-pending">{stats.pending}</div>
                <div className="text-xs opacity-75">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Genre Sections */}
      {Object.entries(booksByGenre).map(([genre, genreBooks]) => (
        <div key={genre} className="mb-4">
          <Collapsible 
            open={expandedGenres.has(genre)}
            onOpenChange={() => toggleGenreExpansion(genre)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-3 h-auto"
                data-testid={`genre-header-${genre}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons" style={{ color: 'hsl(211, 82%, 50%)' }}>
                    {genre === 'Fiction' ? 'menu_book' : 
                     genre === 'Science' ? 'science' : 
                     genre === 'Unknown' ? 'hourglass_empty' : 'category'}
                  </span>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{genre}</h3>
                    <p className="text-sm text-gray-500">{genreBooks.length} books</p>
                  </div>
                </div>
                <span className={`material-icons text-gray-500 transform transition-transform ${
                  expandedGenres.has(genre) ? 'rotate-180' : ''
                }`}>
                  expand_more
                </span>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2 space-y-2">
              {genreBooks.map((book) => (
                <Card key={book.id} className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={book.coverURL || "https://via.placeholder.com/48x64?text=Book"}
                        alt="Book cover"
                        className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                        data-testid={`book-cover-${book.id}`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1" data-testid={`book-title-${book.id}`}>
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1" data-testid={`book-author-${book.id}`}>
                          {book.author}
                        </p>
                        <p className="text-xs text-gray-500 mb-2" data-testid={`book-isbn-${book.id}`}>
                          ISBN: {book.isbn}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: 'hsl(211, 82%, 90%)', 
                              color: 'hsl(211, 82%, 50%)' 
                            }}
                            data-testid={`book-genre-${book.id}`}
                          >
                            {book.genre || 'Unknown'}
                          </span>
                          {book.publisher && (
                            <span className="text-xs text-gray-500" data-testid={`book-publisher-${book.id}`}>
                              {book.publisher}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => onEditBook(book)}
                          data-testid={`edit-book-${book.id}`}
                        >
                          <span className="material-icons text-sm">edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteBook(book.id)}
                          data-testid={`delete-book-${book.id}`}
                        >
                          <span className="material-icons text-sm">delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}

      {/* Empty state */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <span className="material-icons text-6xl text-gray-300 mb-4">library_books</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedGenre 
              ? "Try adjusting your search or filters"
              : "Start scanning books to build your library"
            }
          </p>
        </div>
      )}
    </div>
  );
}
