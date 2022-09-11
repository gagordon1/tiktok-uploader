
import puppeteer from 'puppeteer-extra';
import { Browser, Page } from 'puppeteer';
const fs = require('fs').promises;

const TIKTOKURL = "https://www.tiktok.com"

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const visitTikTok = async(page : Page) =>{
    console.log("navigating to tiktok")
    await page.goto(TIKTOKURL,{
            waitUntil: 'networkidle0' 
        }
    );
    
    await page.pdf({path : './screenshots/tiktok.pdf'})
}

const clickUpload = async (page : Page) => {
    console.log("clicking upload")
    await page.evaluate(() => {
        const toClick : HTMLAnchorElement = document.querySelector('[data-e2e="upload-icon"]')?.children[0] as HTMLAnchorElement;
        if (toClick){
            toClick.click();
        }
    })
    await delay(5000);
    await page.pdf({path : './screenshots/uploadPage.pdf'})
}
const setCookies= async (page : Page, cookiesFile : string) =>{
    console.log("setting cookies")
    const cookiesString = await fs.readFile(cookiesFile);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

}

/**
 * Given cookie file and video file, upload a video to TikTok
 * @param cookiesFile path to cookies file which autheticates a TikTok user
 * @param videoFile path to file to upload
 */
async function uploadToTikTok(cookiesFile : string, videoFile : string){
    const browser : Browser = await puppeteer.launch(
        {
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            slowMo: 100,
        }
    );
    const page : Page  = await browser.newPage();
    await setCookies(page, cookiesFile);
    await visitTikTok(page);
    await clickUpload(page);
    await browser.close();
}

/**
 * Run with "npm start username password filepath"
 */
const run = async() =>{
    const cookiesFile = 'src/cookies.json';
    const videoFile = './upload_queue/video.mp4';
    await uploadToTikTok(cookiesFile, videoFile);
}

run();
       

