// Render the outlined, self-contained SVG without installing project dependencies.
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp');
const assets = path.join(__dirname, 'dist', 'assets');
sharp(path.join(assets, 'shannon-birthday-keepsake.svg'), {density: 144})
  .resize(1440, 2000)
  .png()
  .toFile(path.join(assets, 'shannon-birthday-keepsake.png'))
  .then(info => console.log(JSON.stringify({width:info.width,height:info.height,bytes:info.size})))
  .catch(error => {console.error(error.message);process.exitCode=1;});
