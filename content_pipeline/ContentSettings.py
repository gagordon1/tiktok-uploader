from typing import List
from typing_extensions import TypedDict

class ContentSettings(TypedDict):
    #name of content pipeline
    name : str
    #path to the pipeline file 
    pipeline_file : str
    #initial size of pipeline 
    n : int
    #strategy for pulling in content : user-likes | topic | hashtag | trending
    strategy : str
    #params for specified strategy 
    strategyParams : List[str]
    #source of content: tiktok | youtube 
    source : str
    #max duration of content in seconds 
    max_duration : int
    #where to post content: tiktok | reels 
    destination : str
    #caption for destination post
    caption : str
    #name of cookies file (required if source == youtube) 
    cookies_file : str
    #username for instagram (required if destination == reels) 
    ig_username : str
    #password for instagram (required if destination == reels) 
    ig_password : str
    #latitude of post (required if destination == reels and location desired) 
    latitude : float
    #longitude of (required if destination == reels and location desired) 
    longitude : float