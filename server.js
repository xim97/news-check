const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = '377542695';
const NEWS_URL = 'https://it.tlscontact.com/by/msq/page.php?pid=news&l=ru';
const DB_FILE = 'last_news.txt';

function readLastNews() {
  return fs.existsSync(DB_FILE) ? fs.readFileSync(DB_FILE, 'utf8') : null;
}

function saveLastNews(content) {
  fs.writeFileSync(DB_FILE, content);
}

async function checkNews() {
  try {
    const res = await axios.get(NEWS_URL);
    const $ = cheerio.load(res.data);

    const title = $('h3').first()
    const titleText = title.text().trim();

    const date = title.parent().next('p').find("u").text().trim();
    const id = `${date}_${titleText}`; // уникальный ID новости

    const last = readLastNews();

    if (id !== last) {
      saveLastNews(id);

      const message = `📰 *Новая новость TLSContact*\n📅 ${date}\n📌 ${titleText}`;

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      console.log('Новость отправлена:', titleText);
    } else {
      console.log('Новых новостей нет.');
    }
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

checkNews(); // запуск сразу