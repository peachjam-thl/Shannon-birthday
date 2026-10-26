'use strict';
const CONTENT=window.BIRTHDAY_CONTENT;
const $=selector=>document.querySelector(selector);
const STORAGE_KEY='shannon-pocket-world-five-cards-v2';
// Card IDs and saved collection progress remain stable; only their display changes.
const CARD_PLACES={
  '01':{name:'呼和浩特',x:33.75,y:9.4,color:'#9a68bd'},
  '02':{name:'上海',x:57,y:49.4,color:'#4e9fd3'},
  '03':{name:'北京',x:50.25,y:14.7,color:'#cf5e54'},
  '04':{name:'成都',x:27.5,y:60.6,color:'#78a357'},
  '05':{name:'太平洋',x:84.25,y:37.4,color:'#e89b42'}
};
const pages=['unlock-page','cards-page','letter-page','finale-page'];
let pageIndex=0;
let unlocked=false;
let transitioning=false;
let drawing=false;
let collection=readCollection();
let activeCard=null;
let activeCardIsNew=false;
let completionSeen=false;
let overlayReturnFocus=null;
let soundEnabled=false;
let audioContext=null;
let toastTimer=null;
let finalePreparation=null;
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function prepareFinale(){
  if(!finalePreparation){
    finalePreparation=(async()=>{
      const image=$('#finale-background');
      if(image.complete&&!image.naturalWidth)image.src=image.getAttribute('src');
      await Promise.all([image.decode(),document.fonts.load('16px PixelLatin')]);
    })().catch(error=>{finalePreparation=null;throw error;});
  }
  return finalePreparation;
}

