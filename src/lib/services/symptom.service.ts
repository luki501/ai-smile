import type { SupabaseClient } from "src/db/supabase.client";
import type { CreateSymptomCommand, Symptom, SymptomDto } from "src/types";
import type { GetSymptomsQuery } from "../symptoms/symptoms.validators";

export async function getSymptoms(
  supabase: SupabaseClient,
  userId: string,
  query: GetSymptomsQuery
): Promise<{ data: SymptomDto[]; count: number }> {
  const { offset, limit, occurred_at_gte, occurred_at_lte, symptom_type, body_part } = query;

  let supabaseQuery = supabase
    .from("symptoms")
    .select("id, occurred_at, symptom_type, body_part, notes, created_at", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (occurred_at_gte) {
    supabaseQuery = supabaseQuery.gte("occurred_at", occurred_at_gte);
  }

  if (occurred_at_lte) {
    supabaseQuery = supabaseQuery.lte("occurred_at", occurred_at_lte);
  }

  if (symptom_type) {
    supabaseQuery = supabaseQuery.eq("symptom_type", symptom_type);
  }

  if (body_part) {
    supabaseQuery = supabaseQuery.eq("body_part", body_part);
  }

  const { data, error, count } = await supabaseQuery;

  if (error) {
    console.error("Error fetching symptoms:", error);
    throw new Error("Failed to fetch symptoms from the database.");
  }

  return { data: data || [], count: count || 0 };
}

export async function createSymptom(
  supabase: SupabaseClient,
  userId: string,
  symptomData: CreateSymptomCommand
): Promise<Symptom> {
  const { data, error } = await supabase
    .from("symptoms")
    .insert([{ ...symptomData, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error("Error creating symptom:", error);
    throw new Error("Failed to create symptom in the database.");
  }

  return data;
}
