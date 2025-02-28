import { Hono } from "@hono/hono";
import { apiRouter } from "./routes/routes.ts";

const app = new Hono();

// Mount all API routes under /api/v1
app.route("/api/v1", apiRouter);

// Start the server
const port = parseInt(Deno.env.get("PORT") || "3000");
console.log(`🚀 Server running on port ${port}`);

Deno.serve({ port }, app.fetch);