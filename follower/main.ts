import { IgApiClient } from 'instagram-private-api';
import { argv } from "process"


const TEN_MINUTES = 600000
const ONE_HOUR = TEN_MINUTES * 6;

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
 * Strategy which takes a topic and returns a batch of users to follow based on it
 *      current strategy: search tag feed for a topic
 *      for aribitrarily selected posts, randomly choose some users to follow
 * @param ig logged in instagram client
 * @param username user to sample followers from
 * @param n maximum number of users to return
 * @returns list of user ids that are interested in the topic
 */
 async function findUsers(ig : IgApiClient, username : string, n : number) : Promise<number[]>{
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

// /**
//  * Strategy which takes a topic and returns a batch of users to follow based on it
//  *      current strategy: search tag feed for a topic
//  *      for aribitrarily selected posts, randomly choose some users to follow
//  * @param ig logged in instagram client
//  * @param topic topic to guide user search
//  * @param n number of users to return
//  * @returns list of user ids that are interested in the topic
//  */
// async function findUsers(ig : IgApiClient, topic : string, n : number) : Promise<number[]>{
//     const result = await (await ig.feed.tag(topic).items()).map(tag => tag.user.pk)
//     return result;
// }


const run = async (un : string, pw: string, user : string, n : number) =>{
    const ig = new IgApiClient();
    async function login() {
        // basic login-procedure
        console.log(un)
        ig.state.generateDevice(un);
        
        await ig.account.login(un, pw);
    }

    await login();
    const users = await findUsers(ig, user, n)
    console.log(users);
    for (const user of users){
        await followUser(ig, user);
        console.log("following user", user);
        await delay(Math.max(Math.random()*ONE_HOUR, TEN_MINUTES));
    }
}

run(argv[2], argv[3], argv[4], parseInt(argv[5]));

