import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: Deno.env.get("DB_HOST")!,
    port: Number(Deno.env.get("DB_PORT")),
    user: Deno.env.get("DB_USER")!,
    password: Deno.env.get("DB_PASSWORD")!,
    database: Deno.env.get("DB_NAME")!,
    ssl: {
      rejectUnauthorized: true
    }
  },
  // Προαιρετικές ρυθμίσεις
  out: "./drizzle",
  verbose: true,
  strict: true,
} satisfies Config;