import { statSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

// 要读取的目录
const directoryPath = "./json";

// 递归遍历目录下的所有文件
async function readDirectory(directory) {
  const files = readdirSync(directory);
  const arr = [];
  for (const file of files) {
    const filePath = join(directory, file);
    if (filePath.indexOf(file) !== -1) {
      const stats = statSync(filePath);

      if (stats.isFile()) {
        // 如果是文件，逐行读取
        const data = readFileSync(filePath, "utf8");
        arr.push(JSON.parse(data).title);
        console.log(`Processed file: ${file}`);
      } else if (stats.isDirectory()) {
        // 如果是目录，递归调用
        await readDirectory(filePath);
      }
    }
  }
  // 将每一行作为数组的一个元素
  const jsonData = JSON.stringify(arr);
  writeFileSync(`./json/baseData.json`, jsonData);
}

// 开始读取
(async () => {
  try {
    await readDirectory(directoryPath);
    console.log("All files processed successfully");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
