import scipy as sp
import sys
import wave
import tempfile
from pyssp.util import get_frame,add_signal,read_signal,separate_channels,uniting_channles
from pyssp.vad.ltsd import LTSD
import optparse

WINSIZE=8192
sound='TestVid.wav'

signal, params = read_signal(sound,WINSIZE)
window = sp.hanning(WINSIZE)

ltsd = LTSD(WINSIZE,window,5)
res,ltsds =  ltsd.compute_without_noise(signal,WINSIZE*int(params[2] /float(WINSIZE)/3.0))
print ltsds

write("tmp.txt", res)