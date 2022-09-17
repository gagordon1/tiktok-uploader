
import puppeteer from 'puppeteer-extra';
import { Browser, ElementHandle, Page, Frame } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs'
/* tslint:disable:no-console */
import { IgApiClient } from 'instagram-private-api';
import { readFile } from 'fs';
import { promisify } from 'util';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);


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

const visitTikTok = async(page : Page) : Promise<void> =>{
    console.log("navigating to tiktok")
    await page.goto(TIKTOKURL);
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

async function setCaption(iframe :Frame, caption : string) : Promise<void>{
    
    await iframe.type(captionEntrySelector, caption, {
        delay : TYPE_DELAY
    })
}

async function uploadVideo(iframe : Frame, videoFile : string) : Promise<void>{
    
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
const postVideo = async(frame : Frame) : Promise<void> =>{
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

const inputDataAndPost = async (page : Page, videoFile : string, caption : string) : Promise<void> => {
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
async function uploadToTikTok(cookiesFile : string, videoFile : string, caption : string) : Promise<void>{
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




//UPLOAD TO REELS FUNCTIONS
const uploadToReels = async (un : string, pw: string, imagePath: string, imageFilename : string,
        videoFile : string, caption : string, lat? : number, long? : number) : Promise<void> =>{
    const readFileAsync = promisify(readFile);

    const ig = new IgApiClient();

    async function login() {
        // basic login-procedure
        ig.state.generateDevice(un);
        await ig.account.login(un, pw);
    }
    console.log("logging in.")
    await login();
    const videoPath = videoFile;
    console.log("getting cover image.")
    await new ffmpeg(videoPath).takeScreenshots({
            count: 1,
            timemarks: [ '2' ], // number of seconds
            filename : imageFilename
        }, imagePath, function() {
            console.log('screenshots were saved')
        }
    );
    let loc = undefined
    if(lat && long){
        console.log("getting location.")
        loc = await ig.search.location(40.7128, 74.0060)
        
    }
    const location = loc? loc[0] : undefined
    
    console.log("publishing video.")
    const publishResult = await ig.publish.video({
        // read the file into a Buffer
        video: await readFileAsync(videoPath),
        coverImage: await readFileAsync(imagePath + "/" + imageFilename),
        caption : caption,
        location : location
    });

    if(publishResult["status"] == "ok"){
        console.log("video posted.")
    }else{
        console.log(publishResult)
    }
}

/**
 * Run with "npm start"
 */
const run = async(settings : ContentSettings) =>{
    
    const content_settings_string = fs.readFileSync("config/content_settings.json").toString()
    const content_settings = JSON.parse(content_settings_string);
    const caption = content_settings.caption
    const videoFiles : string[] = fs.readdirSync("./content");
    const videoFile = "./content/" + videoFiles.find((val) => val.endsWith(".mp4"));
    const destination = content_settings.destination
    if(destination == "tiktok"){
        const cookiesFile = './config/cookies.json';
        await uploadToTikTok(cookiesFile, videoFile, caption);
    }else if (destination == "reels"){
        const imagePath = "cover_images"
        const imageFilename = "thumbnail.jpg"
        await uploadToReels(
            content_settings.ig_username, 
            content_settings.ig_password, 
            imagePath, 
            imageFilename,
            videoFile, 
            caption,
            content_settings.latitude,
            content_settings.longitude
        );
    }
}   

run();
       

