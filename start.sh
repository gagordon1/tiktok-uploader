#! /bin/bash
echo "Building content pipeline..."
python3 build_pipeline.py
while true;
do sh ./upload_next.sh;
sleep 600;
done
