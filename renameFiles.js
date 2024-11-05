import { writeFileSync, readdirSync, renameSync } from "fs";

async function renameFiles(word) {
  try {
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const directoryPath = "./json";

const files = readdirSync(directoryPath);
console.log(files.length)
console.log(files)

for (const item of files) {
   renameSync(`${directoryPath}/${item}`, `${directoryPath}/${item.trim()}`)
}

// Usage example
// scrapeYoudao("hello");
