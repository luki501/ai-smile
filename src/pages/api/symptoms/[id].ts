import type { APIContext } from "astro";
import { z } from "zod";
import { updateSymptomSchema } from "@/lib/symptoms/symptoms.validators";
import { SymptomService } from "@/lib/symptoms/symptoms.service";

export const prerender = false;

const idSchema = z.coerce.number().int().positive();

export async function DELETE({ params, locals }: APIContext): Promise<Response> {
  const { user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const validationResult = idSchema.safeParse(params.id);

  if (!validationResult.success) {
    return new Response(JSON.stringify({ errors: validationResult.error.flatten() }), {
      status: 400,
    });
  }

  try {
    const symptomService = new SymptomService(locals.supabase);
    await symptomService.deleteSymptom(validationResult.data, user.id);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Symptom not found")) {
        return new Response(JSON.stringify({ message: error.message }), {
          status: 404,
        });
      }
    }
    console.error("Failed to delete symptom:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
}

export async function PATCH({ params, request, locals }: APIContext): Promise<Response> {
  const session = await locals.safeGetSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const idValidationResult = idSchema.safeParse(params.id);

  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ errors: idValidationResult.error.flatten() }), {
      status: 400,
    });
  }
  const id = idValidationResult.data;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), { status: 400 });
  }

  const validationResult = updateSymptomSchema.safeParse(body);
  if (!validationResult.success) {
    return new Response(JSON.stringify({ errors: validationResult.error.flatten() }), {
      status: 422,
    });
  }

  if (Object.keys(validationResult.data).length === 0) {
    return new Response(JSON.stringify({ message: "At least one field must be provided to update." }), { status: 422 });
  }

  try {
    const symptomService = new SymptomService(locals.supabase);
    const updatedSymptom = await symptomService.updateSymptom(id, session.user.id, validationResult.data);

    if (!updatedSymptom) {
      return new Response(JSON.stringify({ message: "Symptom not found or user does not have permission" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(updatedSymptom), { status: 200 });
  } catch (error) {
    console.error("Failed to update symptom:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
