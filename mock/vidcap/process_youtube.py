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
	video = yt.filter('3gp')[0];
	pprint(video);
	video.download();

def extract(filename):
	command = "ffmpeg -i "+filename+".3gp -ab 160k -ac 2 -ar 44100 -vn "+filename+".wav"
	subprocess.call(command, shell=True)

def play(filename):
	s = Sound();
	s.read(filename+".wav");
	s.play();

def to_timecode(sec):
	s = (sec);
	m = math.floor(s/60);
	h = math.floor(m/60);
	m -= h*60;
	s -= h*3600 + m*60
	return "%d:%02d:%02d" % (h, m, s)

def wav_to_seg(wavefile):
	wfile = wave.open(wavefile,"r");
	time = (1.0 * wfile.getnframes()) / wfile.getframerate()
	return {'file':wfile, 'start':0, 'end':time, 'length':time};

def raw_to_wav(basename):
	params = "-f s16le -ar 88K -ac 1"
	clean_cmd = "rm "+basename+".wav log_"+basename+".txt";
	cmd = "ffmpeg "+params+" -i "+basename+".raw"+" "+basename+".wav"+ " &> /dev/null";
	subprocess.call(clean_cmd, shell=True);
	subprocess.call(cmd, shell=True);


def vid_to_seg(src, name, start, length):
	clean_cmd = "rm "+name+" log_"+name+".txt";
	cmd = "ffmpeg "+" -i "+src+" -t "+to_timecode(length)+" -ss "+to_timecode(start)+" "+name + " /dev/null";
	subprocess.call(clean_cmd, shell=True);
	subprocess.call(cmd, shell=True);

def breakup_by_pause(filename):
	#command = "sphinx_cont_fileseg -i "+filename+".wav -w &> log.txt"
	#subprocess.call(command,shell=True);
	log = open('log.txt','r');
	segs = [];
	for line in log:
		pattern="Utt ([0-9]*), st=\s*([0-9\.]+)s,\s*et=\s*([0-9\.]+)s,\s*seg=\s*([0-9\.]+)s";
		prog=re.compile(pattern);
		result=prog.match(line);
		if result != None:
			seg = {};
			seg['item'] = result.group(1);
			seg['file'] = seg['item']+".wav";
			seg['start'] = float(result.group(2));
			seg['end'] = float(result.group(3));
			seg['length'] = float(result.group(4));
			vid_to_seg(filename, seg['file'], seg['start'],seg['end']);
			segs.append(seg);
	return segs

def breakup_by_frame(source, prefix,delta,start,end,length, offset):
	subsegs = [];
	offset = delta/2.0;
	i=0;
	
	subprocess.call("rm "+prefix+"_*.wav log_*.txt", shell=True);
	s = start;
	e = end;
	f = source;
	l = length;
	o = 0;
	print s,e,l
	print "index\tfilename\tstart\tend\n";
	for o in np.arange(0,l,offset):
		out = prefix+"_"+str(i)+".wav";
		vid_to_seg(f, out,o,delta);
		print "%d\t%s\t%f\t%f\n" % (i,out,s+o, s+o+delta)
		i+=1;
	
download("TestVid2", "https://www.youtube.com/watch?v=XP2oeVHxMW8");
#extractAudio("TestVid")
#playAudio("TestVid")
#extractSegments("TestVid");
#segs = breakup_level1("TestVid");
#breakup_level2(segs, 30);
breakup_by_frame