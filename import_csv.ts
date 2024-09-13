import fs from "node:fs";
import readline from "node:readline";

import { db, table } from "./db.ts";

function parseCSVLine(line: string) {
  const values = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());

  return values;
}

export async function importCSV() {
  console.log("importing csv");
  try {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          TransactionDate TEXT,
          Value TEXT,
          Description TEXT
        )
      `);

    const fileStream = fs.createReadStream("transactions.csv");
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isFirstLine = true;
    for await (const line of rl) {
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      if (line.trim()) {
        const [transactionDate, value, description] = parseCSVLine(line);

        const cleanTransactionDate = transactionDate.replace("\n", " ");

        await db.execute({
          sql:
            `INSERT INTO ${table} (TransactionDate, Value, Description) VALUES (?, ?, ?)`,
          args: [cleanTransactionDate, value, description],
        });
        console.log("Inserted", transactionDate);
      }
    }

    console.log("CSV file successfully imported");
  } catch (error) {
    console.error("Error importing CSV:", error);
  }
}

importCSV();
