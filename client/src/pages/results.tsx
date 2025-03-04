import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Sheet, Attempt } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Results() {
  const [, params] = useRoute("/results/:id");
  const { toast } = useToast();
  const [answerKey, setAnswerKey] = useState<number[]>([]);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(true);

  const { data: attempt, isLoading: loadingAttempt } = useQuery<Attempt>({
    queryKey: [`/api/attempts/${params?.id}`]
  });

  const { data: sheet, isLoading: loadingSheet } = useQuery<Sheet>({
    queryKey: [`/api/sheets/${attempt?.sheetId}`],
    enabled: !!attempt
  });

  const handleFileUpload = async (file: File) => {
    // TODO: Implement file upload and answer extraction
    toast({
      title: "File Upload",
      description: "Answer extraction from files will be implemented soon"
    });
  };

  const evaluateTest = () => {
    if (!sheet || !attempt) return;

    let correctCount = 0;
    attempt.answers.forEach((answer, index) => {
      if (answer.selectedOption === answerKey[index]) {
        correctCount++;
      }
    });

    const incorrectCount = attempt.answers.length - correctCount;
    const finalScore = (correctCount * sheet.correctMarks) - (incorrectCount * sheet.negativeMarks);
    setScore(finalScore);
    setIsEvaluated(true);
  };

  if (loadingAttempt || loadingSheet) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attempt || !sheet) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Results not found</p>
        </CardContent>
      </Card>
    );
  }

  if (!isEvaluated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Provide Answer Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {showFileUpload ? (
                <>
                  <Button variant="outline" className="w-full" onClick={() => setShowFileUpload(false)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Answer File
                  </Button>
                  <p className="text-center text-muted-foreground">- OR -</p>
                  <Button className="w-full" onClick={() => setShowFileUpload(false)}>
                    Enter Answers Manually
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {sheet.questions.map((question, index) => (
                      <Card key={question.id}>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-4">
                            Question {question.id}
                          </h3>

                          <RadioGroup
                            value={answerKey[index]?.toString()}
                            onValueChange={(value) => {
                              const newAnswerKey = [...answerKey];
                              newAnswerKey[index] = parseInt(value);
                              setAnswerKey(newAnswerKey);
                            }}
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="0" id={`q${index}-a`} />
                                <Label htmlFor={`q${index}-a`}>A</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id={`q${index}-b`} />
                                <Label htmlFor={`q${index}-b`}>B</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2" id={`q${index}-c`} />
                                <Label htmlFor={`q${index}-c`}>C</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3" id={`q${index}-d`} />
                                <Label htmlFor={`q${index}-d`}>D</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="w-full" onClick={() => setShowFileUpload(true)}>
                      Back
                    </Button>
                    <Button 
                      onClick={evaluateTest}
                      className="w-full"
                      disabled={answerKey.length !== sheet.questions.length}
                    >
                      Evaluate Test
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{score?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
                <p className="text-2xl font-bold">
                  {Math.floor((new Date(attempt.endTime!).getTime() - new Date(attempt.startTime).getTime()) / 60000)}m
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {attempt.answers.map((answer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>Question {sheet.questions[index].id}</span>
                  <div className="flex items-center gap-4">
                    <span>Your answer: {String.fromCharCode(65 + answer.selectedOption)}</span>
                    <span>Correct answer: {String.fromCharCode(65 + answerKey[index])}</span>
                    <span className={answer.selectedOption === answerKey[index] ? "text-green-500" : "text-red-500"}>
                      {answer.selectedOption === answerKey[index] ? `+${sheet.correctMarks}` : `-${sheet.negativeMarks}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}