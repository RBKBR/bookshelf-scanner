import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "csv" | "json";

interface ExportFields {
  isbn: boolean;
  title: boolean;
  author: boolean;
  genre: boolean;
  publisher: boolean;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [fields, setFields] = useState<ExportFields>({
    isbn: true,
    title: true,
    author: true,
    genre: true,
    publisher: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  const { data: stats } = useQuery<{ totalBooks: number; genres: number; pending: number }>({
    queryKey: ['/api/books/stats'],
  });

  const handleFieldChange = (field: keyof ExportFields, checked: boolean) => {
    setFields(prev => ({ ...prev, [field]: checked }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (format === "csv") {
        // Download CSV file
        const link = document.createElement('a');
        link.href = '/api/books/export/csv';
        link.download = 'book-catalog.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Complete",
          description: "Your book catalog has been downloaded as CSV file."
        });
      } else {
        // For JSON export, we'd fetch the data and create a blob
        const response = await fetch('/api/books');
        const books = await response.json();
        
        const filteredBooks = books.map((book: any) => {
          const filtered: any = {};
          Object.entries(fields).forEach(([field, include]) => {
            if (include && book[field]) {
              filtered[field] = book[field];
            }
          });
          return filtered;
        });
        
        const blob = new Blob([JSON.stringify(filteredBooks, null, 2)], {
          type: 'application/json'
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'book-catalog.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        toast({
          title: "Export Complete",
          description: "Your book catalog has been downloaded as JSON file."
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export your library. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons">file_download</span>
            <span>Export Library</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Statistics */}
          {stats && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Ready to Export</h4>
                  <span className="text-2xl font-bold" style={{ color: 'hsl(211, 82%, 50%)' }} data-testid="export-count">
                    {stats.totalBooks}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Books with complete metadata</p>
              </CardContent>
            </Card>
          )}
          
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="csv" id="csv" data-testid="format-csv" />
                <Label htmlFor="csv" className="flex-1">
                  <div>
                    <div className="font-medium">CSV Format</div>
                    <div className="text-sm text-gray-500">Spreadsheet compatible format</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="json" id="json" data-testid="format-json" />
                <Label htmlFor="json" className="flex-1">
                  <div>
                    <div className="font-medium">JSON Format</div>
                    <div className="text-sm text-gray-500">Structured data format</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Field Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Fields</Label>
            <div className="space-y-2">
              {Object.entries(fields).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={(checked) => handleFieldChange(field as keyof ExportFields, !!checked)}
                    data-testid={`field-${field}`}
                  />
                  <Label htmlFor={field} className="text-sm capitalize">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isExporting}
              data-testid="cancel-export"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1"
              disabled={isExporting}
              style={{ backgroundColor: 'hsl(123, 43%, 46%)' }}
              data-testid="download-export"
            >
              {isExporting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-sm">download</span>
                  <span>Export</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
