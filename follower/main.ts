import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import { FollowSettings } from './interfaces';


const FIVE_MINUTES = 300000
const ONE_HALF_HOUR = FIVE_MINUTES * 6;

function delay(ms: number) : Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

/**
 * follows an instagram user if the user is not already followed
 * @param ig logged in api client
 * @param pk id for an instagram user
 * @returns true if successfully followed
 */
async function followUser(ig : IgApiClient, pk : number) : Promise<boolean> {
    const result = await ig.friendship.create(pk);
    if(result.following){
        console.log("followed", pk)
    }else{
        console.log("could not follow", pk)
    };
    return result.following;
}

/**
 * Strategy which takes a user and returns a batch of users to follow based on it
 *      current strategy: pick a user and sample from their followers
 * @param ig logged in instagram client
 * @param n maximum number of users to return
 * @param username user to sample followers from
 * @returns list of user ids that are interested in the topic
 */
 async function findUsersByUsernameFollowers(ig : IgApiClient, n : number, username : string ) : Promise<number[]>{
        const out = []
        const id = await ig.user.getIdByUsername(username)
        const followers = ig.feed.accountFollowers(id);
        let sampleFollowers = (await followers.items()).filter((_, index) => index % 5 == 0);
        for (const user of sampleFollowers){
            out.push(user.pk)
            if(out.length >= n){return out}
        }   
        return out;
    }

/**
 * Strategy which takes a topic and returns a batch of users to follow based on it
 *      current strategy: search tag feed for a topic
 *      for aribitrarily selected posts, randomly choose some users to follow
 * @param ig logged in instagram client
 * @param n number of users to return
 * @param topic topic to guide user search
 * @returns list of user ids that are interested in the topic
 */
async function findUsersByHashTag(ig : IgApiClient, n : number, topic : string) : Promise<number[]>{
    const result = (await ig.feed.tag(topic).items()).map(tag => tag.user.pk)
    return result;
}


const run = async (settings : FollowSettings) =>{
    const ig = new IgApiClient();
    async function login() {
        // basic login-procedure
        console.log(settings.username)
        ig.state.generateDevice(settings.username);
        
        await ig.account.login(settings.username, settings.password);
    }

    await login();
    let users = []
    if (settings.strategy == "findUsersByUsernameFollowers"){
        users = await findUsersByUsernameFollowers(ig, settings.n, settings.strategyParams[0])
    }else if (settings.strategy == "findUsersByHashTagHashtag"){
        users = await findUsersByHashTag(ig, settings.n, settings.strategyParams[0])
    }else{
        throw new Error("Incorrect strategy input setting");
    }
    
    console.log(users);
    for (const user of users){
        await followUser(ig, user);
        console.log("following user", user);
        await delay(Math.max(Math.random()*ONE_HALF_HOUR, FIVE_MINUTES));
    }
}


const followSettings = fs.readFileSync("./config/follow-settings.json").toString();
const settings = JSON.parse(followSettings) as FollowSettings;
console.log(settings);
run(settings);

