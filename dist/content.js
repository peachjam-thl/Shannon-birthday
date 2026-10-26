'use strict';
// 五张签依次使用用户图 1–5；签文和最后的祝福仍留空，等待用户提供。
// image 填本地相对路径，例如 assets/card-01.png；text 支持用 \n 换行。
window.BIRTHDAY_CONTENT = {
  answer: '奶蛙',
  cards: [
    {id: '01', image: 'assets/frog-card-01.png', imageAlt: '戴生日帽的紫色像素奶蛙', title: '', text: ''},
    {id: '02', image: 'assets/frog-card-02.png', imageAlt: '戴生日帽的蓝色像素奶蛙', title: '', text: ''},
    {id: '03', image: 'assets/frog-card-03.png', imageAlt: '戴生日帽的红色像素奶蛙', title: '', text: ''},
    {id: '04', image: 'assets/frog-card-04.png', imageAlt: '戴生日帽的绿色像素奶蛙', title: '', text: ''},
    {id: '05', image: 'assets/frog-card-05.png', imageAlt: '戴生日帽的橙色像素奶蛙', title: '', text: ''}
  ],
  letter: {title: '', text: '', signature: ''}
};
