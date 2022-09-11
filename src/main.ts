
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';

const goToTikTok = async (page : Page) =>{
    await page.goto('https://tiktok.com');
    await page.pdf({path: 'tiktok.pdf'});
}

const login = async(page : Page, account : String, password : String) => {

}



/**
 * Given an account & password, upload a file to TikTok
 * @param account tiktok account
 * @param password tiktok password
 * @param file path to file to upload
 */
async function uploadToTikTok(account : String, password : String, file : String){
    const browser : Browser = await puppeteer.launch();
    const page : Page  = await browser.newPage();
    await goToTikTok(page);
    await login(page, account, password);
    await browser.close();
}


const account : String  = "username";
const password : String  = "password";
const file : String  = "upload_queue/video.mp4";
const run = async() =>{
    await uploadToTikTok(account, password, file);
}

run();
       

