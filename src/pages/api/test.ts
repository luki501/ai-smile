import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ message: "Not logged in" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
