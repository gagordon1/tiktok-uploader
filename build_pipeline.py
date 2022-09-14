from content_pipeline.ContentPipeline import build_pipeline
import os
from dotenv import load_dotenv
import json

load_dotenv()

YOUTUBE_SEARCH_API_KEY = os.getenv('YOUTUBE_SEARCH_API_KEY')

if __name__ == "__main__":
    
    with open("config/content_settings.json", 'r') as open_file:
        pipeline_settings = json.load(open_file)
        topic = pipeline_settings["topic"]
        source = pipeline_settings["source"]
        n = pipeline_settings["n"]
        max_duration = pipeline_settings["max_duration"]
        build_pipeline(topic, source, n, max_duration, YOUTUBE_SEARCH_API_KEY)

