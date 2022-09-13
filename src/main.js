"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs').promises;
const TIKTOKURL = "https://www.tiktok.com/upload";
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const visitTikTok = async (page) => {
    console.log("navigating to tiktok");
    await page.goto(TIKTOKURL);
    await delay(5000);
    await page.pdf({ path: './screenshots/tiktok.pdf' });
};
const setCookies = async (page, cookiesFile) => {
    console.log("setting cookies");
    const cookiesString = await fs.readFile(cookiesFile);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
};
const initializePage = async (page) => {
    var userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });
};
async function setCaption(iframe, caption) {
    const captionEntrySelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-2580397738.form-v2 > div.jsx-2580397738.caption-wrap-v2 > div > div:nth-child(1) > div.jsx-1717967343.margin-t-4 > div > div.jsx-1043401508.jsx-723559856.jsx-1657608162.jsx-3887553297.editor > div > div > div > div > div > div > span";
    await iframe.evaluate((caption, selector) => {
        let capitionSpan = document.querySelector(selector);
        let c = document.createElement("span");
        c.setAttribute("data-text", "true");
        c.innerHTML = caption;
        capitionSpan?.replaceChildren(c);
    }, caption, captionEntrySelector);
}
async function uploadVideo(iframe, videoFile) {
    const inputSelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-410242825.uploader > div > input";
    const videoUpload = await iframe.waitForSelector(inputSelector);
    if (videoUpload) {
        await videoUpload.uploadFile(videoFile);
    }
    else {
        console.log("Could not get element handle");
    }
}
const postVideo = async (frame) => {
    console.log("posting video");
    const buttonSelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-2580397738.form-v2 > div.jsx-2580397738.button-row > div.jsx-2580397738.btn-post > button";
    const button = await frame.waitForSelector(buttonSelector);
    if (button) {
        button.click();
    }
    else {
        console.log("Could not find button");
    }
};
const inputDataAndPost = async (page, videoFile, caption) => {
    console.log("inputting data");
    const handle = await page.waitForSelector("iframe");
    const iframe = await handle?.contentFrame();
    if (iframe) {
        await setCaption(iframe, caption);
        await uploadVideo(iframe, videoFile);
    }
    await page.pdf({ path: './screenshots/inputtedData.pdf' });
    await postVideo(iframe);
};
/**
 * Given cookie file and video file, upload a video to TikTok
 * @param cookiesFile path to cookies file which autheticates a TikTok user
 * @param videoFile path to file to upload
 * @param caption caption for the video can include hashtags
 */
async function uploadToTikTok(cookiesFile, videoFile, caption) {
    const browser = await puppeteer_extra_1.default.launch({
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        slowMo: 100
    });
    const page = await browser.newPage();
    await initializePage(page);
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('./screenshots/recording.mp4');
    await setCookies(page, cookiesFile);
    await visitTikTok(page);
    await inputDataAndPost(page, videoFile, caption);
    await recorder.stop();
    await browser.close();
}
/**
 * Run with "npm start username password filepath"
 */
const run = async () => {
    const cookiesFile = './src/cookies.json';
    const videoFile = './src/upload_queue/video.mp4';
    const caption = "its always sunny in Philly";
    await uploadToTikTok(cookiesFile, videoFile, caption);
};
run();
