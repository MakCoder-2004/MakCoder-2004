"""Encode browser-captured frames; no infinite motion and no service dependency."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
paths = sorted((root / '.frames').glob('*.png'))
assert len(paths) == 40, f'Expected 40 frames, got {len(paths)}'
with Image.open(paths[0]) as first:
    palette = first.convert('RGB').quantize(colors=128)
frames = []
for path in paths:
    with Image.open(path) as frame:
        frames.append(frame.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE))
# No loop extension: plays once, then remains on the final frame.
frames[0].save(root / 'assets/pipeline.gif', save_all=True, append_images=frames[1:],
               duration=[80] * 39 + [160], optimize=True, disposal=1)
with Image.open(root / 'assets/pipeline.gif') as gif:
    assert gif.n_frames > 1
    assert 'loop' not in gif.info
size = (root / 'assets/pipeline.gif').stat().st_size
assert size < 500_000, f'Animation should stay lightweight: {size} bytes'
print(f'Created finite pipeline GIF: {size:,} bytes')
