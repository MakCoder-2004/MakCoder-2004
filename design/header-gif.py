"""Encode screenshots of the original HTML/CSS neural header into a shared-palette GIF."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
paths = sorted((root / '.frames/header').glob('*.png'))
assert len(paths) == 32
with Image.open(paths[0]) as first:
    palette = first.convert('RGB').quantize(colors=256)
frames = []
for path in paths:
    with Image.open(path) as image:
        frames.append(image.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE))
output = root / 'assets/neural-header.gif'
frames[0].save(output, save_all=True, append_images=frames[1:], duration=100,
               loop=0, disposal=1, optimize=True)
with Image.open(output) as gif:
    assert gif.n_frames == 32
    assert gif.info['loop'] == 0
assert output.stat().st_size < 700_000
print(f'Neural header GIF: {output.stat().st_size:,} bytes; static PNG provides reduced-motion alternative.')
