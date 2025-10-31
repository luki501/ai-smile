"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BODY_PARTS, SYMPTOM_TYPES } from "@/lib/symptoms/symptom.constants";
import { cn, capitalize } from "@/lib/utils";
import type { CreateSymptomCommand, SymptomDto } from "@/types";
import { symptomFormSchema } from "@/lib/symptoms/symptoms.validators";
import type { SymptomFormValues } from "@/lib/symptoms/symptoms.validators";

interface SymptomFormProps {
  initialData?: SymptomDto | null;
  onSubmit: (data: CreateSymptomCommand) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading: boolean;
  isDeleting?: boolean;
  submitButtonText?: string;
  deleteButtonText?: string;
  title: string;
  description: string;
}

export function SymptomForm({
  initialData,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
  submitButtonText = "Save",
  deleteButtonText = "Delete",
  title,
  description,
}: SymptomFormProps) {
  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
      occurred_at: initialData?.occurred_at ? new Date(initialData.occurred_at) : new Date(),
      symptom_type: initialData?.symptom_type ? capitalize(initialData.symptom_type) : "",
      body_part: initialData?.body_part ? capitalize(initialData.body_part) : "",
      notes: initialData?.notes ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const handleFormSubmit = async (values: SymptomFormValues) => {
    const command: CreateSymptomCommand = {
      ...values,
      occurred_at: values.occurred_at.toISOString(),
      symptom_type: values.symptom_type.toLowerCase() as CreateSymptomCommand["symptom_type"],
      body_part: values.body_part.toLowerCase() as CreateSymptomCommand["body_part"],
    };
    try {
      await onSubmit(command);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      // Display server-side errors if any
      form.setError("root.serverError", {
        type: "manual",
        message: (error as Error).message,
      });
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="occurred_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Occurrence</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symptom_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptom Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a symptom type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SYMPTOM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body_part"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Part</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a body part" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BODY_PARTS.map((part) => (
                        <SelectItem key={part} value={part}>
                          {part}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional notes..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errors.root?.serverError && <p className="text-sm text-red-500">{errors.root.serverError.message}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            {initialData && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : deleteButtonText}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the symptom record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async (e) => {
                        e.preventDefault();
                        if (onDelete) {
                          try {
                            await onDelete();
                          } catch (err) {
                            form.setError("root.serverError", {
                              type: "manual",
                              message: (err as Error).message,
                            });
                          }
                        }
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" className="ml-auto" disabled={isLoading}>
              {isLoading ? "Saving..." : submitButtonText}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
