from content_pipeline.ContentPipeline import ContentPipeline
import os
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_SEARCH_API_KEY = os.getenv('YOUTUBE_SEARCH_API_KEY')

if __name__ == "__main__":
    n = 5
    topic = "Miata"
    max_duration = 118
    cp = ContentPipeline(topic)
    cp.build_pipeline(n, max_duration, YOUTUBE_SEARCH_API_KEY)
    out = []
    while cp.has_next():
        out.append(cp.get_next())
    print(out)

