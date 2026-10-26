# 第二版像素素材

## 中美祝福地图

- `dist/assets/china-pixel-map.svg` 由项目脚本 `build-map.py` 绘制，使用保留在 `china-boundaries.geojson` 的阿里云 DataV.GeoAtlas 全国省级边界数据：[地图工具](https://datav.aliyun.com/portal/school/atlas/area_selector)、[原始 GeoJSON](https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json)。
- 美国西部轮廓来自 [Natural Earth 1:10m Admin 0 countries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/)，从[作者仓库 GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson)提取美国要素，保留为 `usa-boundaries.geojson`；地图边缘裁去美国东部。湾区海岸增加像素入口强调，定位点取旧金山湾周边约 -122.4/37.8。
- 两侧陆地按相同比例转换，并压缩太平洋间距，再用 4 像素网格绘制陆地、海岸及原创像素山丘、树林、船只。图为生日游戏的旅行示意背景；海上的虚线是装饰航线。未使用星露谷游戏原版素材。
- 四个中国城市定位点采用相同数据的省级行政中心坐标：呼和浩特 111.670801/40.818311，北京 116.405285/39.904989，上海 121.472644/31.231706，成都 104.065735/30.659462。五张卡片用引线与定位点连接，橙色热情卡在美国湾区。页面已删除美国方向文字。
- 地图为本地 SVG，不依赖在线地图服务或远程图片请求；原始六张奶蛙图片继续直接使用。

## 奶蛙签卡及集齐弹窗

本轮用户提供的六张 PNG 直接复制到项目，复制前后逐项核验 SHA-256 相同，未改色、重绘或裁切。

| 用户图片 | 资产路径 | 用途 |
| --- | --- | --- |
| 图 1，紫色 | `dist/assets/frog-card-01.png` | 第 01 张签卡与收藏缩略图 |
| 图 2，蓝色 | `dist/assets/frog-card-02.png` | 第 02 张签卡与收藏缩略图 |
| 图 3，红色 | `dist/assets/frog-card-03.png` | 第 03 张签卡与收藏缩略图 |
| 图 4，绿色 | `dist/assets/frog-card-04.png` | 第 04 张签卡与收藏缩略图 |
| 图 5，橙色 | `dist/assets/frog-card-05.png` | 第 05 张签卡与收藏缩略图 |
| 图 6，黄色 | `dist/assets/frog-summoned.png` | 集齐五张后的恭喜弹窗 |

以下为此前页面素材记录。

- `dist/assets/birthday-duck.png`：直接使用用户提供的本轮图一，右侧展示。
- `dist/assets/shannon-pixel.png`：以本轮图二为目标，使用内置 image_gen 去除外部灰白棋盘格背景。保留肖像、姿态、服装和像素风格，左侧展示。
- `dist/assets/pixel-meadow.png`：使用内置 image_gen 创建的原创像素乡野背景。
- 木框、宝箱、卡背、像素心形和游戏机外壳为项目内 HTML/CSS/SVG。
- 英文字体 Press Start 2P，来自 Google Fonts；中文字体 Fusion Pixel 12px proportional zh_hans，来自 TakWolf/fusion-pixel-font 2026.10.25 发布包。许可及依赖字体许可随 `dist/assets/` 保存。
- 未使用游戏原版素材或原版配乐；提示音是代码生成的原创简单音阶。

## 肖像透明底最终提示词

Use case: background-extraction. Edit target is the attached pixel-art portrait. Remove ONLY the gray-and-white checkerboard background outside the silhouette. Make that outside area genuinely transparent. Preserve the existing portrait unchanged: the same recognizable face, short dark brown hair, expression, pixel squares, blue jacket, white shirt, silver cross pendant and earring, yellow party hat, exact pose and composition. Do not redraw, smooth, beautify or change proportions. Retain crisp hard pixel edges; no glow, no border, no shadow. Do not mistake white parts of the hat, shirt, necklace or face highlights for background. Output square PNG with actual alpha transparency.

## 像素背景最终提示词

乡野背景：`dist/assets/pixel-meadow.png`。

Use case: illustration-story. Original cozy 16-bit pixel-art countryside landscape, a backdrop for a birthday game screen inside a handheld console. Wide landscape 16:9 aspect ratio. Work as true low-resolution game art, approximately 384 by 216 logical pixels scaled with crisp nearest-neighbor edges, square pixel clusters, limited cohesive color palette. Warm peaceful farming-sim mood like classic rural life games. Bright clear turquoise blue sky in top third, a few tiny pixel clouds, soft distant blue-purple mountains, dark green tree silhouettes at the two far sides, sunny green meadow foreground, a little dirt path at bottom, a few small white daisies and golden flowers at bottom corners. The central two-thirds must be open and quiet for game interface overlay, no houses or focal objects there. Afternoon golden light, vivid but gentle colors. No people, no portraits, no game UI, no writing, no text, no logos, no copied game assets, no gradients, no vector curves, no blur, no 3D, no photographic texture. Output a clean flat rectangle that can fill the entire game screen.

## 星空结尾背景最终提示词

资产：`dist/assets/pixel-starfield.png`。使用内置 image_gen 工具生成。

Use case: illustration-story. Original cozy 16-bit pixel-art starry night sky for the final screen of a birthday game inside a handheld console. Wide 16:9 landscape. Same peaceful rural farming-sim feeling as a warm classic pixel countryside game. True crisp square pixel clusters at approximately 384x216 logical pixels, limited navy blue, indigo, lavender, dusty pink and warm pale gold palette. Star-filled clear indigo sky occupies about 85 percent of the canvas. Tiny blocky gold and cream stars of different sizes, a very subtle pale lavender Milky Way band high at one side, a small simple crescent moon near the upper-right corner. Quiet distant dark-purple mountains and dark blue pine silhouettes confined to the bottom 12 percent, like a peaceful sleeping valley. Keep the whole center spacious, dark and fairly calm to support very large gold birthday typography added later in HTML. Pixel art with visible square steps, flat colors, no blur, no photorealism, no gradients, no 3D, no text, no letters, no UI, no logo, no copied game assets. Landscape fills a game screen edge to edge.
