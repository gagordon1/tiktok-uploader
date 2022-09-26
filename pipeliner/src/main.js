"use strict";
/**build a pipeline by grabbing from an account's likes. */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const fs_1 = __importDefault(require("fs"));
const TIKTOKURL = "https://www.tiktok.com/";
const TYPE_DELAY = 30;
const WAIT_DELAY = 5000;
const likedVideosSelector = "#app > div.tiktok-ywuvyb-DivBodyContainer.e1irlpdw0 > div.tiktok-w4ewjk-DivShareLayoutV2.elmjn4l0 > div > div.tiktok-xuns3v-DivShareLayoutMain.ee7zj8d4 > div > p.tiktok-1dcmmcm-PLike.e1jjp0pq2";
const likedListSelector = "#app > div.tiktok-ywuvyb-DivBodyContainer.e1irlpdw0 > div.tiktok-w4ewjk-DivShareLayoutV2.elmjn4l0 > div > div.tiktok-xuns3v-DivShareLayoutMain.ee7zj8d4 > div.tiktok-1qb12g8-DivThreeColumnContainer.eegew6e2 > div";
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const switchToLikeTab = (page) => __awaiter(void 0, void 0, void 0, function* () {
    yield page.evaluate((selector) => {
        let likeTab = document.querySelector(selector);
        if (likeTab) {
            likeTab.click();
        }
    }, likedVideosSelector);
    yield page.pdf({ path: './screenshots/likedVodeos' });
});
const getRecentLikes = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const likes = yield page.evaluate((selector) => {
        let out = [];
        let likedList = document.querySelector(selector);
        if (likedList) {
            for (let i = 0; i < likedList.childElementCount; i++) {
                let elt = likedList.children[i].children[0].children[0].children[0].children[0];
                out.push(elt.href);
            }
        }
        return out;
    }, likedListSelector);
    return likes.map(like => like.split("/").pop());
});
const visitTikTok = (page, url) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("navigating to tiktok");
    yield page.goto(url);
    yield delay(WAIT_DELAY);
    yield page.pdf({ path: './screenshots/tiktok.pdf' });
});
const setCookies = (page, cookiesFile) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("setting cookies");
    const cookiesString = fs_1.default.readFileSync(cookiesFile).toString();
    const cookies = JSON.parse(cookiesString);
    yield page.setCookie(...cookies);
});
const initializePage = (page) => __awaiter(void 0, void 0, void 0, function* () {
    var userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    yield page.setUserAgent(userAgent);
    yield page.setViewport({
        width: 1300 + Math.floor(Math.random() * 100),
        height: 800 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false,
    });
});
const run = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_extra_1.default.launch({
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        slowMo: 100
    });
    const page = yield browser.newPage();
    yield initializePage(page);
    yield setCookies(page, settings.cookies_file);
    yield visitTikTok(page, TIKTOKURL + "@" + settings.strategyParams[0]);
    yield switchToLikeTab(page);
    const recentLikes = yield getRecentLikes(page);
    const pipelineFile = settings.pipeline_file;
    const pipelineString = fs_1.default.readFileSync(pipelineFile).toString();
    const pipeline = JSON.parse(pipelineString);
    for (const like of recentLikes) {
        if (!pipeline.posted.find(elt => elt === like)) {
            console.log("Adding like", like);
            pipeline.links.push(like);
            pipeline.posted.push(like);
        }
    }
    fs_1.default.writeFileSync(pipelineFile, JSON.stringify(pipeline));
    yield browser.close();
});
const contentSettingsString = fs_1.default.readFileSync("config/content-settings.json").toString();
const contentSettings = JSON.parse(contentSettingsString);
run(contentSettings);
