#! /bin/bash
python3 build_pipeline.py
while true;
do sh ./upload_next.sh;
sleep 600;
done

