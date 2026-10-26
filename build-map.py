"""Build the code-drawn pixel map from the retained DataV GeoJSON boundary data."""
import json
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).parent
data = json.loads((ROOT / 'china-boundaries.geojson').read_text(encoding='utf-8'))
W, H, CELL = 800, 340, 4

def project(point):
    lon, lat = point[:2]
    return 32 + (lon - 73) * 7.2, 15 + (54 - lat) * 7.7

mask = Image.new('L', (W, H))
draw = ImageDraw.Draw(mask)
for feature in data['features']:
    # The last unnamed feature contains maritime boundary strokes, not land.
    if not feature['properties'].get('name'):
        continue
    polygons = feature['geometry']['coordinates']
    if feature['geometry']['type'] == 'Polygon':
        polygons = [polygons]
    for polygon in polygons:
        draw.polygon([project(p) for p in polygon[0]], fill=255)
        for hole in polygon[1:]:
            draw.polygon([project(p) for p in hole], fill=0)

small = mask.resize((W // CELL, H // CELL), Image.Resampling.NEAREST)
land = small.resize((W, H), Image.Resampling.NEAREST)
outer = small.filter(ImageFilter.MaxFilter(3)).resize((W, H), Image.Resampling.NEAREST)
inner = small.filter(ImageFilter.MinFilter(3)).resize((W, H), Image.Resampling.NEAREST)
svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" shape-rendering="crispEdges">',
       '<defs><pattern id="water" width="44" height="36" patternUnits="userSpaceOnUse"><rect width="44" height="36" fill="#83bfc3"/><path d="M4 12h12v-2h8M28 28h12" fill="none" stroke="#aed6cb" stroke-width="2" opacity=".7"/></pattern></defs>',
       '<path fill="url(#water)" d="M0 0h800v340H0z"/>']
rng = random.Random(1025)
for y in range(0, H, CELL):
    for x in range(0, W, CELL):
        if land.getpixel((x, y)):
            color = '#d5d795' if not inner.getpixel((x, y)) else rng.choice(['#a3bd76'] * 7 + ['#acc47c', '#9eb672'])
        elif outer.getpixel((x, y)):
            color = '#4f785b'
        else:
            continue
        svg.append(f'<rect x="{x}" y="{y}" width="4" height="4" fill="{color}"/>')

# Original pixel scenery, kept away from the four city anchors.
for x, y in [(102,116),(122,100),(141,127),(154,145),(182,157),(202,169),(219,145)]:
    svg.append(f'<path transform="translate({x} {y})" d="M0 16h4v-4h4V8h4V4h4v4h4v4h4v4h4v4H0z" fill="#6c8b61"/><path transform="translate({x} {y})" d="M8 12V8h4V4h4v4h4v4h-4V8h-4v4z" fill="#e5dcaa"/>')
for x,y in [(139,198),(157,214),(279,257),(299,241),(331,220),(364,268),(436,81),(449,66),(411,43),(426,28)]:
    if not land.getpixel((x,y)):
        continue
    svg.append(f'<path transform="translate({x} {y})" d="M6 0h4v4h4v4h4v4h-6v8H6v-8H0V8h4V4h2z" fill="#527a50"/><path transform="translate({x} {y})" d="M6 0h4v4h4v4H4V4h2z" fill="#729754"/><path transform="translate({x} {y})" d="M7 16h4v6H7z" fill="#805b3d"/>')

# Decorative sailing route across the Pacific, not a geographic boundary.
svg.append('<path d="M498 242h40v-16h40v-20h44v-18h52v-12h50" fill="none" stroke="#ebdfad" stroke-width="3" stroke-dasharray="7 7"/>')
svg.append('<path d="M727 176h-12v-6h6v-6h6v6h6v6h-6z" fill="#fff0c4"/>')
# Compass and a tiny sailboat.
svg.append('<g transform="translate(735 34)"><path d="M0 0h4v14h10v4H4v14H0V18h-10v-4H0z" fill="#56838a"/><path d="M0 0h4v14h-4z" fill="#f3e8b5"/></g>')
svg.append('<g transform="translate(567 268)"><path d="M0 16h36v4h-4v4H8v-4H4z" fill="#865d40"/><path d="M17 0h3v16h-3z" fill="#755536"/><path d="M14 0v13H2v-3h3V7h3V4h3V0zM23 4v10h10v-3h-3V8h-3V4z" fill="#fff0c4"/></g>')
svg.append('</svg>')
(ROOT / 'dist/assets/china-pixel-map.svg').write_text(''.join(svg), encoding='utf-8')
print('Built China pixel map from DataV boundaries (800 x 340).')
