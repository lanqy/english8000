import { translate } from "bing-translate-api";

// translate("living", null, 'zh-Hans').then(res => {
//   console.log(res.translation);
// }).catch(err => {
//   console.error(err);
// });

import { readdir, stat, readFile, writeFile } from "fs";
import { join } from "path";

// 要读取的目录
const directoryPath = "./src";

// 存放结果的数组
const resultArray = [];

// 递归遍历目录下的所有文件
function readDirectory(directory) {
  // console.log(directory)
  readdir(directory, (err, files) => {
    // console.log(files)
    if (err) {
      console.error("读取目录失败:", err);
      return;
    }

    files.forEach((file) => {
      const regex = /Section-\d+-\d+/g;

      const filePath = join(directory, file);
      //   console.log('filePath', filePath)
      stat(filePath, (err, stats) => {
        if (err) {
          console.error("获取文件信息失败:", err);
          return;
        }

        if (stats.isFile()) {
          // 如果是文件，逐行读取
          readFile(filePath, "utf8", (err, data) => {
            if (err) {
              console.error("读取文件失败:", err);
              return;
            }
            const title = file.replace(regex, "").replace(".lrc", "");
            const cleanedText = data.replace(/\[.*?\]/g, "").trim();

            const arr = [];

            // 将文本分割成数组
            const textArray = cleanedText.split("\n");

            // textArray.forEach(async (item) => {
            //   const res = await translate(item.trim(), null, "zh-Hans");
            //   console.log(res);
            //   // arr.push({
            //   //   phrases: item.trim(),
            //   //   translation: res.translation,
            //   // });
            // });
            textArray.forEach(async (item) => {
              arr.push(item.trim());
            });

            // // 将每一行作为数组的一个元素
            // const lines = data.split('\r');
            // const l = lines[0];

            const jsonData = JSON.stringify({
              title: title,
              list: arr
            });
            console.log("jsonData", jsonData);
            // resultArray.push(...arr);
            writeFile(`${title}.json`, jsonData, "utf8", function (err) {
              if (err) throw err;
              console.log("complete");
            });
          });
        } else if (stats.isDirectory()) {
          // 如果是目录，递归调用
          readDirectory(filePath);
        }
      });
    });
  });
}

// 开始读取
readDirectory(directoryPath);

// 所有文件读取完成后，将结果数组转换为 JSON 字符串
// 你可以将这个 JSON 字符串写入文件或者进行其他处理