function readCollection(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(saved)?[...new Set(saved.filter(id=>CONTENT.cards.some(card=>card.id===id)))]:[];}catch{return[];}}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(collection));}catch{/* The game remains playable without browser storage. */}}
function toast(message){clearTimeout(toastTimer);$('#screen-toast').textContent=message;$('#screen-toast').hidden=false;toastTimer=setTimeout(()=>{$('#screen-toast').hidden=true;},2200);}
function dismissToast(){clearTimeout(toastTimer);$('#screen-toast').hidden=true;}
function chime(kind='select'){
  if(!soundEnabled)return;
  try{audioContext ||=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});const notes=kind==='win'?[523.25,659.25,783.99,1046.5]:kind==='wrong'?[220,196]:[659.25,880];notes.forEach((frequency,i)=>{const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();const time=audioContext.currentTime+i*.09;oscillator.type='square';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.025,time);gain.gain.exponentialRampToValueAtTime(.0001,time+.18);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(time);oscillator.stop(time+.2);});}catch{soundEnabled=false;$('#sound-toggle').setAttribute('aria-pressed','false');$('#sound-toggle').setAttribute('aria-label','开启游戏音效');}
}
async function changePage(next){
  if(transitioning||drawing)return;
  if(next<2)closeCompletion(false);
  if(next<0||next>=pages.length||next===pageIndex)return;
  if(next>0&&!unlocked){toast('先回答问题，解锁生日冒险。');$('#character-answer').focus();return;}
  if(next>=2&&collection.length<CONTENT.cards.length){toast('再收集 '+(CONTENT.cards.length-collection.length)+' 张签卡，就能打开信件。');return;}
  if(next>=2&&!completionSeen){showCompletion();return;}
  dismissToast();closeCard(false);transitioning=true;const current=$('#'+pages[pageIndex]);const target=$('#'+pages[next]);
  if(next===3){
    const trigger=$('#to-finale'),label=$('#finale-launch-label');
    trigger.disabled=true;trigger.setAttribute('aria-busy','true');label.textContent='星空准备中…';
    try{await prepareFinale();}
    catch{transitioning=false;toast('星空暂时没加载好，再点一次试试。');return;}
    finally{trigger.disabled=false;trigger.removeAttribute('aria-busy');label.textContent='还有一句话';}
  }
  current.classList.add('page-leaving');await delay(reducedMotion()?0:150);current.hidden=true;current.classList.remove('page-leaving');target.hidden=false;target.classList.add('page-entering');target.scrollTop=0;pageIndex=next;
  await delay(reducedMotion()?0:230);target.classList.remove('page-entering');transitioning=false;
  if(next===1)$('#draw-button').focus({preventScroll:true});else if(next===2)$('#back-to-cards').focus({preventScroll:true});else if(next===3)$('#back-to-letter').focus({preventScroll:true});else $('#character-answer').focus({preventScroll:true});
}
async function unlock(event){
  event.preventDefault();if(transitioning)return;
  const input=$('#character-answer');const status=$('#answer-status');
  if(input.value!==CONTENT.answer){status.textContent=input.value?'好像不对哦，再想一想？':'先写下那个角色的名字吧。';status.className='answer-status error';input.setAttribute('aria-invalid','true');$('#unlock-form').classList.remove('wrong-answer');void $('#unlock-form').offsetWidth;$('#unlock-form').classList.add('wrong-answer');chime('wrong');input.focus();return;}
  input.removeAttribute('aria-invalid');status.textContent='回答正确！生日冒险正在开启……';status.className='answer-status success';unlocked=true;chime('win');$('#unlock-button').disabled=true;await delay(reducedMotion()?0:450);await changePage(1);$('#unlock-button').disabled=false;
}
function renderCollection(){
  const shelf=$('#card-shelf');shelf.replaceChildren();
  for(const card of CONTENT.cards){const place=CARD_PLACES[card.id];const got=collection.includes(card.id);const button=document.createElement('button');button.type='button';button.className='shelf-card map-card'+(got?' collected':'');button.disabled=!got;button.dataset.cardId=card.id;button.style.left=place.x+'%';button.style.top=place.y+'%';button.style.setProperty('--card-color',place.color);button.title=place.name+' · '+card.title;const name=card.title||`第 ${card.id} 张`;button.setAttribute('aria-label',got?`查看${name}签卡，${place.name}`:`${place.name}的${name}签卡，尚未收集`);
    if(got){const illustration=document.createElement('span');illustration.className='mini-illustration';if(card.image){const img=document.createElement('img');img.src=card.image;img.alt=card.imageAlt||card.title||`第 ${card.id} 张签卡插图`;illustration.append(img);}button.append(illustration);button.addEventListener('click',()=>showCard(card.id,false));}
    else{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','card-back-star');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#pixel-star');svg.append(use);button.append(svg);}
    const label=document.createElement('span');label.className='shelf-card-label';label.textContent=card.title||card.id;button.append(label);const location=document.createElement('span');location.className='map-place-name';location.textContent=place.name;button.append(location);shelf.append(button);
  }
  const complete=collection.length===CONTENT.cards.length;
  $('#collection-count').textContent=`${collection.length} / ${CONTENT.cards.length}`;$('#shelf-status').textContent=`${collection.length} / ${CONTENT.cards.length} COLLECTED`;
  $('#to-letter').disabled=!complete;$('#letter-cta').textContent=complete?(completionSeen?'打开信件':'召唤奶蛙'):'集齐后读信';
  $('#draw-button').textContent=complete?(completionSeen?'五张集齐了，去读信 ▶':'五蛙集齐，召唤奶蛙 ✦'):'抽取一张签卡 ✦';$('#draw-button').disabled=drawing;
  $('#draw-message').textContent=complete?'五个地点的祝福，全部收集完成。':'打开宝箱，点亮地图上的一份祝福。';
}
async function drawCard(){
  if(!unlocked||pageIndex!==1||transitioning||drawing)return;
  if(collection.length===CONTENT.cards.length){await changePage(2);return;}
  dismissToast();closeCard(false);drawing=true;$('#draw-button').disabled=true;$('#pixel-chest').classList.add('drawing');$('#draw-message').textContent='宝箱里，有一份小幸运正在醒来……';chime();
  await delay(reducedMotion()?80:1050);
  const remaining=CONTENT.cards.filter(card=>!collection.includes(card.id));const random=new Uint32Array(1);crypto.getRandomValues(random);const card=remaining[Math.floor(random[0]/4294967296*remaining.length)];
  collection.push(card.id);persist();drawing=false;$('#pixel-chest').classList.remove('drawing');renderCollection();showCard(card.id,true);particles();chime('win');
}
function showCard(id,isNew){
  if(!unlocked||pageIndex!==1||drawing||transitioning)return;
  const card=CONTENT.cards.find(item=>item.id===id);if(!card)return;activeCard=id;activeCardIsNew=isNew;overlayReturnFocus=document.activeElement;
  $('#reveal-heading').textContent=isNew?'NEW CARD · A LITTLE LUCK FOR YOU':'YOUR LITTLE LUCK COLLECTION';$('#reveal-number').textContent='CARD '+card.id;
  const illustration=$('#reveal-illustration');illustration.replaceChildren();illustration.removeAttribute('aria-label');if(card.image){const image=document.createElement('img');image.src=card.image;image.alt=card.imageAlt||card.title||`第 ${card.id} 张签卡插图`;illustration.append(image);}else illustration.setAttribute('aria-label','空白插图区域');
  $('#reveal-title').textContent=card.title;$('#reveal-title').hidden=!card.title;$('#reveal-text').textContent=card.text;
  $('#reveal-card').classList.toggle('has-copy',Boolean(card.title||card.text));
  $('#reveal-card').setAttribute('aria-label',card.title||`第 ${card.id} 张生日签卡`);
  $('#draw-next').textContent=collection.length===CONTENT.cards.length?(completionSeen?'打开信件 ▶':'召唤奶蛙 ▶'):'再抽一张 ▶';$('#close-card').textContent=isNew?'收进收藏夹':'返回收藏夹';
  $('#screen-pages').inert=true;$('#card-overlay').hidden=false;$('#close-card').focus({preventScroll:true});
}
function closeCard(restoreFocus=true){if($('#card-overlay').hidden)return;$('#card-overlay').hidden=true;$('#screen-pages').inert=false;activeCard=null;activeCardIsNew=false;if(restoreFocus&&overlayReturnFocus?.isConnected)overlayReturnFocus.focus({preventScroll:true});}
function acceptCard(){const summon=activeCardIsNew&&collection.length===CONTENT.cards.length&&!completionSeen;closeCard(!summon);if(summon)showCompletion();}
function showCompletion(){if(!unlocked||drawing||transitioning||completionSeen||collection.length!==CONTENT.cards.length)return;dismissToast();closeCard(false);$('#screen-pages').inert=true;$('#completion-overlay').hidden=false;$('#completion-continue').focus({preventScroll:true});particles();chime('win');}
function closeCompletion(restoreFocus=true){if($('#completion-overlay').hidden)return;$('#completion-overlay').hidden=true;$('#screen-pages').inert=false;if(restoreFocus)$('#to-letter').focus({preventScroll:true});}
async function continueCompletion(){if($('#completion-overlay').hidden||transitioning||drawing)return;completionSeen=true;closeCompletion(false);renderCollection();await changePage(2);}
function particles(){if(reducedMotion())return;const host=$('#screen-particles');for(let i=0;i<17;i++){const piece=document.createElement('i');piece.style.left=`${25+Math.random()*50}%`;piece.style.top=`${10+Math.random()*15}%`;piece.style.background=['#ffe3a0','#e9a0a0','#b9dc87'][i%3];piece.style.setProperty('--drift',`${(Math.random()-.5)*110}px`);host.append(piece);piece.addEventListener('animationend',()=>piece.remove(),{once:true});}}
function fillLetter(){const letter=CONTENT.letter;$('#letter-title').textContent=letter.title;$('#letter-title').hidden=!letter.title;$('#letter-text').textContent=letter.text;$('#letter-signature').textContent=letter.signature;$('#letter-signature').hidden=!letter.signature;$('#letter-page article').setAttribute('aria-label',letter.text?'给 Shannon 的生日祝福':'生日祝福，等待后续填入');}
function nextPage(){if(!$('#completion-overlay').hidden){continueCompletion();return;}if(!$('#card-overlay').hidden){acceptCard();return;}if(pageIndex===0){if(unlocked)changePage(1);else{toast('输入你最喜欢的角色，开始冒险。');$('#character-answer').focus();}}else if(pageIndex<pages.length-1)changePage(pageIndex+1);}
function previousPage(){if(!$('#completion-overlay').hidden){closeCompletion();return;}if(!$('#card-overlay').hidden){closeCard();return;}if(pageIndex>0)changePage(pageIndex-1);}
function confirmAction(){if(!$('#completion-overlay').hidden){continueCompletion();return;}if(!$('#card-overlay').hidden){acceptCard();return;}if(pageIndex===0)$('#unlock-form').requestSubmit();else if(pageIndex===1)drawCard();else if(pageIndex===2)changePage(3);}
function navigateDirection(direction){if(direction==='left'||direction==='up')previousPage();else if(direction==='right'||direction==='down')nextPage();}
$('#unlock-form').addEventListener('submit',unlock);
$('#character-answer').addEventListener('input',()=>{$('#character-answer').removeAttribute('aria-invalid');$('#answer-status').className='answer-status';$('#answer-status').textContent='只有你知道的答案，才能打开这份礼物。';});
$('#draw-button').addEventListener('click',drawCard);$('#close-card').addEventListener('click',acceptCard);$('#completion-continue').addEventListener('click',continueCompletion);
$('#draw-next').addEventListener('click',()=>{closeCard(false);if(collection.length===CONTENT.cards.length)changePage(2);else drawCard();});
$('#to-letter').addEventListener('click',()=>changePage(2));$('#back-to-cards').addEventListener('click',()=>changePage(1));$('#back-to-unlock').addEventListener('click',()=>changePage(0));
$('#to-finale').addEventListener('click',()=>changePage(3));$('#back-to-letter').addEventListener('click',()=>changePage(2));
$('#back-minus').addEventListener('click',previousPage);$('#next-plus').addEventListener('click',nextPage);
$('#home-button').addEventListener('click',()=>{closeCard(false);changePage(0);});$('#brand-home').addEventListener('click',event=>{event.preventDefault();closeCard(false);changePage(0);});
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>navigateDirection(button.dataset.direction)));
document.querySelectorAll('[data-game-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.gameAction;if(action==='a')confirmAction();else if(action==='b')previousPage();else if(unlocked){closeCompletion(false);closeCard(false);changePage(1);}else toast('先解锁生日冒险，再查看收藏。');}));
$('#sound-toggle').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('#sound-toggle').setAttribute('aria-pressed',String(soundEnabled));$('#sound-toggle').setAttribute('aria-label',soundEnabled?'关闭游戏音效':'开启游戏音效');if(soundEnabled)chime();});
$('#card-overlay').addEventListener('keydown',event=>{if(event.key==='Tab'){const first=$('#close-card'),last=$('#draw-next');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
$('#completion-overlay').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();$('#completion-continue').focus();}});
document.addEventListener('keydown',event=>{if(event.isComposing)return;if(event.key==='Escape'){if(!$('#completion-overlay').hidden){event.preventDefault();closeCompletion();}else if(!$('#card-overlay').hidden){event.preventDefault();closeCard();}return;}if(event.target.matches('input,textarea'))return;const direction={ArrowLeft:'left',ArrowUp:'up',ArrowRight:'right',ArrowDown:'down'}[event.key];if(direction){event.preventDefault();navigateDirection(direction);}});
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY&&!drawing){collection=readCollection();renderCollection();}});
renderCollection();fillLetter();
prepareFinale().catch(()=>{});
