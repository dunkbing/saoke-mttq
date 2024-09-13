import fs from "node:fs";
import readline from "node:readline";

const inputFile = "saoke2.txt";
const outputFile = "output.csv";

const writeStream = fs.createWriteStream(outputFile);
writeStream.write("order number,date,description,value\n");

const rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  crlfDelay: Infinity,
});

const records = [];
const values = [];
let currentRecord = null;

rl.on("line", (line) => {
  const orderMatch = line.match(/^(\d+)\s+(\d{2}\/\d{2}\/\d{4})$/);
  const timeMatch = line.match(/^(\d{2}:\d{2}:\d{2})$/);
  const valueMatch = line.match(/^([\d.,]+)$/);

  if (orderMatch) {
    if (currentRecord) {
      records.push(currentRecord);
    }
    currentRecord = {
      orderNumber: orderMatch[1],
      date: orderMatch[2],
      description: "",
    };
  } else if (timeMatch && currentRecord) {
    currentRecord.date += " " + timeMatch[1];
  } else if (valueMatch) {
    values.push(parseFloat(valueMatch[1].replace(/[.,]/g, "")));
  } else if (currentRecord && line.trim() !== "") {
    currentRecord.description += (currentRecord.description ? " " : "") +
      line.trim();
  }
});

rl.on("close", () => {
  if (currentRecord) {
    records.push(currentRecord);
  }

  const mergedRecords = records.map((record, index) => ({
    ...record,
    value: values[index] || "",
  }));

  mergedRecords.forEach((record) => {
    writeStream.write(
      `"${record.date}","","${record.value}","${record.description}"\n`,
    );
  });

  writeStream.end();
  console.log("Data extraction completed. Output saved to", outputFile);
});
