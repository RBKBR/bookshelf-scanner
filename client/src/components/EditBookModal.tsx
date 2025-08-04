import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Book, UpdateBook } from "@shared/schema";

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
}

const GENRE_OPTIONS = [
  "Fiction",
  "Science",
  "History",
  "Technology",
  "Biography",
  "Design",
  "Philosophy",
  "Art",
  "Business",
  "Health",
  "Travel",
  "Children",
  "Other"
];

export default function EditBookModal({ isOpen, book, onClose }: EditBookModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    genre: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBookMutation = useMutation({
    mutationFn: async (data: { id: string; updates: UpdateBook }) => {
      const response = await apiRequest("PATCH", `/api/books/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/stats'] });
      toast({
        title: "Book Updated",
        description: "Book information has been successfully updated."
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update book information. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        publisher: book.publisher || "",
        genre: book.genre || "",
      });
    }
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book) return;

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a book title.",
        variant: "destructive"
      });
      return;
    }

    updateBookMutation.mutate({
      id: book.id,
      updates: formData
    });
  };

  const handleClose = () => {
    setFormData({
      title: "",
      author: "",
      publisher: "",
      genre: "",
    });
    onClose();
  };

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons">edit</span>
            <span>Edit Book</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Book preview */}
        <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <img
            src={book.coverURL || "https://via.placeholder.com/60x80?text=Book"}
            alt="Book cover"
            className="w-12 h-16 object-cover rounded shadow-sm"
            data-testid="edit-book-cover"
          />
          <div>
            <h4 className="font-medium text-gray-900" data-testid="edit-book-original-title">
              {book.title || 'Unknown Title'}
            </h4>
            <p className="text-sm text-gray-500" data-testid="edit-book-isbn">
              ISBN: {book.isbn}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-testid="edit-title-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              data-testid="edit-author-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              type="text"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              data-testid="edit-publisher-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
              <SelectTrigger data-testid="edit-genre-select">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRE_OPTIONS.map((genre) => (
                  <SelectItem key={genre} value={genre} data-testid={`genre-option-${genre}`}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={updateBookMutation.isPending}
              data-testid="cancel-edit-book"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateBookMutation.isPending || !formData.title.trim()}
              style={{ backgroundColor: 'hsl(211, 82%, 50%)' }}
              data-testid="submit-edit-book"
            >
              {updateBookMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
