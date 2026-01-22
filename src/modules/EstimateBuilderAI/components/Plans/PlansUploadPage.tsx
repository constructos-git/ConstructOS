// Plans Upload Page - Upload and analyze architectural drawings

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { PlansAnalysisModal } from './PlansAnalysisModal';
import { analyzePlans } from '../../ai/plansAnalyzer';
import type { ExtractedPlansData, CategorizedFiles } from '../../ai/plansAnalyzer';

interface PlansUploadPageProps {
  onBack: () => void;
  onContinue: (extractedData: ExtractedPlansData) => void;
}

const DRAWING_CATEGORIES = [
  { id: 'existing-plans', label: 'Existing Plans', description: 'Floor plans showing the existing property' },
  { id: 'proposed-plans', label: 'Proposed Plans', description: 'Floor plans showing the proposed property' },
  { id: 'existing-elevations', label: 'Existing Elevations', description: 'Drawings showing the existing elevations of the property' },
  { id: 'proposed-elevations', label: 'Proposed Elevations', description: 'Drawings showing the proposed elevations for the property' },
  { id: 'combined', label: 'Combined Drawings', description: 'Existing and proposed plans and elevations' },
  { id: 'specifications', label: 'Drawings Specifications', description: 'Text, section drawings and specifications relating to the project' },
  { id: 'structural', label: 'Structural Calculations and Specifications', description: 'Structural engineers calculations and drawings' },
  { id: 'other', label: 'Other', description: 'All other drawings and specifications that haven\'t got a category' },
] as const;

export function PlansUploadPage({ onBack, onContinue }: PlansUploadPageProps) {
  const [categorizedFiles, setCategorizedFiles] = useState<CategorizedFiles>({
    'existing-plans': [],
    'proposed-plans': [],
    'existing-elevations': [],
    'proposed-elevations': [],
    'combined': [],
    'specifications': [],
    'structural': [],
    'other': [],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPlansData | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Filter for image and PDF files
    const validFiles = selectedFiles.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf'
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were skipped. Please upload only images (JPEG, PNG, WebP) or PDF files.');
    } else {
      setError(null);
    }

    setCategorizedFiles(prev => ({
      ...prev,
      [categoryId]: [...prev[categoryId as keyof CategorizedFiles], ...validFiles],
    }));

    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  }, []);

  const handleRemoveFile = (categoryId: string, index: number) => {
    setCategorizedFiles(prev => ({
      ...prev,
      [categoryId]: prev[categoryId as keyof CategorizedFiles].filter((_, i) => i !== index),
    }));
  };

  const handleAnalyze = async () => {
    // Check if any files have been uploaded
    const totalFiles = Object.values(categorizedFiles).flat().length;
    if (totalFiles === 0) {
      setError('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Analyze the uploaded files with categories
      const data = await analyzePlans(categorizedFiles);
      setExtractedData(data);
      setShowAnalysisModal(true);
    } catch (err) {
      console.error('Failed to analyze plans:', err);
      setError('Failed to analyze plans. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisConfirm = (finalData: ExtractedPlansData) => {
    setShowAnalysisModal(false);
    onContinue(finalData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalFiles = Object.values(categorizedFiles).flat().length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Options
        </Button>
        <h1 className="text-3xl font-bold mb-2">Upload Plans/Drawings</h1>
        <p className="text-muted-foreground">
          Upload architectural drawings, plans, or specifications by category. Our AI will extract all relevant information.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Category Upload Areas */}
      <div className="space-y-6">
        {DRAWING_CATEGORIES.map((category) => {
          const categoryFiles = categorizedFiles[category.id as keyof CategorizedFiles];
          const uploadId = `file-upload-${category.id}`;

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg">{category.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id={uploadId}
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileSelect(category.id, e)}
                    className="hidden"
                  />
                  <label
                    htmlFor={uploadId}
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">
                        Images (JPEG, PNG, WebP) or PDF files
                      </p>
                    </div>
                  </label>
                </div>

                {/* Uploaded Files List for this Category */}
                {categoryFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      Uploaded Files ({categoryFiles.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categoryFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {file.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(category.id, index)}
                            className="flex-shrink-0 h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analyze Button */}
      <div className="mt-6 flex gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={totalFiles === 0 || isAnalyzing}
          className="flex-1"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Plans...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Analyze Plans ({totalFiles} {totalFiles === 1 ? 'file' : 'files'})
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>What gets extracted:</strong> Dimensions, footing types and sizes, wall construction, 
          roof details, insulation specifications, cavity sizes, and more. You'll be able to review 
          and edit all extracted information before proceeding.
        </p>
      </div>

      {/* Analysis Modal */}
      {extractedData && (
        <PlansAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          extractedData={extractedData}
          onConfirm={handleAnalysisConfirm}
        />
      )}
    </div>
  );
}
