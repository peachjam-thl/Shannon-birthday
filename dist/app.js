'use strict';
const WISHES = [
  {title:'快乐常驻签',icon:'☀',wish:'愿你的小日子，\n总有晒不完的太阳。',body:'愿开心不只在生日这天出现。早餐好吃，晚风温柔，走在路上也会遇到让你嘴角上扬的小事。'},
  {title:'梦想开花签',icon:'✿',wish:'认真种下的愿望，\n都在悄悄生根。',body:'想做的事，就慢慢去做吧。不必和谁比快慢，属于你的花期，会在合适的时候到来。'},
  {title:'好运敲门签',icon:'✧',wish:'下一次敲门的，\n是刚刚好的好运。',body:'愿你等的消息有回音，期待的事情有着落。也愿那些没有预告的小惊喜，时不时来找你。'},
  {title:'安心好眠签',icon:'☾',wish:'今晚做个甜甜的梦，\n明天醒来又是晴天。',body:'把今天的辛苦先放下吧。愿你每晚都能安心入睡，醒来有精神，也有慢慢开始一天的从容。'},
  {title:'自由生长签',icon:'♧',wish:'做风，做花，\n做你喜欢的自己。',body:'愿新的一岁，你拥有选择的勇气。不必套进别人的答案，沿着自己喜欢的方向，舒舒服服地生长。'},
  {title:'温柔相遇签',icon:'♡',wish:'愿你遇见的人，\n也像春风一样温柔。',body:'愿真心总能遇见真心，分享的话有人听，安静的时候也被理解。你给出的善意，也能好好回到你身边。'},
  {title:'元气满满签',icon:'✳',wish:'吃好每一顿饭，\n攒够拥抱世界的力气。',body:'愿你身体轻快，胃口很好。忙碌里有休息，努力后有补给，照顾好自己，也是很了不起的事。'},
  {title:'勇敢向前签',icon:'↗',wish:'心里的那一点勇敢，\n会带你走很远。',body:'愿你有开始的勇气，也有重新开始的底气。偶尔犹豫也没关系，一小步一小步，同样是在向前。'},
  {title:'小事发光签',icon:'☆',wish:'愿普通的一天，\n也有闪闪发亮的瞬间。',body:'一朵路边的花，一首喜欢的歌，一杯刚好的热饮。愿你总能发现这些小小的美好，把日子过得有滋有味。'},
  {title:'好好休息签',icon:'☁',wish:'偶尔停一停，\n云朵也会等你。',body:'你不必每时每刻都在赶路。愿你允许自己放空、发呆，给心留一点空位，再带着轻松重新出发。'},
  {title:'心愿有声签',icon:'♪',wish:'你喜欢的事，\n值得被认真对待。',body:'愿你的热爱有地方安放，心意有机会说出口。那些小小的坚持，总有一天，会响起属于你的回声。'},
  {title:'未来可期签',icon:'❀',wish:'下一岁的风景，\n一定有新的可爱。',body:'愿你走向的明天，有新鲜的故事，也有熟悉的安心。前面的路很长，带着好奇，慢慢去遇见吧。'}
];
const STORAGE_KEY = 'shannon-birthday-garden-v1';
const $ = selector => document.querySelector(selector);
const wishDialog = $('#wish-dialog');
const letterDialog = $('#letter-dialog');
let collection = readCollection();
let drawing = false;
let currentWish = null;
let soundOn = false;
let audioContext = null;
let saveInProgress = false;

