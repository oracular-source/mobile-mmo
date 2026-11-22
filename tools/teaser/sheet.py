"""Contact sheet of a shot's preview frames (for checking a take before rendering it)."""
import os, sys, glob
from PIL import Image
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'teaser_out'))
for name in sys.argv[1:]:
    fs = sorted(glob.glob(os.path.join(OUT, 'frames', name, '*.jpg')))
    if not fs: continue
    ims = [Image.open(f).resize((240, 427)) for f in fs]
    cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (cols * 240, rows * 427))
    for k, im in enumerate(ims): sh.paste(im, ((k % cols) * 240, (k // cols) * 427))
    p = os.path.join(OUT, 'sheet_' + name + '.jpg'); sh.save(p, quality=80); print(p, len(ims))
