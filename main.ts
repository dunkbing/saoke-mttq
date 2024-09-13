import { Hono } from "hono";
import { serveStatic } from "hono/deno";

import { db, table } from "./db.ts";

const app = new Hono();

app.get("/", serveStatic({ root: "./public" }));

app.get("/search", async (c) => {
  const query = c.req.query("query");
  if (!query) {
    return c.json({ error: "Query parameter is required" }, 400);
  }
  console.log({ query });

  try {
    const result = await db.execute({
      sql: `SELECT * FROM ${table} WHERE Description LIKE ?`,
      args: [`%${query}%`],
    });

    return c.json(result.rows);
  } catch (error) {
    console.error("Error executing search query:", error);
    return c.json({ error: "An error occurred while searching" }, 500);
  }
});

Deno.serve(app.fetch);
