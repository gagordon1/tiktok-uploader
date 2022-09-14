from content_pipeline.ContentPipeline import build_pipeline
import os
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_SEARCH_API_KEY = os.getenv('YOUTUBE_SEARCH_API_KEY')

if __name__ == "__main__":
    n = 4
    topic = "Family Guy"
    source = "youtube"
    max_duration = 60 #seconds
    
    build_pipeline(topic, source, n, max_duration, YOUTUBE_SEARCH_API_KEY)

