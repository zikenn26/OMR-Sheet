import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertSheetSchema, type InsertSheet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
      correctMarks: 1,
      negativeMarks: 0.33,
      questions: []
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSheet) => {
      // Generate empty questions based on start and end index
      const questions = Array(data.endIndex - data.startIndex + 1)
        .fill(null)
        .map((_, i) => ({
          id: data.startIndex + i,
          correctAnswer: 0
        }));

      const res = await apiRequest("POST", "/api/sheets", {
        ...data,
        questions
      });
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
                Create Test
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}