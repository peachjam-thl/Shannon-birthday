# 笑楠的生日花园

送给马笑楠 Shannon Ma 的手绘生日网页。无需安装依赖，纯 HTML、CSS、JavaScript。

## 本地查看

在本目录运行 `python -m http.server 8787 --directory dist --bind 127.0.0.1`，打开 http://127.0.0.1:8787 。

## 内容编辑

- 页面与生日信：`dist/index.html`。
- 十二支祝福签：`dist/app.js` 顶部的 `WISHES` 数组。
- 颜色、排版和动画：`dist/styles.css`。
- 人物直接采用用户提供的图 3，保留原画五官、发型和神态。
- 花园插画由内置图像生成工具依据图 1 的媒介、配色和氛围重新生成；见 `ASSET-NOTES.md`。

支持手机布局、无重复随机抽签、当前浏览器的收集进度、重读已收集的签、PNG 祝福卡下载、集齐后解锁生日信、可选提示音和减少动态效果偏好。

进度仅存在各自浏览器本地，不同设备之间不互通。没有真实生日日期、年龄或共同经历的设定，生日信为可修改的通用祝福。

字体为 Google Fonts 发行的 Ma Shan Zheng，遵循 SIL Open Font License；许可随资产附带。

网页只加载约 184 KB 的字体子集。大幅修改中文内容后，可运行 `python subset-font.py` 重新生成字体；需要 Python 的 fontTools 库。原始字体保存在 `font-source.ttf`。

站点默认私有，分享给朋友前需在 Sites 中设置合适的访问权限。
