import { Hono } from "hono";
import { serveStatic } from "hono/deno";

import { db, tableFts } from "./db.ts";

const app = new Hono();

app.get("/", serveStatic({ root: "./public" }));

app.get("/search", async (c) => {
  const query = c.req.query("query");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");

  if (!query) {
    return c.json({ error: "Query parameter is required" }, 400);
  }

  if (isNaN(page) || page < 1) {
    return c.json({ error: "Invalid page parameter" }, 400);
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return c.json({ error: "Invalid limit parameter" }, 400);
  }

  const offset = (page - 1) * limit;

  console.log({ query, page, limit, offset });

  try {
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM ${tableFts}
            WHERE ${tableFts} MATCH ?`,
      args: [query],
    });

    const total = countResult.rows[0].total;

    const result = await db.execute({
      sql: `SELECT * FROM ${tableFts}
            WHERE ${tableFts} MATCH ?
            ORDER BY rank
            LIMIT ? OFFSET ?`,
      args: [query, limit, offset],
    });

    const totalPages = Math.ceil(Number(total) / limit);

    return c.json({
      data: result.rows.map((r) => ({
        date: r.TransactionDate,
        value: r.Value,
        desc: r.Description,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error executing search query:", error);
    return c.json({ error: "An error occurred while searching" }, 500);
  }
});

Deno.serve(app.fetch);
