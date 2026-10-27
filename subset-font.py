from pathlib import Path
from fontTools import subset

root = Path(__file__).parent / 'dist'
text = ''.join((root / name).read_text(encoding='utf-8') for name in ['index.html', 'app.js', 'minigames.js', 'keepsake.js', 'content.js', 'styles.css', 'minigames.css', 'mobile.css', 'keepsake.css'])
options = subset.Options()
options.flavor = 'woff'
font = subset.load_font(str(root.parent / 'pixel-font-source.woff'), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, str(root / 'assets/pixel-cjk.woff'), options)
print('Pixel CJK subset generated.')
