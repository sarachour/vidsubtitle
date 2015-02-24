from pytube import YouTube
from pprint import pprint
import re;
import numpy as np
import subprocess;
import datetime;
import math;

# Download FLV Video
def download(filename, url):
	yt = YouTube()
	yt.url =  url
	yt.filename = filename
	video = yt.filter('mp4')[0];
	pprint(video);
	video.download();

download("sample/TestVid2", "https://www.youtube.com/watch?v=XP2oeVHxMW8");
