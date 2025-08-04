import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookScanner } from "@/hooks/useBookScanner";
import { validateISBN } from "@/lib/isbnValidator";
import { useToast } from "@/hooks/use-toast";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoading: (loading: boolean) => void;
}

export default function ManualEntryModal({ isOpen, onClose, onLoading }: ManualEntryModalProps) {
  const [isbn, setIsbn] = useState("");
  const [isValidISBN, setIsValidISBN] = useState(true);
  
  const { scanISBN, isLoading } = useBookScanner();
  const { toast } = useToast();

  // Update loading state when modal loading changes
  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);

  const handleISBNChange = (value: string) => {
    setIsbn(value);
    if (value) {
      setIsValidISBN(validateISBN(value));
    } else {
      setIsValidISBN(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isbn.trim()) {
      toast({
        title: "ISBN Required",
        description: "Please enter an ISBN to lookup.",
        variant: "destructive"
      });
      return;
    }

    if (!validateISBN(isbn)) {
      toast({
        title: "Invalid ISBN",
        description: "Please enter a valid 10 or 13 digit ISBN.",
        variant: "destructive"
      });
      return;
    }

    try {
      const book = await scanISBN(isbn);
      if (book) {
        toast({
          title: "Book Added",
          description: `${book.title} has been added to your library.`
        });
        setIsbn("");
        onClose();
      }
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description: "Unable to find book data for this ISBN. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setIsbn("");
    setIsValidISBN(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons">edit</span>
            <span>Manual ISBN Entry</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              type="text"
              placeholder="Enter ISBN (10 or 13 digits)"
              value={isbn}
              onChange={(e) => handleISBNChange(e.target.value)}
              className={!isValidISBN ? "border-red-500" : ""}
              data-testid="isbn-input"
            />
            {!isValidISBN && (
              <p className="text-sm text-red-500" data-testid="isbn-error">
                Please enter a valid ISBN (10 or 13 digits)
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
              data-testid="cancel-manual-entry"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !isValidISBN || !isbn.trim()}
              style={{ backgroundColor: 'hsl(211, 82%, 50%)' }}
              data-testid="submit-manual-entry"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Looking up...</span>
                </div>
              ) : (
                "Lookup"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
