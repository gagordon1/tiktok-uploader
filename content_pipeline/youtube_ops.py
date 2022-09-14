from sqlite3 import Time
from typing import List, Tuple
from pandas import Timedelta
import requests


YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEO_ENDPOINT = "https://www.googleapis.com/youtube/v3/videos"
YOUTUBE_VIDEO_LINK_BASE = "https://www.youtube.com/watch?v="

def batch_search_videos(keyword : str, api_key : str, page_token : str, max_results : int) -> Tuple[List[dict], str]:
    search_params = {
            "key" : api_key,
            "part" : "snippet",
            "q" : keyword,
            "order" : "viewCount",
            "type" : "video",
            "videoDuration" : "short",
            "maxResults" : max_results
        }
    if page_token:
        search_params["pageToken"] = page_token
    
    result = requests.get(YOUTUBE_SEARCH_ENDPOINT, params=search_params)
    page_token = result.json()["nextPageToken"]
    return result.json()["items"], page_token

def get_duration(video_id : str, api_key : str) -> int:
    details_result = requests.get(YOUTUBE_VIDEO_ENDPOINT, params={
            "part" : "contentDetails",
            "id" : video_id,
            "key" : api_key
        }
    )
    duration : str = details_result.json()["items"][0]["contentDetails"]["duration"]
    dt : Timedelta = Timedelta(duration)
    return int(dt.total_seconds())

def search_youtube(api_key : str, keyword : str, num_results : int, max_duration : int = 60) -> List[str]:
    """Searches youtube given a keyword, desired result size and max duration

    Args:
        keyword (str): keyword to search youtube with
        num_results (int): number of desired results
        api_key (str): youtube api key
        max_duration (int, optional): maximum duration for returned videos (seconds), 
            maximum is 240, Defaults to 60. 
        
    Returns:
        list[str]: list of youtube links
    """
    out = []
    videos = None
    page_token = None
    while len(out) < num_results and (not videos or len(videos) > 0):
        videos, page_token = batch_search_videos(keyword, api_key, page_token, min(50, max(5, num_results - len(out)) ))
        for vid in videos:
            video_id = vid["id"]["videoId"]
            if get_duration(video_id, api_key) < max_duration:
                out.append(YOUTUBE_VIDEO_LINK_BASE + video_id)
    return out