import json
from content_pipeline.youtube_ops import search_youtube
from content_pipeline.tiktok_ops import get_tiktoks

PIPELINE_FILENAME = "pipeline.json"


def get_pipeline_data() -> dict:
    with open(PIPELINE_FILENAME, "r") as open_file:
        pipeline = json.load(open_file)
    return pipeline

def set_pipeline_data(data : dict):
    with open(PIPELINE_FILENAME, "w") as open_file:
        json.dump(data, open_file)


def has_next() -> bool:
    """Checks if the content pipeline is empty

    Returns:
        bool: true if there are links in the pipeline false otherwise
    """
    if len(get_pipeline_data()["links"]) > 0: return True
    return False
    

def get_next() -> str: 
    """Gets the next link in the pipeline

    Returns:
        str: next link in the pipeline
    
    Throws:
        Exception: runtime exception if pipeline is empty
    """
    data = get_pipeline_data()
    links = data["links"]
    out = links.pop(0)
    data["links"] = links
    set_pipeline_data(data)
    return out

def build_pipeline(topic : str, source : str, n : int, max_duration : int, api_key : str):
    """Given a source, topic, number of links, max duration and an api key 
        build the pipeline

    Args:
        n (int): number of links to add to the pipeline
        max_duration (int): max duration for videos to be returned
        api_key (str) : api key for specified pipeline
    """
    results = []
    if source == "youtube":
        results = search_youtube(api_key, topic, n, max_duration)
    elif source == "tiktok":
        results = get_tiktoks("topic", topic, n)
    set_pipeline_data(
        {
            "links" : results
        }
    )

    

