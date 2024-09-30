import axios from "axios";
import * as cheerio from "cheerio";
import { data } from "./data.js";
import { writeFileSync, readdirSync } from "fs";

async function scrapeYoudao(word) {
  try {
    // Make a GET request to the Youdao dictionary page
    const response = await axios.get(
      `https://youdao.com/result?word=${word}&lang=en`
    );
    const html = response.data;

    // Load the HTML content into cheerio
    const $ = cheerio.load(html);

    // Extract the relevant data
    const result = {
      word: word, // 单词
      phonetic: {
        uk: $(".per-phone:first").text(), // 英式
        us: $(".per-phone:eq(1)").text(), // 美式
      },
      translations: [], // 翻译
      samples: [], // 简明
      exampleType: [], // 类型
      distortion: [], // 变形
      phrase: [], // 短语
      webtranslate: [], // 网络释义
      bilingualexample: [], // 双语例句
      dictphrase: [], // 词典短语
    };

    const translationsItems = $(".fanyi").find("p.trans-content");
    const translations = [];
    translationsItems.each((i, a) => {
      translations.push({
        translation: $(a).text(),
      });
    });
    result.translations = translations;

    const listItems = $(".basic").find("li.word-exp");
    const wordexpItem = $(".basic").find("li.word-wfs-cell-less");
    const samples = [];
    listItems.each((i, a) => {
      samples.push({
        type: $(a).find("span.pos").text(),
        translation: $(a).find("span.trans").text(),
      });
    });
    result.samples = samples;

    const exampleItems = $(".basic .exam_type");
    const exampleType = [];
    exampleItems.each((i, a) => {
      exampleType.push($(a).text());
    });

    result.exampleType = exampleType;

    const distortion = [];
    wordexpItem.each((i, a) => {
      distortion.push({
        name: $(a).find("span.wfs-name").text(),
        transformation: $(a).find("span.transformation").text(),
      });
    });
    result.distortion = distortion;

    const translist = $(".trans-list").find("li.mcols-layout");
    const translistArr = [];
    translist.each((i, a) => {
      const b = $(a).find("div.col2 p:first");
      const c = $(a).find("div.col2 p:eq(1)");
      translistArr.push({
        title: $(b).text(),
        descrition: $(c).text(),
      });
    });
    result.webtranslate = translistArr;

    const webtranslate = $(".webPhrase ul").find("li.mcols-layout");
    const phrase = [];
    webtranslate.each((i, a) => {
      const p = $(a).find("div.col2 p");
      const alink = $(a).find("div.col2 a");
      phrase.push({
        en: alink.text(),
        translation: p.text(),
      });
    });

    result.phrase = phrase;

    const dictphraseel = $(".phrs ul.trans-container").find("li");
    const dictphrase = [];
    dictphraseel.each((i, a) => {
      const p = $(a).find("div.phrs-content span");
      const alink = $(a).find("div.phrs-content a");
      dictphrase.push({
        en: alink.text(),
        translation: p.text(),
      });
    });
    result.dictphrase = dictphrase;

    const mcolslayout = $(".blng_sents_part ul").find("li.mcols-layout");
    const bilingualexample = [];
    mcolslayout.each((i, a) => {
      const b = $(a).find("div.word-exp div.sen-eng");
      const c = $(a).find("div.word-exp div.sen-ch");
      const d = $(a).find("div.word-exp div.secondary");

      bilingualexample.push({
        en: b.text(),
        translation: c.text(),
        source: d.text(),
      });
    });

    result.bilingualexample = bilingualexample;

    // Write the result to a JSON file
    const jsonContent = JSON.stringify(result, null, 2);
    writeFileSync(`./youdao/${word}.json`, jsonContent);

    console.log(
      `Data for "${word}" has been scraped and saved to ${word}.json`
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function getWords(data) {
  const words = [];
  data.forEach((element) => {
    words.push(element.word.toLowerCase());
  });

  return words;
}
const directoryPath = "./youdao";

const words = getWords(data);
const files = readdirSync(directoryPath);
console.log(files.length)
console.log(files)
console.log(words.length)

for (const item of words) {
  if (!files.includes(`${item}.json`)) {
    // await scrapeYoudao(item);
  }
}

// Usage example
// scrapeYoudao("hello");
