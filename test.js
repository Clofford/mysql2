// const chromium = require("chrome-aws-lambda");
// const puppeteer = require("puppeteer-core");
const puppeteer = require("puppeteer");
const mysql = require("mysql2/promise");
require("dotenv").config();
const env = process.env;

/*grobal finish*/
let finish = [];

async function runTest() {
  console.log(`-- start -- ${timestampToTime()}`);

  // 接続先のMySQLサーバ情報
  var mysql_host = env.mysql_host;
  var mysql_user = env.mysql_user;
  var mysql_dbname = env.mysql_dbname;
  var mysql_password = env.mysql_password;

  const SERVICE_ID = "楽天";

  // browser = await puppeteer.launch({
  //   args: chromium.args,
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath: chromium.executablePath,
  //   headless: chromium.headless,
  // });
  let browser = await puppeteer.launch({
    headless: false,
    slowMo: 500,
  });

  let page = await browser.newPage();

  await page.goto("https://ranking.rakuten.co.jp/daily/200534/");
  let titleSelector =
    "#rnkRankingMain > div.rnkRanking_top3box.rnkRanking_topBgColor > div:nth-child(3) > div.rnkRanking_detail > div > div > div > div.rnkRanking_itemName > a";
  let priceSelector =
    "#rnkRankingMain > div.rnkRanking_top3box.rnkRanking_topBgColor > div:nth-child(3) > div:nth-child(2) > div.rnk_fixedRightBox > div.rnkRanking_price";
  let storeSelector =
    "#rnkRankingMain > div.rnkRanking_top3box.rnkRanking_topBgColor > div:nth-child(3) > div.rnkRanking_detail > div > div > div > div.rnkRanking_shop > a";

  const titleData = await page.evaluate((selector) => {
    return document.querySelector(selector).textContent;
  }, titleSelector);

  const priceData = await page.evaluate((selector) => {
    return document.querySelector(selector).textContent;
  }, priceSelector);

  const storeData = await page.evaluate((selector) => {
    return document.querySelector(selector).textContent;
  }, storeSelector);
  const finish = [titleData, priceData, storeData];

  var titleData2 = [];
  var priceData2 = [];
  var storeData2 = [];

  for (let i = 0; i <= 8; i++) {
    let titleSelector2 = `#rnkRankingMain > div:nth-child(${
      i + 3
    }) > div:nth-child(3) > div.rnkRanking_detail > div > div > div > div.rnkRanking_itemName > a`;
    let priceSelector2 = `#rnkRankingMain > div:nth-child(${
      i + 3
    }) > div:nth-child(3) > div:nth-child(2) > div.rnk_fixedRightBox > div.rnkRanking_price`;
    let storeSelector2 = `#rnkRankingMain > div:nth-child(${
      i + 3
    }) > div:nth-child(3) > div.rnkRanking_detail > div > div > div > div.rnkRanking_shop > a`;

    titleData2[i] = await page.evaluate((selector) => {
      return document.querySelector(selector).textContent;
    }, titleSelector2);

    priceData2[i] = await page.evaluate((selector) => {
      return document.querySelector(selector).textContent;
    }, priceSelector2);

    storeData2[i] = await page.evaluate((selector) => {
      return document.querySelector(selector).textContent;
    }, storeSelector2);

    titleData2;
    priceData2;
    storeData2;
  }

  const finish2 = [titleData2, priceData2, storeData2];

  const getDate = new Date();

  //1位と2位以下の変数、配列をひとつにまとめる
  const resultTitle = titleData.concat(titleData2);
  const resultPrice = priceData.concat(priceData2);
  const resultStore = storeData.concat(storeData2);

  const connection = await mysql.createConnection({
    host: mysql_host,
    user: mysql_user,
    password: mysql_password,
    database: mysql_dbname,
  });

  //まとめた配列を利用してDBにデータを入れていく
  var dbInsert = [];
  var resultData = [];
  for (let d = 0; d <= 9; d++) {
    dbInsert = {
      id: null,
      service_id: SERVICE_ID,
      title: resultTitle[d],
      price: resultPrice[d],
      store: resultStore[d],
      GetTime: getDate,
    };
    resultData[d] = await connection.query("INSERT INTO list SET ?", dbInsert);
  }

  console.log(`-- end -- ${timestampToTime()}`);

  connection.end();

  return resultData;
}

// runTest();

const timestampToTime = () => {
  const date = new Date();
  const yyyy = `${date.getFullYear()}`;
  // .slice(-2)で文字列中の末尾の2文字を取得する
  // `0${date.getHoge()}`.slice(-2) と書くことで０埋めをする
  const MM = `0${date.getMonth() + 1}`.slice(-2); // getMonth()の返り値は0が基点
  const dd = `0${date.getDate()}`.slice(-2);
  const HH = `0${date.getHours()}`.slice(-2);
  const mm = `0${date.getMinutes()}`.slice(-2);
  const ss = `0${date.getSeconds()}`.slice(-2);

  return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
};
