from content_pipeline.ContentPipeline import ContentPipeline

if __name__ == "__main__":
    n = 5
    topic = "its always sunny in philadelphia"
    cp = ContentPipeline(topic)
    cp.build_pipeline(n)
    out = []
    while cp.has_next():
        out.append(cp.get_next())
    print(out)

