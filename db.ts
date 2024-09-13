import { createClient } from "@libsql/client";
import { config } from "./config.ts";

export const db = createClient({
  url: config.dbUrl,
  authToken: config.dbAuthToken,
});

export const table = "transactions_" + config.env;
