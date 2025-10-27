import type { APIContext } from "astro";

export const GET = ({}: APIContext) => {
  return new Response("TEST OK");
};
