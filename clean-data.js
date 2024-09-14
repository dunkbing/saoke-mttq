import fs from "node:fs";
import readline from "node:readline";

const inputFile = "saoke2.txt";
const outputFile = "output.csv";

const readStream = fs.createReadStream(inputFile, { encoding: "utf8" });
const writeStream = fs.createWriteStream(outputFile);

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

writeStream.write("order,datetime,description,value,subname\n");

let currentRecord = {
  order: "",
  date: "",
  time: "",
  description: [],
  value: "",
  subname: "",
};

let lastOrderNumber = 0;

function writeRecord() {
  if (currentRecord.order) {
    const datetime = `${currentRecord.date} ${currentRecord.time}`.trim();
    const description = currentRecord.description.join(" ").trim();
    writeStream.write(
      `"${datetime}","","${currentRecord.value}","${description} ${currentRecord.subname}"\n`,
    );
    currentRecord = {
      order: "",
      date: "",
      time: "",
      description: [],
      value: "",
      subname: "",
    };
  }
}

function isValidOrderNumber(number) {
  return number === lastOrderNumber + 1;
}

rl.on("line", (line) => {
  let trimmedLine = line.trim();
  const orderMatch = trimmedLine.match(/^(\d+)\s/);
  const timeMatch = trimmedLine.match(/^\d{2}:\d{2}:\d{2}/);

  if (orderMatch && isValidOrderNumber(parseInt(orderMatch[1]))) {
    writeRecord();
    lastOrderNumber = parseInt(orderMatch[1]);
    currentRecord.order = orderMatch[1];
    trimmedLine = trimmedLine.replace(currentRecord.order, "").trim();

    const dateMatch = trimmedLine.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) {
      currentRecord.date = dateMatch[1];
      trimmedLine = trimmedLine.replace(currentRecord.date, "").trim();
    }

    const parts = trimmedLine.split(/\s{2,}/);
    currentRecord.description.push(parts[0]);
    const parts2 = parts[1].split(" ");
    currentRecord.value = parts2[0].replace(/\./g, "");
    currentRecord.subname = parts2.slice(1).join(" ");
  } else if (timeMatch) {
    currentRecord.time = timeMatch[0];
    trimmedLine = trimmedLine.replace(currentRecord.time, "").trim();
    const parts = trimmedLine.split(/\s{2,}/);
    if (parts[0]) {
      currentRecord.description.push(parts[0]);
    }
    if (parts[1]) {
      currentRecord.subname += ` ${parts[1]}`;
    }
  } else {
    const parts = trimmedLine.split(/\s{2,}/);
    if (parts[0]) {
      currentRecord.description.push(parts[0]);
    }
    if (parts[1]) {
      currentRecord.subname += ` ${parts[1]}`;
    }
  }
});

rl.on("close", () => {
  writeRecord();
  writeStream.end();
  console.log("CSV file has been created successfully.");
});
