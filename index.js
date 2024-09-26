// import { translate } from "bing-translate-api";

// translate("living", null, 'zh-Hans').then(res => {
//   console.log(res.translation);
// }).catch(err => {
//   console.error(err);
// });

import {
  readdir,
  stat,
  readFile,
  writeFile,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "fs";
import { join } from "path";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 5 });
// 要读取的目录
const directoryPath = "./src";

const translate = async (input) => {
  let a = "";
  if (!input) {
    return "";
  }
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
      const text = match[1];
      console.log(text); // 输出：你们提供气球贷款吗?
      a = text;
    }
    return a;
  } else {
    console.error("未找到匹配的 <ul> 标签");
  }
};

// 递归遍历目录下的所有文件
function readDirectory(directory) {
  // console.log(directory)
  const files = readdirSync(directory);
  console.log(files);

  files.forEach(async (file) => {
    const regex = /Section-\d+-\d+/g;

    const filePath = join(directory, file);
    console.log("filePath", filePath);
    if (filePath.indexOf("Transportation") !== -1) {
      console.log('filePath.indexOf("various")', filePath.indexOf("Expressing Manner"));
      //   console.log('filePath', filePath)
      stat(filePath, async (err, stats) => {
        if (err) {
          console.error("获取文件信息失败:", err);
          return;
        }

        if (stats.isFile()) {
          // 如果是文件，逐行读取
          const data = readFileSync(filePath, "utf8");

          const title = file.replace(regex, "").replace(".lrc", "");
          const cleanedText = data.replace(/\[.*?\]/g, "").trim();

          const arr = [];

          // 将文本分割成数组
          const textArray = cleanedText.split("\n");

          textArray.forEach(async (item) => {
            const b = (await translate(item.trim())) || "";
            item.trim() &&
              arr.push({
                en: item.trim(),
                cn: b,
              });
          });

          // 将每一行作为数组的一个元素
          const a = await translate(title);
          const jsonData = JSON.stringify({
            title: {
              en: title,
              cn: a,
            },
            list: arr,
          });
          // console.log("jsonData", jsonData);
          // resultArray.push(...arr);
          writeFileSync(`./json/${title}.json`, jsonData);
        } else if (stats.isDirectory()) {
          // 如果是目录，递归调用
          readDirectory(filePath);
        }
      });
    }
  });
}

// 开始读取
readDirectory(directoryPath);

// 所有文件读取完成后，将结果数组转换为 JSON 字符串
// 你可以将这个 JSON 字符串写入文件或者进行其他处理
