import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Sheet, type InsertAttempt, type Answer } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Timer from "@/components/timer";
import ImageAnalysis from "@/components/image-analysis";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TakeTest() {
  const [, params] = useRoute("/test/:id");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [attemptId, setAttemptId] = useState<number>();

  const { data: sheet, isLoading } = useQuery<Sheet>({
    queryKey: [`/api/sheets/${params?.id}`]
  });

  const startMutation = useMutation({
    mutationFn: async (data: InsertAttempt) => {
      const res = await apiRequest("POST", "/api/attempts", data);
      return res.json();
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) return;
      const res = await apiRequest("PATCH", `/api/attempts/${attemptId}`, {
        answers
      });
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/results/${data.id}`);
    }
  });

  const handleStart = () => {
    if (!sheet) return;
    startMutation.mutate({
      sheetId: sheet.id,
      answers: [],
      startTime: new Date()
    });
  };

  const handleAnswer = (questionId: number, selectedOption: number) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing !== -1) {
        return prev.map(a => 
          a.questionId === questionId ? { ...a, selectedOption } : a
        );
      }
      return [...prev, { questionId, selectedOption }];
    });
  };

  const handleImageAnalysis = (questionId: number, result: { suggestedAnswer: number }) => {
    handleAnswer(questionId, result.suggestedAnswer);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!sheet) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Test not found</p>
        </CardContent>
      </Card>
    );
  }

  if (!attemptId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{sheet.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{sheet.description}</p>
          <p className="text-muted-foreground mb-6">
            Time limit: {sheet.timeLimit} minutes
          </p>
          <Button onClick={handleStart}>Start Test</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{sheet.title}</h1>
        <Timer
          timeLimit={sheet.timeLimit}
          onTimeUp={() => submitMutation.mutate()}
        />
      </div>

      {sheet.questions.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">
                Question {index + 1}: {question.text}
              </h3>
              <ImageAnalysis
                questionId={question.id}
                onAnalysis={(result) => handleImageAnalysis(question.id, result)}
              />
            </div>

            <RadioGroup
              value={answers.find(a => a.questionId === question.id)?.selectedOption.toString()}
              onValueChange={(value) => handleAnswer(question.id, Number(value))}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-o${optionIndex}`} />
                  <Label htmlFor={`q${question.id}-o${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Button
        className="w-full"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending || answers.length !== sheet.questions.length}
      >
        Submit Test
      </Button>
    </div>
  );
}