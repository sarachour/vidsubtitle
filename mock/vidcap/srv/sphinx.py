import sys,os
import pprint
try:
	import sphinxbase
except:
	print """sphixbase is not installed in your system. Please install it with package manager."""
	exit(1)

try:
	import pocketsphinx as ps
except:
	print "Continue."
try:
	import pocketsphinx as ps
except:
	print """Pocket sphinx is not installed in your system. Please install it with package manager"""
	exit(1)

def decodeSpeech(wavfile):
    """
    Decodes a speech file
    """
    hmdir = "/usr/share/pocketsphinx/model/hmm/en_US/hub4wsj_sc_8k"
	#hmdir="/usr/share/sphinx3/model/hmm/RM1_cd_semi/"
	lmd = "/usr/share/pocketsphinx/model/lm/en_US/hub4.5000.DMP"
	#lmd = "/usr/share/sphinx3/model/lm/an4/an4.ug.cls.lm.DMP"
	dictd = "/usr/share/pocketsphinx/model/lm/en_US/cmu07a.dic"
	#dictd = "/usr/share/sphinx3/model/lm/an4/an4.dict"
    speechRec = ps.Decoder(hmm = hmmd, lm = lmdir, dict = dictp)
    wavFile = file(wavfile,'rb')
    speechRec.decode_raw(wavFile)
    result = speechRec.get_hyp()
    print "```````````````````````````````````````````````````````````````"
    print result
    return result[0]
 

#wavfile = sys.argv[1]
#recognised = decodeSpeech(hmdir,lmd,dictd,wavfile)

#print "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
#print recognised
#print "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"

