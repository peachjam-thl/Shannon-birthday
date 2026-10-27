"""Build the editable SVG birthday handheld; render with render-keepsake.cjs."""
from pathlib import Path
from base64 import b64encode
import re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).parent
ASSETS = ROOT / 'dist' / 'assets'
font = TTFont(ASSETS / 'pixel-latin.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
units = font['head'].unitsPerEm

def image(name, x, y, w, h, fit='xMidYMid meet'):
    data = b64encode((ASSETS / name).read_bytes()).decode('ascii')
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="{fit}" href="data:image/png;base64,{data}"/>'

def text(value, cx, baseline, size, color, stroke=None):
    # Outlined glyphs make the export independent of installed system fonts.
    names = [cmap.get(ord('!' if ch == '！' else ch), '.notdef') for ch in value]
    width = sum(font['hmtx'][name][0] for name in names)
    scale = size / units
    attrs = f'fill="{color}"'
    if stroke:
        attrs += f' stroke="{stroke}" stroke-width="2.5" paint-order="stroke fill" stroke-linejoin="miter"'
    parts = [f'<g {attrs} aria-label="{value}">']
    pos = cx - width * scale / 2
    for name in names:
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        parts.append(f'<path d="{pen.getCommands()}" transform="translate({pos:.4f} {baseline}) scale({scale:.6f} {-scale:.6f})"/>')
        pos += font['hmtx'][name][0] * scale
    return ''.join(parts) + '</g>'

cake = re.search(r'<svg class="birthday-cake".*?</svg>', (ROOT / 'dist/index.html').read_text(encoding='utf-8'), re.S).group()
cake = re.sub(r'<svg[^>]*>', '<svg x="274" y="382" width="172" height="122" viewBox="0 0 240 170">', cake, count=1)

parts = ['''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="720" height="1000" viewBox="0 0 720 1000" role="img" aria-labelledby="title desc">
<title id="title">HAPPY BIRTHDAY！SHANNON MA!</title>
<desc id="desc">A vintage birthday handheld with Shannon, the yellow birthday frog, a lit strawberry cake, an original pixel garden, a directional pad, joystick and A/B buttons. Made by peachjamT.</desc>
<defs><clipPath id="screen-crop"><rect x="82" y="108" width="556" height="506"/></clipPath>
<symbol id="heart" viewBox="0 0 16 16"><path d="M2 2h4v2h4V2h4v2h2v6h-2v2h-2v2h-2v2H6v-2H4v-2H2v-2H0V4h2Z" fill="#694551"/><path d="M2 4h4v2h4V4h4v6h-2v2h-2v2H6v-2H4v-2H2Z" fill="#ed9c9a"/><path d="M3 4h2v2H3Z" fill="#ffe6c1"/></symbol></defs>
<rect width="720" height="1000" fill="#f5ecda"/>
<path d="M60 40h592v12h20v18h14v864h-12v22h-26v12H80v-10H58v-20H42V78h8V54h10Z" fill="#cabaa5"/>
<path d="M52 24h604v12h20v22h10v850h-12v26h-24v14H68v-12H44v-22H32V60h10V38h10Z" fill="#e8ddbf" stroke="#715652" stroke-width="6"/>
<path d="M50 54h16V40h588v12H70v850H50Z" fill="#fff5d9"/>
<path d="M654 54h20v850h-12v22h-24v12H74v-12h562v-22h18Z" fill="#b3bca4"/>
<path d="M52 630h606v4H52Z" fill="#c6bc9f"/>
<rect x="62" y="88" width="596" height="546" fill="#958799"/>
<rect x="66" y="92" width="588" height="534" fill="#4d485e" stroke="#51424e" stroke-width="5"/>
<rect x="76" y="102" width="568" height="518" fill="#292e42"/>
<g clip-path="url(#screen-crop)">''', image('pixel-keepsake-garden.png',82,108,556,506,'xMidYMid slice'),
'''<rect x="82" y="460" width="556" height="154" fill="#29374b" fill-opacity=".28"/>
<path d="M106 177h218v218H106Z" fill="#7d5d4e"/>
<path d="M110 173h210v214H110Z" fill="#f6e6b9" stroke="#8e6c50" stroke-width="3"/>
<path d="M116 179h198v198H116Z" fill="#f9efd4"/>
''',image('shannon-pixel.png',116,179,198,198),
'''<path d="M400 177h218v218H400Z" fill="#7d5d4e"/>
<path d="M396 173h210v214H396Z" fill="#f6e6b9" stroke="#8e6c50" stroke-width="3"/>
<path d="M402 179h198v198H402Z" fill="#f9efd4"/>
''', image('birthday-duck.png',402,179,198,198),
'''<use href="#heart" x="341" y="266" width="38" height="38"/>
<path d="M118 158h24v3h-24zm462 0h24v3h-24z" fill="#ffe7a9"/>
''', text('A LITTLE BIRTHDAY MAGIC',360,146,10,'#fff0c4','#70575e'), cake,
text('HAPPY BIRTHDAY！',360,542,27,'#ffe4a1','#694556'),
text('SHANNON MA!',360,588,32,'#fff2cb','#694556'),
'''</g>
<rect x="92" y="644" width="8" height="8" fill="#d4a17a"/><rect x="92" y="644" width="5" height="5" fill="#f8d489"/>
<path d="M153 670h42v37h37v42h-37v37h-42v-37h-37v-42h37Z" fill="#c7b69d"/>
<path d="M148 665h42v37h37v42h-37v37h-42v-37h-37v-42h37Z" fill="#665c67" stroke="#4b4551" stroke-width="4"/>
<path d="M154 672h30v37h35v9h-43v-38h-22Z" fill="#99929a"/>
<path d="M124 719h25v19h-25zm38 28h20v23h-20zm29-28h25v18h-25z" fill="#514b58"/>
<rect x="158" y="712" width="24" height="24" fill="#766d78"/>
<path d="M162 680h16l-8-8zm-38 42v12l-7-6zm82 0v12l7-6zm-44 36h16l-8 8z" fill="#bbb0b3"/>
<circle cx="483" cy="747" r="39" fill="#c7b69d"/><circle cx="557" cy="700" r="39" fill="#c7b69d"/>
<circle cx="481" cy="741" r="34" fill="#b97984" stroke="#785964" stroke-width="4"/><circle cx="555" cy="694" r="34" fill="#b97984" stroke="#785964" stroke-width="4"/>
<path d="M464 719h25v5h-25zm74-47h25v5h-25z" fill="#e9b0ae"/>
<circle cx="169" cy="852" r="37" fill="#d1c2a7" stroke="#ab9b88" stroke-width="3"/>
<circle cx="169" cy="847" r="29" fill="#7d8d86" stroke="#546a66" stroke-width="4"/>
<circle cx="169" cy="847" r="20" fill="#97aba0" stroke="#b4c6af" stroke-width="2"/>
<path d="M147 835h5v-6h23v4h-20v6h-8z" fill="#cad8b9"/>
<rect x="287" y="815" width="58" height="19" rx="8" fill="#bdb39f"/>
<rect x="287" y="811" width="58" height="17" rx="7" fill="#7e777c" stroke="#625a64" stroke-width="2"/>
<rect x="367" y="815" width="58" height="19" rx="8" fill="#bdb39f"/>
<rect x="367" y="811" width="58" height="17" rx="7" fill="#7e777c" stroke="#625a64" stroke-width="2"/>
<path d="M516 839v43m14-36v43m14-36v43m14-36v43m14-36v43" stroke="#a4968b" stroke-width="6"/>
<path d="M515 839v36m14-29v36m14-29v36m14-29v36m14-29v36" stroke="#746b6c" stroke-width="3"/>
<use href="#heart" x="342" y="886" width="32" height="32"/>
''', text("SHANNON'S POCKET WORLD",360,67,11,'#816d65'),
text('B',481,749,17,'#fff0d2'),text('A',555,702,17,'#fff0d2'),
text('SELECT',316,853,7,'#958478'),text('START',396,853,7,'#958478'),
text('MADE WITH LOVE BY peachjamT',360,936,8,'#7c7068'), '</svg>']

output = ASSETS / 'shannon-birthday-keepsake.svg'
output.write_text(''.join(parts),encoding='utf-8')
print('Built assets/shannon-birthday-keepsake.svg (720 x 1000).')
