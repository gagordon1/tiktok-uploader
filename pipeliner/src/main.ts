/**build a pipeline by grabbing from an account's likes. */

import puppeteer from 'puppeteer-extra';
import { Browser, ElementHandle, Page, Frame } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs'
import { ContentSettings, Pipeline } from './interfaces';


const TIKTOKURL = "https://www.tiktok.com/"

const TYPE_DELAY = 30

const WAIT_DELAY = 5000

const likedVideosSelector = "#app > div.tiktok-ywuvyb-DivBodyContainer.e1irlpdw0 > div.tiktok-w4ewjk-DivShareLayoutV2.elmjn4l0 > div > div.tiktok-xuns3v-DivShareLayoutMain.ee7zj8d4 > div > p.tiktok-1dcmmcm-PLike.e1jjp0pq2"
const likedListSelector = "#app > div.tiktok-ywuvyb-DivBodyContainer.e1irlpdw0 > div.tiktok-w4ewjk-DivShareLayoutV2.elmjn4l0 > div > div.tiktok-xuns3v-DivShareLayoutMain.ee7zj8d4 > div.tiktok-1qb12g8-DivThreeColumnContainer.eegew6e2 > div"
function delay(ms: number) : Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const switchToLikeTab = async(page : Page) => {
    await page.evaluate((selector) =>{
        let likeTab : HTMLParagraphElement | null = document.querySelector(selector);
        if(likeTab){
            likeTab.click()
        }
        
    }, likedVideosSelector)
    await page.pdf({path : './screenshots/likedVodeos'})
}

const getRecentLikes = async(page : Page) : Promise<string[]> =>{

    const likes = await page.evaluate((selector)=>{
        let out = []
        let likedList : HTMLDivElement | null = document.querySelector(selector)
        if (likedList){
            for (let i  = 0; i< likedList.childElementCount; i++){
                let elt = likedList.children[i].children[0].children[0].children[0].children[0] as HTMLAnchorElement
                out.push(elt.href)
            }
        }
        return out

    }, likedListSelector)
    return likes.map(like => like.split("/").pop() as string);
}

const visitTikTok = async(page : Page, url : string) : Promise<void> =>{
    console.log("navigating to tiktok")
    await page.goto(url);
    await delay(WAIT_DELAY);
    await page.pdf({path : './screenshots/tiktok.pdf'})
}

const setCookies= async (page : Page, cookiesFile : string) : Promise<void> =>{
    console.log("setting cookies")
    const cookiesString = await fs.readFileSync(cookiesFile).toString();
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

}

const initializePage = async(page : Page) : Promise<void> => {
    var userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36'
    await page.setUserAgent(userAgent)

    await page.setViewport({
        width: 1300 + Math.floor(Math.random() * 100),
        height: 800 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false,
    });
}


const run = async(settings : ContentSettings) =>{
    const browser : Browser = await puppeteer.launch(
        {
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            slowMo: 100
        }
    );
    const page : Page  = await browser.newPage();
    await initializePage(page);
    await setCookies(page, settings.cookies_file);
    await visitTikTok(page, TIKTOKURL + "@" + settings.strategyParams[0]);
    await switchToLikeTab(page);
    const recentLikes = await getRecentLikes(page);
    const pipelineFile = settings.pipeline_file;
    const pipelineString = fs.readFileSync(pipelineFile).toString()
    const pipeline = JSON.parse(pipelineString) as Pipeline;
    
    for (const like of recentLikes){
        if (!pipeline.links.find(elt => elt === like)){
            console.log("Adding like", like);
            pipeline.links.push(like);
        }
    }
    fs.writeFileSync(pipelineFile, JSON.stringify(pipeline));
    await browser.close();
}   
const contentSettingsString = fs.readFileSync("config/content-settings.json").toString()
const contentSettings = JSON.parse(contentSettingsString) as ContentSettings;
run(contentSettings);
       

