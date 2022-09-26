export type ContentDestination = "tiktok" | "reels"
export type ContentSource = "youtube" | "tiktok"
export type ContentStrategy = "user-likes" | "search"

export interface ContentSettings{
    /**name of content pipeline */
    name : string,
    /**path to the pipeline file */
    pipeline_file : string,
    /**initial size of pipeline */
    n : number,
    /**strategy for pulling in content : user-likes | topic */
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
    /**name of cookies file (required if source == tiktok) */
    cookies_file : string,
    /**username for instagram (required if destination == reels) */
    ig_username : string,
    /**password for instagram (required if destination == reels) */
    ig_password : string,
    /**latitude of post (required if destination == reels and location desired) */
    latitude : number,
    /**longitude of (required if destination == reels and location desired) */
    longitude : number
}

export interface Pipeline{
    /**links to be posted */
    links : string[],
    posted : string[]
}