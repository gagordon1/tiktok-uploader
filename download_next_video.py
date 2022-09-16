import uuid
import youtube_dl
from content_pipeline import ContentPipeline as cp
from content_pipeline.tiktok_ops import get_cookie
import json
from TikTokAPI import TikTokAPI

def download_youtube_video(link:str, filename : str):
    ydl_opts = {
        'outtmpl' : filename,
        'format' : 'mp4'
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])

def try_download(source : str, cookie : dict = None):
    """Attempts to download next link or id in the pipeline
        if error downloading, moves to the next, if pipeline empty
        does nothing.

    Args:
        source (str): youtube | tiktok
        cookie (dict): cookie dict as required by TikTokAPI
    """
    if cp.has_next():
        next_link = cp.get_next()
        filename = "content/" + str(uuid.uuid4()) + '.mp4'
        try:
            if source == "youtube":
                download_youtube_video(next_link, filename)
            elif source == "tiktok":
                print("downloading tiktok...")
                api = TikTokAPI(cookie=cookie)
                api.downloadVideoById(next_link, filename)
        except:
            print("Could not download {}".format(next_link))
            try_download(source, cookie)
    else:
        print("pipeline empty")

if __name__ == "__main__":
    pipeline_filename = "pipeline.json"
    with open("./config/content_settings.json") as open_file:
        settings = json.load(open_file)
        cookie = None
        if settings["source"] == "tiktok":
            cookie = get_cookie("./config/cookies.json")
        try_download(settings["source"], cookie)

