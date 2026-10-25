from pathlib import Path
from fontTools import subset

root = Path(__file__).parent / 'dist'
text = ''.join((root / name).read_text(encoding='utf-8') for name in ['index.html', 'app.js', 'styles.css'])
options = subset.Options()
options.flavor = 'woff'
font = subset.load_font(str(root.parent / 'font-source.ttf'), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, str(root / 'assets/handwriting.woff'), options)
print('Handwriting subset generated.')
