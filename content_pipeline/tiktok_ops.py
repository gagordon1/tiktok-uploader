from typing import List
import json


COOKIE_PATH = "./config/cookies.json"
def get_verify_fp() -> str:
    with open(COOKIE_PATH) as open_file:
        cookies = json.load(open_file)
        for cookie in cookies:
            if cookie["name"] == "s_v_web_id":
                return cookie["value"]
    raise Exception("Could not find cookie in specified file")

def get_tiktoks(by : str, value : str, n : int) -> List[str]:
    """Gets tiktoks by topic or account

    Args:
        by (str): account | topic - whether to search by account or a topic
        value (str): value to search by
        n (int): number of results desired

    Returns:
        List[str]: array of tiktok ids
    """
    # verify_fp = get_verify_fp()
    # with TikTokApi(custom_verify_fp = verify_fp, use_test_endpoints=True, proxy="http://localhost:8888") as api:
    #     for trending_video in api.search.videos("skiing"):
    #         # Prints the author's username of the trending video.
    #         print(trending_video)
    #         print(trending_video.author.username)
    return []

