#! /bin/bash
python download_next_video.py
node uploader/src/main.js
rm -r content/*
rm -r cover_images/*