import json
import youtube_dl
from content_pipeline import ContentPipeline as cp

def download_youtube_video(link:str):
    ydl_opts = {
        'no_check_certificate' : True,
        'output' : 'video.mp4'
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])

if __name__ == "__main__":
    pipeline_filename = "pipeline.json"
    if cp.has_next():
        next_link = cp.get_next()
        print(next_link)
