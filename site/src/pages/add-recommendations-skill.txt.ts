import type { APIRoute } from "astro";
import skill from "../../../.agents/skills/add-recommendations/SKILL.md?raw";
import schema from "../../../.agents/skills/add-recommendations/references/schema.md?raw";

/** Version publique du protocole, servie depuis les sources opérationnelles
    du skill afin que la documentation et l'agent ne divergent jamais. */
const document = `${skill.trim()}\n\n---\n\n${schema.trim()}\n`;

export const GET: APIRoute = () =>
  new Response(document, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
