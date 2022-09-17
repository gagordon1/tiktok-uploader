from typing import List
import json
from content_pipeline.modules.TikTokApi.tiktok import TikTokApi
import random
import string
from content_pipeline.modules.SketchyTikTokApi.get_user_info import get_user_info

PROXY_SERVER = "http://localhost:667"

def get_cookie(cookie_file_path : str) -> dict:
    """Get a TikTokAPI cookie dict given a cookie.json file for
    tiktok.com

    Args:
        cookie_file_path (str): file path to a cookie json file

    Returns:
        dict: cookie dict as specified by the TikTokAPI docs
    """
    with open(cookie_file_path) as open_file:
        cookies = json.load(open_file)
        cookie = {}
        for c in cookies:
            if c["name"] == "s_v_web_id":
                cookie["s_v_web_id"] = c["value"]
            elif c["name"] == "ttwid":
                cookie["tt_webid"] = c["value"]
        return cookie

def get_tiktoks(strategy : str, value : str, n : int, cookie : dict) -> List[str]:
    """Gets tiktoks by topic or account

    Args:
        strategy (str): hashtag | trending - whether to search by account or a topic
        value (str): value to search by 
            '#string' if hashtag 
            None if searching by trending
        n (int): number of results desired
        cookie (dict): cookie dict for TikTokAPI

    Returns:
        List[str]: array of tiktok ids
    """
    # api = TikTokApi(cookie=cookie)
    # try:
    # if strategy == "trending":
    #     vids = api.getTrending(count=n)
    #     return [vid["id"] for vid in vids["items"]]
    if strategy == "user-likes":
        with TikTokApi(
                custom_verify_fp="".join(random.choice(string.digits) for num in range(19)),
                proxy=PROXY_SERVER
            ) as api:
            value = "therock"
            user_info = get_user_info(value)
            uid = user_info["users"][value]['id']
            sec_uid = user_info["users"][value]["secUid"]
 
            user = api.user(user_id = uid, sec_uid=sec_uid)
            out = [vid for vid in user.videos(count = n)]
            print(out)
        # for vid in out:
        #     print(vid)
        # vids = api.getLikesByUserName(value)
        # print(vids)
        # return [vid["id"] for vid in vids["itemList"]]
    # elif strategy == "hashtag":
    #     vids = api.getVideosByHashTag(value, count=n)
    #     return [vid["id"] for vid in vids["itemList"]]
    # except Exception as e:
    #     print(e)
    return []
if __name__ == "__main__":
    pass

