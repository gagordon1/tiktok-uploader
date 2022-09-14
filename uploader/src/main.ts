
import puppeteer from 'puppeteer-extra';
import { Browser, ElementHandle, Page, Frame } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs'

const TIKTOKURL = "https://www.tiktok.com/upload"

const TYPE_DELAY = 30

const WAIT_DELAY = 5000

//TIKTOK UPLOAD PAGE-SPECIFIC VARIABLES
const captionEntrySelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-2580397738.form-v2 > div.jsx-2580397738.caption-wrap-v2 > div > div:nth-child(1) > div.jsx-1717967343.margin-t-4 > div > div.jsx-1043401508.jsx-723559856.jsx-1657608162.jsx-3887553297.editor > div > div > div";
const videoInputSelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-410242825.uploader > div > input";
const buttonSelector = "#root > div > div > div > div > div.jsx-410242825.contents-v2 > div.jsx-2580397738.form-v2 > div.jsx-2580397738.button-row > div.jsx-2580397738.btn-post > button";
const videoSuccessModalSelector = "#portal-container > div > div > div.jsx-461155393.jsx-3220008684.modal > div.jsx-461155393.jsx-3220008684.modal-title-container > div";
const expectedSuccessMessage = "Your video is being uploaded to TikTok!"

function delay(ms: number) : Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const visitTikTok = async(page : Page) =>{
    console.log("navigating to tiktok")
    await page.goto(TIKTOKURL);
    await delay(WAIT_DELAY);
    await page.pdf({path : './screenshots/tiktok.pdf'})
}

const setCookies= async (page : Page, cookiesFile : string) =>{
    console.log("setting cookies")
    const cookiesString = await fs.readFileSync(cookiesFile).toString();
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

}

const initializePage = async(page : Page) => {
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

async function setCaption(iframe :Frame, caption : string){
    
    await iframe.type(captionEntrySelector, caption, {
        delay : TYPE_DELAY
    })
}

async function uploadVideo(iframe : Frame, videoFile : string){
    
    const videoUpload : ElementHandle<HTMLInputElement> | null = await iframe.waitForSelector(videoInputSelector) as ElementHandle<HTMLInputElement>;
    if(videoUpload){
        await videoUpload.uploadFile(videoFile);
    }
    else{
        throw new Error("Could not get video upload element")
    }
}

async function checkSuccess(frame : Frame) : Promise<boolean>{
    let modal : ElementHandle | null = await frame.waitForSelector(videoSuccessModalSelector);
    const videoSuccess : boolean | undefined = await frame.evaluate((selector : string, message : string)=>{
            let div : HTMLDivElement | null = document.querySelector(selector);
            if (div){
                return div.innerText === message;
            }
            return false
        }, videoSuccessModalSelector, expectedSuccessMessage                      
    );
    return videoSuccess;
}

/**
 * Given a frame containing the post button, post the video and wait for a
 * success message
 * @param frame 
 */
const postVideo = async(frame : Frame) =>{
    console.log("posting video");
    const postButton : ElementHandle | null = await frame.waitForSelector(buttonSelector) as ElementHandle;
    if(postButton){
        postButton.click();
        if(await checkSuccess(frame)){
            console.log("video posted")
        }else{
            throw new Error("Error posting video")
        }
    }else{
        throw new Error("Could not click post button")
    }
}

const inputDataAndPost = async (page : Page, videoFile : string, caption : string) => {
    console.log("inputting data");
    const handle : ElementHandle<HTMLIFrameElement> | null = await page.waitForSelector("iframe");
    const iframe : Frame | null  = await handle?.contentFrame() as Frame;
    if (iframe){
        await setCaption(iframe, caption);
        await uploadVideo(iframe, videoFile);
    }else{
        throw new Error("Could not get content frame")
    }
    await page.pdf({path : './screenshots/inputtedData.pdf'});
    await postVideo(iframe);
} 



/**
 * Given cookie file and video file, upload a video to TikTok
 * @param cookiesFile path to cookies file which autheticates a TikTok user
 * @param videoFile path to file to upload
 * @param caption caption for the video can include hashtags
 */
async function uploadToTikTok(cookiesFile : string, videoFile : string, caption : string){
    const browser : Browser = await puppeteer.launch(
        {
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            slowMo: 100
        }
    );
    const page : Page  = await browser.newPage();
    await initializePage(page);
    const recorder : PuppeteerScreenRecorder = new PuppeteerScreenRecorder(page);
    await recorder.start('./screenshots/recording.mp4');
    await setCookies(page, cookiesFile);
    await visitTikTok(page);
    await inputDataAndPost(page, videoFile, caption);
    await recorder.stop()
    await browser.close();
}

/**
 * Run with "npm start"
 */
const run = async() =>{
    const cookiesFile = './config/cookies.json';
    const content_settings_string = fs.readFileSync("config/content_settings.json").toString()
    const content_settings = JSON.parse(content_settings_string);
    const caption = content_settings["caption"]
    const videoFiles : string[] = fs.readdirSync("./content");
    const videoFile = "./content/" + videoFiles.find((val) => val.endsWith(".mp4"));
    await uploadToTikTok(cookiesFile, videoFile, caption);
}

run();
       

