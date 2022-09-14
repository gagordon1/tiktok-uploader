
    
from pydoc_data.topics import topics


class ContentPipeline:
    """ Given a data source and search topic, makes a downloadable pipeline 
        of unique video links to pull from
    """
    def __init__(self, topic  : str, source : str = "youtube"):
        self.topic = topic
        self.source = source

    def set_topic(self, keyword : str):
        """Sets the topic for a content pipeline

        Args:
            keyword (str): search term for the desired content
        """
        pass


    def set_source(self, source : str):
        """Sets the source for a content pipeline

        Args:
            source (str): youtube | TBU
        """
        pass

    def has_next(self) -> bool:
        """Checks if the content pipeline is empty

        Returns:
            bool: true if there are links in the pipeline false otherwise
        """
        pass

    def get_next(self) -> str: 
        """Gets the next link in the pipeline

        Returns:
            str: next link in the pipeline
        """
        pass

    def build_pipeline(self, n : int):
        """If the pipeline has a source and topic, build the pipeline

        Args:
            n (int): number of links to add to the pipeline
        """
        pass

