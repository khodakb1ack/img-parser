const https = require("https");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { resolve } = require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://yandex.ru/images/search?text=%D0%B1%D0%B0%D0%BB%D0%B0%D0%BA%D0%BB%D0%B0%D0%B2%D0%B0%20%D0%BA%D1%80%D1%8B%D0%BC"
  );

  //await page.waitForSelector('.serp-item__link');
  //await page.click('.serp-item__link')

  await page.setViewport({
    width: 1600,
    height: 900,
  });
  await autoScroll(page);
  //await page.waitForSelector('.MMImage-Origin');
  //await page.screenshot({ path: 'example.png' });

  let images = await page.evaluate(() => {
    let imgElements = document.querySelectorAll(".serp-item__thumb");
    let URLs = Object.values(imgElements).map((imgElement) => ({
      src: imgElement.src,
      alt: imgElement.alt,
    }));
    return URLs;
  });
  console.log(images);
  fs.writeFile("imagesURL.json", JSON.stringify(images, null, " "), (err) => {
    if (err) return err;
  });

  images.forEach((images, index) => {
    const file = fs.createWriteStream(`images/${index}.webp`);
    const request = https.get(images.src, (response) => {
      response.pipe(file);
    });
  });
  await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window, scrollBy(0, distance);
        totalHeight += distance;
        console.log(totalHeight, scrollHeight);
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
