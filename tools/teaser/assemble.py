"""Joins the shot files, adds the soundtrack, writes teaser.mp4."""
import os, sys, json, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from shots import SHOTS
from record import OUT, FPS
FIGHTS = {'s2_rats', 's3a_necro', 's3b_wizard', 's3c_warrior', 's4_king', 's5_greyfang', 's6a_prior', 's6b_bell', 's6c_malrec'}
t = 0; cuts = []; fights = []
for s in SHOTS:
    d = s['frames'] / FPS
    if t > 0: cuts.append(t)
    if s['name'] in FIGHTS: fights.append([t, t + d])
    t += d
lst = os.path.join(OUT, 'list.txt')
open(lst, 'w').write(''.join("file '%s'\n" % os.path.join(OUT, 'shots', s['name'] + '.mp4') for s in SHOTS))
silent = os.path.join(OUT, 'silent.mp4'); wav = os.path.join(OUT, 'music.wav'); dst = os.path.join(OUT, 'teaser.mp4')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', silent], check=True)
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), 'music.py'), json.dumps({'total': t, 'cuts': cuts, 'fights': fights}), wav], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
                '-shortest', '-movflags', '+faststart', dst + '.tmp.mp4'], check=True)
os.replace(dst + '.tmp.mp4', dst); print(dst, round(t, 1), 's')
