import youtube_dl
from content_pipeline import ContentPipeline as cp
from content_pipeline.tiktok_ops import get_cookie
import json
from content_pipeline.modules.PyTikTokAPI import TikTokAPI


def download_youtube_video(link: str, filename: str):
    ydl_opts = {
        'outtmpl': filename,
        'format': 'mp4'
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])

def download_tiktok(cookie : dict, id : str, filename : str):
    print("downloading tiktok...")
    api = TikTokAPI(cookie=cookie)
    api.downloadVideoById(id, filename)


def try_download(source: str, pipeline_file: str, pipeline_name: str, cookie: dict = None):
    """Attempts to download next link or id in the pipeline
        if error downloading, moves to the next, if pipeline empty
        does nothing.

    Args:
        source (str): youtube | tiktok
        pipeline_file (str): pipeline filepath
        pipeline_name (str): name of pipeline 
        cookie (dict): cookie dict as required by PyTikTokAPI
    """
    if cp.has_next(pipeline_file):
        next_link = cp.get_next(pipeline_file)
        filename = "content/" + pipeline_name + '.mp4'
        # try:
        if source == "youtube":
            download_youtube_video(next_link, filename)
        elif source == "tiktok":
            id = next_link
            download_tiktok(cookie, id, filename)
        # except:
            # print("Could not download {}".format(next_link))
            # try_download(source, pipeline_file, pipeline_name, cookie)
    else:
        print("pipeline empty")


if __name__ == "__main__":
    config_folder = "./config/"
    config_file = config_folder + "content-settings.json"
    with open(config_file) as open_file:
        settings = json.load(open_file)
        cookie = None
        if settings["source"] == "tiktok":
            cookie = get_cookie(settings["cookies_file"])
        pipeline_name = settings["name"]
        pipeline_path = settings["pipeline_file"]
        try_download(settings["source"], pipeline_path, pipeline_name, cookie)
