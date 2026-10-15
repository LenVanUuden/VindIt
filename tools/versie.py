#!/usr/bin/env python3
"""Zet een nieuw versienummer op alle scripts in index.html, zodat telefoons na een update
geen mix van oude en nieuwe bestanden laden. Draai vóór elke push: python3 tools/versie.py"""
import re,datetime,pathlib
p=pathlib.Path(__file__).resolve().parent.parent/'index.html'
s=p.read_text(encoding='utf-8')
v=datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
s=re.sub(r"window\.VI_V='[^']*'",f"window.VI_V='{v}'",s)
s=re.sub(r'(<script src="[a-z]+\.js)\?v=[^"]*"',lambda m:f'{m.group(1)}?v={v}"',s)
p.write_text(s,encoding='utf-8');print('versie',v)
