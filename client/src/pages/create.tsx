import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { insertSheetSchema, type InsertSheet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Create() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'setup' | 'answers'>('setup');

  const form = useForm<InsertSheet>({
    resolver: zodResolver(insertSheetSchema),
    defaultValues: {
      title: "",
      description: "",
      startIndex: 1,
      endIndex: 10,
      timeLimit: 30,
      correctMarks: 1,
      negativeMarks: 0.33,
      questions: []
    }
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const handleRangeChange = (start: number, end: number) => {
    const questions = Array(end - start + 1)
      .fill(null)
      .map((_, i) => ({
        id: start + i,
        correctAnswer: 0
      }));
    replace(questions);
  };

  const handleNext = form.handleSubmit((data) => {
    if (step === 'setup') {
      handleRangeChange(data.startIndex, data.endIndex);
      setStep('answers');
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSheet) => {
      const res = await apiRequest("POST", "/api/sheets", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Created",
        description: "Your test has been created successfully"
      });
      setLocation("/");
    }
  });

  if (step === 'setup') {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleNext} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Index</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(+e.target.value)} 
                            min={1} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Index</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(+e.target.value)} 
                            min={1} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} min={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correctMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks for Correct Answer</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} min={0} step={0.01} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="negativeMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Negative Marking</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} min={0} step={0.01} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Next: Provide Answer Key
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Provide Answer Key</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))} className="space-y-6">
              <div>
                <Button type="button" variant="outline" className="w-full mb-6">
                  <input
                    type="file"
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Handle file upload and answer extraction
                        toast({
                          title: "File Upload",
                          description: "Answer extraction from files will be implemented soon"
                        });
                      }
                    }}
                  />
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Answer File
                </Button>

                <p className="text-center text-muted-foreground mb-6">- OR -</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="mb-4">
                          <h4 className="font-medium">Question {field.id}</h4>
                        </div>

                        <FormField
                          control={form.control}
                          name={`questions.${index}.correctAnswer`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Answer</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(val) => field.onChange(+val)}
                                  defaultValue={field.value.toString()}
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="0" id={`q${index}-a`} />
                                      <FormLabel htmlFor={`q${index}-a`}>A</FormLabel>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="1" id={`q${index}-b`} />
                                      <FormLabel htmlFor={`q${index}-b`}>B</FormLabel>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="2" id={`q${index}-c`} />
                                      <FormLabel htmlFor={`q${index}-c`}>C</FormLabel>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="3" id={`q${index}-d`} />
                                      <FormLabel htmlFor={`q${index}-d`}>D</FormLabel>
                                    </div>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep('setup')}>
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  Create Test
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}