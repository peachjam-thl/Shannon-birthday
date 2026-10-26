'use strict';
// 五张签依次使用用户图 1–5 和用户提供的原文；最后的信件仍留空。
// image 填本地相对路径，例如 assets/card-01.png；text 支持用 \n 换行。
window.BIRTHDAY_CONTENT = {
  answer: '奶蛙',
  cards: [
    {id: '01', image: 'assets/frog-card-01.png', imageAlt: '戴生日帽的紫色像素奶蛙', title: '自在', text: '希望姐一直自由自在，能够做自己喜欢的事，过自己喜欢的生活。'},
    {id: '02', image: 'assets/frog-card-02.png', imageAlt: '戴生日帽的蓝色像素奶蛙', title: '冷静', text: '希望姐遇到什么事都能从容面对，冷静方能办大事！'},
    {id: '03', image: 'assets/frog-card-03.png', imageAlt: '戴生日帽的红色像素奶蛙', title: '发财', text: '发大财！！！赚最多的钱！买最贵的包！过最好的日子！'},
    {id: '04', image: 'assets/frog-card-04.png', imageAlt: '戴生日帽的绿色像素奶蛙', title: '生命', text: '希望姐姐一直健康平安，充满活力，好好享受生活中的每一天，身体健康最重要！'},
    {id: '05', image: 'assets/frog-card-05.png', imageAlt: '戴生日帽的橙色像素奶蛙', title: '热情', text: '希望姐姐永远开开心心，永远对未来充满热情！'}
  ],
  letter: {title: '', text: '', signature: ''}
};
