from dotenv import load_dotenv
import json
from content_pipeline.ContentPipeline import build_pipeline
from content_pipeline.ContentSettings import ContentSettings

load_dotenv()

if __name__ == "__main__":

    with open("config/content-settings.json", 'r') as open_file:
        pipeline_settings : ContentSettings = json.load(open_file)
        build_pipeline(
            pipeline_settings
        )
