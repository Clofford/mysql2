const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const mysql = require("mysql2/promise");

/*grobal finish*/
let finish = [];

exports.handler = async (event, context) => {
  let browser = null;

  // 接続先のMySQLサーバ情報
  var mysql_host = "";
  var mysql_user = "";
  var mysql_dbname = "";
  var mysql_password = "";

  const SERVICE_ID = "楽天";

  browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  let page = await browser.newPage();

  await page.goto(event.url || "https://ranking.rakuten.co.jp/daily/200534/");
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

  // let titleSelector2 = `#rnkRankingMain > div:nth-child(${i}) > div:nth-child(3) > div.rnkRanking_detail > div > div > div > div.rnkRanking_itemName > a`

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

  console.log(finish);
  console.log(finish2);

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

  //最初のデータを挿入
  //const dbInsert ={id:null, service_id: SERVICE_ID, title: titleData, price:priceData, store: storeData, GetTime: getDate };

  //const result = await connection.query("INSERT INTO list SET ?" , dbInsert);

  //2位〜10位を挿入
  // var dbInsert2 =[];
  // var result2 =[];
  // for (let d = 0; d <= 8; d++){
  // dbInsert2 ={id:null, service_id: SERVICE_ID, title: titleData2[d], price:priceData2[d], store: storeData2[d], GetTime: getDate };
  // result2[d] = await connection.query("INSERT INTO list SET ?" , dbInsert2);
  // }

  // await result;
  // await result2;

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

  console.log("-----finish");

  connection.end();

  return resultData;
};

//console.log(resultData);
