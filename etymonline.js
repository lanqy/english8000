import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { data } from "./data.js";
import { writeFileSync, readdirSync } from "fs";

async function scrapeEtymonline(word) {
  try {
    // Make a GET request to the Youdao dictionary page
    const response = await axios.get(
      `https://www.etymonline.com/cn/word/${word}`
    );
    const html = response.data;

    // Load the HTML content into cheerio
    const $ = cheerio.load(html);

    // Extract the relevant data
    const result = {
      word: word, // 单词
      wordRoot: [],
      relate: [], // 相关词语
    };

    const section_el = $("section.prose-lg");
    const wordRoot = [];

    section_el.each((i, el) => {
      const html = $(el).find("section").html();
      const title = $(el).find("div:eq(0)").html();
      html &&
        wordRoot.push({
          title: title,
          html: html,
        });
    });
    result.wordRoot = wordRoot;

    const relateel = $("div.border-lightGray");
    const relate = [];

    relateel.each((i, el) => {
      const title = $(el).find("span.text-primary").html();
      const html = $(el).find("section.prose-lg").html();
      title &&
        relate.push({
          title: title,
          html: html,
        });
    });
    result.relate = relate;

    // Write the result to a JSON file
    const jsonContent = JSON.stringify(result, null, 2);
    writeFileSync(`./etymonline/${word}.json`, jsonContent);

    console.log(
      `Data for "${word}" has been scraped and saved to ${word}.json`
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function getWords(data) {
    const words = []
    data.forEach(element => {
        words.push(element.word)
    });

    return words;
}


const directoryPath = "./etymonline";

const words = getWords(data);
const files = readdirSync(directoryPath);
console.log(files.length)
console.log(files)
console.log(words.length)

for (const item of words) {
  if (!files.includes(`${item}.json`)) {
    await scrapeEtymonline(item);
  }
}