function readCollection() {
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(data) ? [...new Set(data.filter(n => Number.isInteger(n) && n >= 0 && n < WISHES.length))] : []; }
  catch { return []; }
}
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(collection)); } catch { $('#draw-status').textContent = '这次的祝福也会好好陪着你。'; } }
function renderCollection() {
  const shelf = $('#wish-collection');
  shelf.replaceChildren();
  WISHES.forEach((wish, index) => {
    const unlocked = collection.includes(index);
    const tile = document.createElement('button');
    tile.type = 'button'; tile.className = `collection-item${unlocked ? ' unlocked' : ''}`;
    tile.disabled = !unlocked;
    tile.setAttribute('aria-label', unlocked ? `重读${wish.title}` : `第 ${index + 1} 份祝福，尚未抽到`);
    const number = document.createElement('span'); number.className='collection-number'; number.textContent=String(index+1).padStart(2,'0');
    const icon = document.createElement('span'); icon.className='collection-icon'; icon.textContent=unlocked ? wish.icon : '✧'; icon.setAttribute('aria-hidden','true');
    const title = document.createElement('span'); title.className='collection-title'; title.textContent=unlocked ? wish.title : '等待花开';
    tile.append(number,icon,title); if (unlocked) tile.addEventListener('click',()=>showWish(index)); shelf.append(tile);
  });
  $('#draw-count').textContent=collection.length; $('#nav-count').textContent=collection.length;
  const complete=collection.length===WISHES.length;
  $('#collection-summary').textContent=complete ? '十二份祝福，已经全部来到你身边。' : `还有 ${WISHES.length-collection.length} 份美好，等你慢慢遇见。`;
  $('#letter-button').disabled=!complete;
  $('#letter-button-text').textContent=complete ? '拆开这封生日信 ↗' : `再收集 ${WISHES.length-collection.length} 份祝福，就能拆信`;
  $('#letter-hint').textContent=complete ? '你已经收齐好运。现在，打开这封只写给你的信吧。' : '集齐十二支生日签，就能拆开这份小小的心意。';
  $('#draw-button').textContent=complete ? '十二份祝福集齐啦，去拆信 ♡' : '摇一摇，收一份祝福 ✧';
  $('#jar-button').setAttribute('aria-label', complete ? '十二份祝福已集齐，打开生日信' : '摇一摇签筒，抽一支生日祝福');
}
function playChime() {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().catch(()=>{});
    [523.25,659.25,783.99,1046.5].forEach((frequency,index)=>{
      const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();const t=audioContext.currentTime+index*.11;
      oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.09,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.65);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(t);oscillator.stop(t+.7);
    });
  } catch { soundOn=false;$('#sound-toggle').setAttribute('aria-pressed','false');$('#sound-toggle').setAttribute('aria-label','开启声音'); }
}
async function drawWish() {
  if (drawing) return;
  if (collection.length===WISHES.length) { openLetter();return; }
  drawing=true;$('#draw-button').disabled=true;$('#jar-button').disabled=true;$('#jar-button').classList.add('shaking');$('#draw-status').textContent='小小的好运，正在向你跑来……';
  playChime();
  await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 1250));
  const remaining=WISHES.map((_,i)=>i).filter(i=>!collection.includes(i));
  const random=new Uint32Array(1);crypto.getRandomValues(random);const index=remaining[Math.floor(random[0]/4294967296*remaining.length)];
  collection.push(index);persist();renderCollection();
  drawing=false;$('#draw-button').disabled=false;$('#jar-button').disabled=false;$('#jar-button').classList.remove('shaking');
  $('#draw-status').textContent=collection.length===WISHES.length ? '所有的好运，都来啦！生日信已经解锁。' : '这一份温柔的祝福，送给你。';
  showWish(index);celebrate();playChime();
}
function showWish(index) {
  currentWish=index;const wish=WISHES[index];
  $('#card-number').textContent=`NO. ${String(index+1).padStart(2,'0')} / 12`;
  $('#card-icon').textContent=wish.icon;$('#card-title').textContent=wish.title;$('#card-wish').textContent=wish.wish;$('#card-body').textContent=wish.body;
  $('#next-wish').textContent=collection.length===WISHES.length ? '去拆生日信 ♡' : '再抽一支 ↗';$('#save-status').textContent='';
  if(!wishDialog.open){wishDialog.showModal();document.body.classList.add('modal-open');}
}
function closeDialog(dialog) { dialog.close(); }
function openLetter() { if(collection.length!==WISHES.length)return;letterDialog.showModal();document.body.classList.add('modal-open');playChime(); }
function celebrate() {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const colors=['#d18467','#e7c466','#7c9471','#7196ad','#dbad95'];const holder=$('#confetti');
  for(let n=0;n<30;n++){const piece=document.createElement('i');piece.style.left=`${Math.random()*100}%`;piece.style.background=colors[n%colors.length];piece.style.animationDelay=`${Math.random()*.45}s`;piece.style.setProperty('--drift',`${(Math.random()-.5)*250}px`);holder.append(piece);piece.addEventListener('animationend',()=>piece.remove(),{once:true});}
}
function wrapText(context,text,maxWidth){const lines=[];let line='';for(const char of text){if(context.measureText(line+char).width>maxWidth&&line){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;}
async function saveCard() {
  if(currentWish===null||saveInProgress)return;
  saveInProgress=true;const button=$('#save-card');button.disabled=true;$('#save-status').textContent='正在把这份祝福装进卡片……';
  try {
    const wish=WISHES[currentWish];await document.fonts.ready;
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1420;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff9ed';ctx.fillRect(0,0,1000,1420);ctx.strokeStyle='#d7c7a3';ctx.lineWidth=2;ctx.strokeRect(40,40,920,1340);ctx.strokeRect(51,51,898,1318);
    ctx.textAlign='center';ctx.fillStyle='#9c9278';ctx.font='18px Georgia';ctx.fillText('A LITTLE WISH FOR SHANNON',500,123);ctx.font='italic 22px Georgia';ctx.fillText(`NO. ${String(currentWish+1).padStart(2,'0')} / 12`,500,181);
    ctx.fillStyle='#c5775e';ctx.font='138px BirthdayHand, serif';ctx.fillText(wish.icon,500,356);ctx.font='24px serif';ctx.fillText('生 日 · 上 上 签',500,441);
    ctx.fillStyle='#60795b';ctx.font='96px BirthdayHand, serif';ctx.fillText(wish.title,500,581);
    ctx.fillStyle='#477d9a';ctx.font='52px BirthdayHand, serif';wish.wish.split('\n').forEach((line,i)=>ctx.fillText(line,500,710+i*84));
    ctx.strokeStyle='#c7b68d';ctx.beginPath();ctx.moveTo(445,861);ctx.lineTo(555,861);ctx.stroke();
    ctx.textAlign='left';ctx.fillStyle='#787c67';ctx.font='30px "Microsoft YaHei", sans-serif';wrapText(ctx,wish.body,680).forEach((line,i)=>ctx.fillText(line,160,950+i*59));
    ctx.textAlign='center';ctx.fillStyle='#b28a65';ctx.font='36px BirthdayHand, serif';ctx.fillText('给笑楠，新一岁也要开心呀 ♡',500,1220);ctx.fillStyle='#a8a083';ctx.font='italic 21px Georgia';ctx.fillText("Shannon's little birthday garden",500,1301);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG unavailable');
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`送给笑楠-${wish.title}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    $('#save-status').textContent='祝福卡已生成；若浏览器打开图片，长按即可保存。';
  } catch { $('#save-status').textContent='暂时没能生成图片，可以先截图保存这份祝福。'; }
  finally {saveInProgress=false;button.disabled=false;}
}
$('#draw-button').addEventListener('click',drawWish);$('#jar-button').addEventListener('click',drawWish);
$('#next-wish').addEventListener('click',()=>{closeDialog(wishDialog);collection.length===WISHES.length ? openLetter() : drawWish();});
$('#save-card').addEventListener('click',saveCard);
$('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));$('#sound-toggle').setAttribute('aria-label',soundOn?'关闭声音':'开启声音');if(soundOn)playChime();});
$('#letter-button').addEventListener('click',openLetter);
document.querySelectorAll('.dialog-close').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
$('.close-letter').addEventListener('click',()=>closeDialog(letterDialog));
for(const dialog of [wishDialog,letterDialog]){
  dialog.addEventListener('close',()=>{if(!wishDialog.open&&!letterDialog.open)document.body.classList.remove('modal-open');});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);});
}
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY&&!drawing){collection=readCollection();renderCollection();}});
renderCollection();
