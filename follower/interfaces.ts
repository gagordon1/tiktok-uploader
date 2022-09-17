export interface FollowSettings{
    /**strategy to find users by: findUsersByUsernameFollowers | findUsersByHashTag */
    strategy : string,
    /**username of account that will follow users */
    username : string,
    /**password of account that will follow users */
    password : string,
    /**params for the specified strategy */
    strategyParams : string[],
    /**number of users to follow */
    n : number
}