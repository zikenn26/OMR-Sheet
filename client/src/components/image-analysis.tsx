import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageAnalysisProps {
  questionId: number;
  onAnalysis: (result: { confidence: number; suggestedAnswer: number }) => void;
}

export default function ImageAnalysis({ questionId, onAnalysis }: ImageAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAnalyzing(true);
      // Mock image upload - in reality would upload image first
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const res = await apiRequest("POST", "/api/analyze-image", { questionId });
      const result = await res.json();
      
      onAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: `Confidence: ${Math.round(result.confidence)}%`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Please try again",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        className="relative"
        disabled={analyzing}
      >
        <input
          type="file"
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={analyzing}
        />
        {analyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span className="ml-2">Upload Image</span>
      </Button>
      
      {analyzing && (
        <Progress value={Math.random() * 100} className="w-[100px]" />
      )}
    </div>
  );
}
