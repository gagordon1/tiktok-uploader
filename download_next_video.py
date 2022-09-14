import uuid
import youtube_dl
from content_pipeline import ContentPipeline as cp

def download_youtube_video(link:str, filename : str):
    ydl_opts = {
        'outtmpl' : filename,
        'format' : 'mp4'
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])

if __name__ == "__main__":
    pipeline_filename = "pipeline.json"
    if cp.has_next():
        next_link = cp.get_next()
        filename = "content/" + str(uuid.uuid4()) + '.mp4'
        download_youtube_video(next_link, filename)
    else:
        print("pipeline empty")
