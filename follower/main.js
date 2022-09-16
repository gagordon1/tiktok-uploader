"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const instagram_private_api_1 = require("instagram-private-api");
const process_1 = require("process");
const TEN_MINUTES = 600000;
const ONE_HOUR = TEN_MINUTES * 6;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * follows an instagram user if the user is not already followed
 * @param ig logged in api client
 * @param pk id for an instagram user
 * @returns true if successfully followed
 */
function followUser(ig, pk) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield ig.friendship.create(pk);
        if (result.following) {
            console.log("followed", pk);
        }
        else {
            console.log("could not follow", pk);
        }
        ;
        return result.following;
    });
}
/**
 * Strategy which takes a topic and returns a batch of users to follow based on it
 *      current strategy: search tag feed for a topic
 *      for aribitrarily selected posts, randomly choose some users to follow
 * @param ig logged in instagram client
 * @param topic topic to guide user search
 * @param n number of users to return
 * @returns list of user ids that are interested in the topic
 */
function findUsers(ig, topic, n) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (yield ig.feed.tag(topic).items()).map(tag => tag.user.pk);
        return result;
    });
}
const run = (un, pw, topic, n) => __awaiter(void 0, void 0, void 0, function* () {
    const ig = new instagram_private_api_1.IgApiClient();
    function login() {
        return __awaiter(this, void 0, void 0, function* () {
            // basic login-procedure
            console.log(un);
            ig.state.generateDevice(un);
            yield ig.account.login(un, pw);
        });
    }
    yield login();
    const users = yield findUsers(ig, topic, n);
    console.log(users);
    for (const user of users) {
        yield delay(Math.min(Math.random() * ONE_HOUR, TEN_MINUTES));
        console.log("following user", user);
        yield followUser(ig, user);
    }
});
run(process_1.argv[2], process_1.argv[3], process_1.argv[4], parseInt(process_1.argv[5]));
