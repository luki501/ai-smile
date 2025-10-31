"use client";

import { useSymptoms } from "../hooks/useSymptoms";
import { SymptomForm } from "./SymptomForm";
import type { SymptomDto, UpdateSymptomCommand } from "@/types";
import { toast } from "sonner";

interface SymptomEditorProps {
  symptom: SymptomDto;
}

export default function SymptomEditor({ symptom }: SymptomEditorProps) {
  const { updateSymptom, deleteSymptom, isLoading, isDeleting } = useSymptoms();

  const handleSubmit = async (data: UpdateSymptomCommand) => {
    try {
      await updateSymptom(symptom.id.toString(), data);
      toast.success("Symptom updated successfully!");
      window.location.href = "/";
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSymptom(symptom.id.toString());
      toast.success("Symptom deleted successfully!");
      window.location.href = "/"; // Redirect to the symptoms list page
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  return (
    <SymptomForm
      initialData={symptom}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      isLoading={isLoading}
      isDeleting={isDeleting}
      title="Edit Symptom"
      description="Update the details of your symptom entry."
      submitButtonText="Save Changes"
    />
  );
}
