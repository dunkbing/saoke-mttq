import "jsr:@std/dotenv/load";

export const config = {
  dbUrl: Deno.env.get("TURSO_DATABASE_URL")!,
  dbAuthToken: Deno.env.get("TURSO_AUTH_TOKEN")!,
  env: Deno.env.get("ENV")!,
};
