import { statSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 5 });
// 要读取的目录
const directoryPath = "./src";

const translate = async (input) => {
  if (!input) {
    return "";
  }
  try {
    const data = await axios.post(
      "https://m.youdao.com/translate",
      {
        inputtext: input,
        type: "AUTO",
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // 正则表达式匹配 <ul> 标签及其内容
    const regex = /<ul id="translateResult">([\s\S]*?)<\/ul>/;
    const match = data.data.match(regex);

    if (match) {
      // 提取 <ul> 标签内的所有内容
      const ulContent = match[1];
      // 再次使用正则表达式提取 <li> 标签内的文本
      const liRegex = /<li>(.*?)<\/li>/g;
      const liMatches = ulContent.matchAll(liRegex);

      for (const match of liMatches) {
        return match[1];
      }
    } else {
      console.error("未找到匹配的 <ul> 标签");
      return "";
    }
  } catch (error) {
    console.error("翻译出错:", error);
    return "";
  }
};

// 递归遍历目录下的所有文件
async function readDirectory(directory) {
  const files = readdirSync(directory);

  for (const file of files) {
    const regex = /Section-\d+-\d+/g;

    const filePath = join(directory, file);
    if (filePath.indexOf(file) !== -1) {
      const stats = statSync(filePath);

      if (stats.isFile()) {
        // 如果是文件，逐行读取
        const data = readFileSync(filePath, "utf8");
        const title = file.replace(regex, "").replace(".lrc", "");
        const cleanedText = data.replace(/\[.*?\]/g, "").trim();
        const arr = [];
        // 将文本分割成数组
        const textArray = cleanedText.split("\n");
        for (const item of textArray) {
          const b = await translate(item.trim() || "");
          if (b) {
            arr.push({
              en: item.trim(),
              cn: b,
            });
          }
        }
        // 将每一行作为数组的一个元素
        const a = await translate(title);
        const jsonData = JSON.stringify({
          title: {
            en: title,
            cn: a,
          },
          list: arr,
        });
        writeFileSync(`./json/${title}.json`, jsonData);
        console.log(`Processed file: ${title}`);
      } else if (stats.isDirectory()) {
        // 如果是目录，递归调用
        await readDirectory(filePath);
      }
    }
  }
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
