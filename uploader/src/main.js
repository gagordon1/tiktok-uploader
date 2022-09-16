"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_screen_recorder_1 = require("puppeteer-screen-recorder");
const fs_1 = __importDefault(require("fs"));
/* tslint:disable:no-console */
const instagram_private_api_1 = require("instagram-private-api");
const fs_2 = require("fs");
const util_1 = require("util");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const TIKTOKURL = "https://www.tiktok.com/upload";
const TYPE_DELAY = 30;
const WAIT_DELAY = 5000;
//TIKTOK UPLOAD PAGE-SPECIFIC VARIABLES
const captionEntrySelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-2580397738.form-v2 > div.jsx-2580397738.caption-wrap-v2 > div > div:nth-child(1) > div.jsx-1717967343.margin-t-4 > div > div.jsx-1043401508.jsx-723559856.jsx-1657608162.jsx-3887553297.editor > div > div > div";
const videoInputSelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-410242825.uploader > div > input";
const buttonSelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-2580397738.form-v2 > div.jsx-2580397738.button-row > div.jsx-2580397738.btn-post > button";
const videoSuccessModalSelector = "#portal-container > div > div > div.jsx-461155393.jsx-3220008684.modal > div.jsx-461155393.jsx-3220008684.modal-title-container > div";
const expectedSuccessMessage = "Your video is being uploaded to TikTok!";
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const visitTikTok = async (page) => {
    console.log("navigating to tiktok");
    await page.goto(TIKTOKURL);
    await delay(WAIT_DELAY);
    await page.pdf({ path: './screenshots/tiktok.pdf' });
};
const setCookies = async (page, cookiesFile) => {
    console.log("setting cookies");
    const cookiesString = await fs_1.default.readFileSync(cookiesFile).toString();
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
};
const initializePage = async (page) => {
    var userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.setViewport({
        width: 1300 + Math.floor(Math.random() * 100),
        height: 800 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false,
    });
};
async function setCaption(iframe, caption) {
    await iframe.type(captionEntrySelector, caption, {
        delay: TYPE_DELAY
    });
}
async function uploadVideo(iframe, videoFile) {
    const videoUpload = await iframe.waitForSelector(videoInputSelector);
    if (videoUpload) {
        await videoUpload.uploadFile(videoFile);
    }
    else {
        throw new Error("Could not get video upload element");
    }
}
async function checkSuccess(frame) {
    let modal = await frame.waitForSelector(videoSuccessModalSelector);
    const videoSuccess = await frame.evaluate((selector, message) => {
        let div = document.querySelector(selector);
        if (div) {
            return div.innerText === message;
        }
        return false;
    }, videoSuccessModalSelector, expectedSuccessMessage);
    return videoSuccess;
}
/**
 * Given a frame containing the post button, post the video and wait for a
 * success message
 * @param frame
 */
const postVideo = async (frame) => {
    console.log("posting video");
    const postButton = await frame.waitForSelector(buttonSelector);
    if (postButton) {
        postButton.click();
        if (await checkSuccess(frame)) {
            console.log("video posted");
        }
        else {
            throw new Error("Error posting video");
        }
    }
    else {
        throw new Error("Could not click post button");
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
    else {
        throw new Error("Could not get content frame");
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
    const recorder = new puppeteer_screen_recorder_1.PuppeteerScreenRecorder(page);
    await recorder.start('./screenshots/recording.mp4');
    await setCookies(page, cookiesFile);
    await visitTikTok(page);
    await inputDataAndPost(page, videoFile, caption);
    await recorder.stop();
    await browser.close();
}
//UPLOAD TO REELS FUNCTIONS
const uploadToReels = async (un, pw, imagePath, imageFilename, videoFile, caption, lat, long) => {
    const readFileAsync = (0, util_1.promisify)(fs_2.readFile);
    const ig = new instagram_private_api_1.IgApiClient();
    async function login() {
        // basic login-procedure
        ig.state.generateDevice(un);
        await ig.account.login(un, pw);
    }
    console.log("logging in.");
    await login();
    const videoPath = videoFile;
    console.log("getting cover image.");
    await new ffmpeg(videoPath).takeScreenshots({
        count: 1,
        timemarks: ['2'],
        filename: imageFilename
    }, imagePath, function () {
        console.log('screenshots were saved');
    });
    let loc = undefined;
    if (lat && long) {
        console.log("getting location.");
        loc = await ig.search.location(40.7128, 74.0060);
    }
    const location = loc ? loc[0] : undefined;
    console.log("publishing video.");
    const publishResult = await ig.publish.video({
        // read the file into a Buffer
        video: await readFileAsync(videoPath),
        coverImage: await readFileAsync(imagePath + "/" + imageFilename),
        caption: caption,
        location: location
    });
    if (publishResult["status"] == "ok") {
        console.log("video posted.");
    }
    else {
        console.log(publishResult);
    }
};
/**
 * Run with "npm start"
 */
const run = async () => {
    const content_settings_string = fs_1.default.readFileSync("config/content_settings.json").toString();
    const content_settings = JSON.parse(content_settings_string);
    const caption = content_settings.caption;
    const videoFiles = fs_1.default.readdirSync("./content");
    const videoFile = "./content/" + videoFiles.find((val) => val.endsWith(".mp4"));
    const destination = content_settings.destination;
    if (destination == "tiktok") {
        const cookiesFile = './config/cookies.json';
        await uploadToTikTok(cookiesFile, videoFile, caption);
    }
    else if (destination == "reels") {
        const imagePath = "cover_images";
        const imageFilename = "thumbnail.jpg";
        await uploadToReels(content_settings.ig_username, content_settings.ig_password, imagePath, imageFilename, videoFile, caption, content_settings.latitude, content_settings.longitude);
    }
};
run();
