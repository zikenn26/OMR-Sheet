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
import { Trash2, Plus, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Create() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertSheet>({
    resolver: zodResolver(insertSheetSchema),
    defaultValues: {
      title: "",
      description: "",
      startIndex: 1,
      endIndex: 10,
      timeLimit: 30,
      questions: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        correctAnswer: 0
      }))
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

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))} className="space-y-6">
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
                          onChange={(e) => {
                            const value = +e.target.value;
                            field.onChange(value);
                            handleRangeChange(value, form.getValues("endIndex"));
                          }} 
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
                          onChange={(e) => {
                            const value = +e.target.value;
                            field.onChange(value);
                            handleRangeChange(form.getValues("startIndex"), value);
                          }} 
                          min={1} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div>
                <FormLabel>Answer File (Optional)</FormLabel>
                <div className="mt-2">
                  <Button type="button" variant="outline" className="w-full">
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Questions</h3>
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

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                Create Test
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}