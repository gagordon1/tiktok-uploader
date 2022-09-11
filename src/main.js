"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = __importStar(require("puppeteer"));
const goToTikTok = async (page) => {
    await page.goto('https://tiktok.com');
    await page.pdf({ path: 'tiktok.pdf' });
};
const login = async (page, account, password) => {
};
/**
 * Given an account & password, upload a file to TikTok
 * @param account tiktok account
 * @param password tiktok password
 * @param file path to file to upload
 */
async function uploadToTikTok(account, password, file) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await goToTikTok(page);
    await login(page, account, password);
    await browser.close();
}
const account = "username";
const password = "password";
const file = "upload_queue/video.mp4";
const run = async () => {
    await uploadToTikTok(account, password, file);
};
run();
