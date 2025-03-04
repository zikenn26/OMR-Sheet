import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Sheet, Attempt } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString();
}

function calculateDuration(start: Date | string, end: Date | string) {
  const duration = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function Results() {
  const [, params] = useRoute("/results/:id");

  const { data: attempt, isLoading: loadingAttempt } = useQuery<Attempt>({
    queryKey: [`/api/attempts/${params?.id}`]
  });

  const { data: sheet, isLoading: loadingSheet } = useQuery<Sheet>({
    queryKey: [`/api/sheets/${attempt?.sheetId}`],
    enabled: !!attempt
  });

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

  const totalQuestions = sheet.questions.length;
  const correctAnswers = attempt.answers.filter((answer, index) => 
    answer.selectedOption === sheet.questions[index].correctAnswer
  ).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  const chartData = [
    { name: "Correct", value: correctAnswers, color: "#10B981" },
    { name: "Incorrect", value: totalQuestions - correctAnswers, color: "#EF4444" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{sheet.title}</h1>
          <p className="text-muted-foreground">Test Results</p>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {calculateDuration(attempt.startTime, attempt.endTime!)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold">{score}%</p>
              <p className="text-muted-foreground">
                {correctAnswers} out of {totalQuestions} correct
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Start Time</span>
                  <span>{formatTime(attempt.startTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>End Time</span>
                  <span>{formatTime(attempt.endTime!)}</span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Time Limit</span>
                  <span>{sheet.timeLimit} minutes</span>
                </div>
                <Progress 
                  value={(Date.parse(attempt.endTime!) - Date.parse(attempt.startTime)) / (sheet.timeLimit * 60000) * 100} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sheet.questions.map((question, index) => {
            const userAnswer = attempt.answers[index];
            const isCorrect = userAnswer?.selectedOption === question.correctAnswer;
            const analysis = attempt.imageAnalysis?.find(a => a.questionId === question.id);

            return (
              <div key={question.id} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">
                    Question {index + 1}: {question.text}
                  </h3>
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                </div>

                <div className="grid gap-2 pl-4">
                  {question.options.map((option, optIndex) => {
                    const isUserAnswer = userAnswer?.selectedOption === optIndex;
                    const isCorrectAnswer = question.correctAnswer === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          isCorrectAnswer
                            ? "bg-emerald-50 text-emerald-900"
                            : isUserAnswer && !isCorrectAnswer
                            ? "bg-red-50 text-red-900"
                            : ""
                        }`}
                      >
                        {option}
                      </div>
                    );
                  })}
                </div>

                {analysis && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart2 className="h-4 w-4" />
                    <span>AI Confidence: {Math.round(analysis.confidence)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}