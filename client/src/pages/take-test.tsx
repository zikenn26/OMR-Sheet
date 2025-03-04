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
    // Initialize empty answers array for all questions
    const initialAnswers = sheet.questions.map(q => ({
      questionId: q.id,
      selectedOption: 0 as 0 | 1 | 2 | 3
    }));
    setAnswers(initialAnswers);
    startMutation.mutate({
      sheetId: sheet.id,
      answers: initialAnswers,
      startTime: new Date()
    });
  };

  const handleAnswer = (questionId: number, selectedOption: number) => {
    setAnswers(prev => 
      prev.map(a => a.questionId === questionId ? { ...a, selectedOption: selectedOption as 0 | 1 | 2 | 3 } : a)
    );
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
            Questions: {sheet.startIndex} - {sheet.endIndex}<br />
            Time limit: {sheet.timeLimit} minutes<br />
            Marks: +{sheet.correctMarks} for correct, -{sheet.negativeMarks} for incorrect
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sheet.questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                Question {question.id}
              </h3>

              <RadioGroup
                value={answers.find(a => a.questionId === question.id)?.selectedOption.toString()}
                onValueChange={(value) => handleAnswer(question.id, Number(value))}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id={`q${question.id}-a`} />
                    <Label htmlFor={`q${question.id}-a`}>A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`q${question.id}-b`} />
                    <Label htmlFor={`q${question.id}-b`}>B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id={`q${question.id}-c`} />
                    <Label htmlFor={`q${question.id}-c`}>C</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id={`q${question.id}-d`} />
                    <Label htmlFor={`q${question.id}-d`}>D</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        className="w-full"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending}
      >
        Submit Test
      </Button>
    </div>
  );
}