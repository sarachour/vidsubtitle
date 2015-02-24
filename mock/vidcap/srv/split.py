import subprocess

#ffmpeg -i TestVid2.mp4 -f segment -ss 2 -segment_time 4 -c copy -map 0 TestVid_segments/segb_%d.mp4


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
