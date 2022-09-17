export type ContentDestination = "tiktok" | "reels"
export type ContentSource = "youtube" | "tiktok"
export type ContentStrategy = "user-likes" | "search"

export interface ContentSettings{
    /**name of content pipeline */
    name : string,
    /**initial size of pipeline */
    n : number,
    /**strategy for pulling in content : user-likes | search */
    strategy : ContentStrategy,
    /**params for specified strategy */
    strategyParams : string[],
    /**source of content: tiktok | youtube */
    source : ContentSource,
    /**max duration of content in seconds */
    max_duration : number,
    /**where to post content: tiktok | reels */
    destination : ContentDestination,
    /**caption for destination post */
    caption : string,
    /**name of cookies file if pulling from youtube */
    cookies_file? : string,
    /**username for instagram if destination == reels */
    ig_username? : string,
    /**password for instagram if destination == reels */
    ig_password? : string,
    /**latitude of post if destination == reels and location desired */
    latitude? : number,
    /**longitude of post if destination == reels and location desired */
    longitude? : number
}