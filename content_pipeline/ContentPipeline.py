import json
from content_pipeline.youtube_ops import search_youtube

PIPELINE_FILENAME = "pipeline.json"


class ContentPipeline:
    """ Given a data source and search topic, makes a downloadable pipeline 
        of unique video links to pull from
    """
    def __init__(self, topic  : str, source : str = "youtube"):
        self.set_topic(topic)
        self.set_source(source)
        self.pipeline_file = PIPELINE_FILENAME
        self.set_pipeline_data(
            {
                "links" : []
            }
        )
        

    def set_topic(self, keyword : str):
        """Sets the topic for a content pipeline

        Args:
            keyword (str): search term for the desired content
        """
        self.topic = keyword


    def set_source(self, source : str):
        """Sets the source for a content pipeline

        Args:
            source (str): youtube | TBU
        """
        if source not in {"youtube"}:
            raise Exception("Invalid Content Source Selected.")
        self.source = source

    def has_next(self) -> bool:
        """Checks if the content pipeline is empty

        Returns:
            bool: true if there are links in the pipeline false otherwise
        """
        if len(self.get_pipeline_data()["links"]) > 0: return True
        return False
        

    def get_next(self) -> str: 
        """Gets the next link in the pipeline

        Returns:
            str: next link in the pipeline
        
        Throws:
            Exception: runtime exception if pipeline is empty
        """
        data = self.get_pipeline_data()
        links = data["links"]
        out = links.pop(0)
        data["links"] = links
        self.set_pipeline_data(data)
        return out
    
    def get_pipeline_data(self) -> dict:
        with open(self.pipeline_file, "r") as open_file:
            pipeline = json.load(open_file)
        return pipeline

    def set_pipeline_data(self, data : dict):
        with open(self.pipeline_file, "w") as open_file:
            json.dump(data, open_file)

    def build_pipeline(self, n : int, max_duration : int, api_key : str):
        """If the pipeline has a source and topic, build the pipeline
            valid topic and source must be set.

        Args:
            n (int): number of links to add to the pipeline
            max_duration (int): max duration for videos to be returned
            api_key (str) : api key for specified pipeline
        """
        results = []
        if self.source == "youtube":
            results = search_youtube(api_key, self.topic, n, max_duration)
        self.set_pipeline_data(
            {
                "links" : results
            }
        )

