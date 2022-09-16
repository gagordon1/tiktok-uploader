from typing import List
import json
from TikTokAPI import TikTokAPI


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

def get_tiktoks(by : str, value : str, n : int, cookie : dict) -> List[str]:
    """Gets tiktoks by topic or account

    Args:
        by (str): hashtag | trending - whether to search by account or a topic
        value (str): value to search by 
            '#string' if hashtag 
            None if searching by trending
        n (int): number of results desired
        cookie (dict): cookie dict for TikTokAPI

    Returns:
        List[str]: array of tiktok ids
    """
    api = TikTokAPI(cookie=cookie)
    try:
        if by == "trending":
            vids = api.getTrending(count=n)
            return [vid["id"] for vid in vids["items"]]
        # elif by == "user":
        #     vids = api.getVideosByUserName(value)
        #     return [vid["id"] for vid in vids["itemList"]]
        elif by == "hashtag":
            vids = api.getVideosByHashTag(value, count=n)
            return [vid["id"] for vid in vids["itemList"]]
    except Exception as e:
        print(e)
    return []
if __name__ == "__main__":
    COOKIE_PATH = "./config/cookies.json"
    toks = get_tiktoks("hashtag", "#ski", 5, get_cookie(COOKIE_PATH))

