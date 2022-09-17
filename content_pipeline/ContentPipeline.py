import json
from content_pipeline.youtube_ops import search_youtube
from content_pipeline.tiktok_ops import get_tiktoks, get_cookie
from content_pipeline.ContentSettings import ContentSettings

def get_pipeline_data(pipeline_file : str) -> dict:
    with open(pipeline_file, "r") as open_file:
        pipeline = json.load(open_file)
    return pipeline

def set_pipeline_data(pipeline_file : str, data : dict):
    with open(pipeline_file, "w+") as open_file: #create new pipeline if it doesn't exist
        json.dump(data, open_file)


def has_next(pipeline_file : str) -> bool:
    """Checks if the content pipeline is empty

    Returns:
        bool: true if there are links in the pipeline false otherwise
    """
    if len(get_pipeline_data(pipeline_file)["links"]) > 0: return True
    return False
    

def get_next(pipeline_file : str) -> str: 
    """Gets the next link in the pipeline

    Returns:
        str: next link in the pipeline
    
    Throws:
        Exception: runtime exception if pipeline is empty
    """
    data = get_pipeline_data(pipeline_file)
    links = data["links"]
    out = links.pop(0)
    data["links"] = links
    set_pipeline_data(pipeline_file, data)
    return out

def build_pipeline(
        settings : ContentSettings
    ):
    """Given a source, topic, number of links, max duration and an api key 
        build the pipeline

    Args:
        settings (ContentSettings): settings object
    """
    pipeline = []
    if settings["source"] == "youtube":
        pipeline = search_youtube(
            settings["api_key"], 
            settings["strategyParams"][0], #topic
            settings["n"], 
            settings["max_duration"]
        )
    elif settings["source"] == "tiktok":
        cookie = get_cookie(settings["cookies_file"])
        pipeline = get_tiktoks(
            settings["strategy"], 
            settings["strategyParams"][0], 
            settings["n"], 
            cookie
        )
    else:
        raise Exception("Incorrect inputs")
    
    set_pipeline_data(
        settings["pipeline_file"],
        {
            "links" : pipeline
        }
    )

    

