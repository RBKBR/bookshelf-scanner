import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ManualISBNEntryProps {
  onISBNSubmit: (isbn: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ManualISBNEntry({ onISBNSubmit, onClose, isLoading = false }: ManualISBNEntryProps) {
  const [isbn, setIsbn] = useState('');
  const { toast } = useToast();

  const validateISBN = (isbn: string): boolean => {
    // Remove any spaces, hyphens, or other characters
    const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
    
    // Check if it's ISBN-10 or ISBN-13
    if (cleanISBN.length === 10) {
      // ISBN-10 validation
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanISBN[i]) * (10 - i);
      }
      const checkDigit = cleanISBN[9].toUpperCase();
      const calculatedCheck = (11 - (sum % 11)) % 11;
      return checkDigit === (calculatedCheck === 10 ? 'X' : calculatedCheck.toString());
    } else if (cleanISBN.length === 13) {
      // ISBN-13 validation
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanISBN[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const calculatedCheck = (10 - (sum % 10)) % 10;
      return parseInt(cleanISBN[12]) === calculatedCheck;
    }
    
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isbn.trim()) {
      toast({
        title: "ISBN Required",
        description: "Please enter an ISBN number",
        variant: "destructive"
      });
      return;
    }

    const cleanISBN = isbn.replace(/[^0-9X]/gi, '');
    
    if (!validateISBN(cleanISBN)) {
      toast({
        title: "Invalid ISBN",
        description: "Please enter a valid 10 or 13 digit ISBN",
        variant: "destructive"
      });
      return;
    }

    onISBNSubmit(cleanISBN);
  };

  const quickISBNs = [
    { isbn: '9780465050659', title: 'The Design of Everyday Things' },
    { isbn: '9780134685991', title: 'Effective Java' },
    { isbn: '9781617294945', title: 'Spring in Action' },
    { isbn: '9780596517748', title: 'JavaScript: The Good Parts' },
    { isbn: '9780321965515', title: "Don't Make Me Think" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter ISBN Manually</CardTitle>
          <CardDescription>
            Type or paste the 10 or 13 digit ISBN number from your book
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="e.g. 9780465050659"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={isLoading}
                data-testid="isbn-input"
                className="text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter ISBN with or without dashes/spaces
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="submit-isbn"
                className="flex-1"
              >
                {isLoading ? 'Looking up...' : 'Add Book'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                data-testid="cancel-isbn"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Add (Demo Books):</p>
            <div className="space-y-2">
              {quickISBNs.map((book) => (
                <button
                  key={book.isbn}
                  onClick={() => onISBNSubmit(book.isbn)}
                  disabled={isLoading}
                  className="w-full text-left p-2 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
                  data-testid={`quick-isbn-${book.isbn}`}
                >
                  <div className="font-medium">{book.title}</div>
                  <div className="text-gray-500">{book.isbn}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}